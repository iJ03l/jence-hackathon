import { Hono } from 'hono'
import { db } from '../db/index.js'
import { creatorProfile, launchNote, notification, post, tip, wallet } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth.js'
import { decryptPrivateKey } from '../lib/kms.js'
import { getUsdcBalance, toUsdcMinorUnits } from '../lib/usdc.js'
import { sendUsdcWithSplit, formatUFix64, sendUsdcTransfer } from '../lib/flow-tx.js'

type Variables = {
    user: any
    authSession: any
}

const tipRoutes = new Hono<{ Variables: Variables }>()

const tipSchema = z.object({
    amountUsdc: z.coerce.number().positive().max(100000),
    creatorProfileId: z.string().uuid().optional(),
    postId: z.string().uuid().optional(),
    launchNoteId: z.string().uuid().optional(),
}).superRefine((value, ctx) => {
    const targets = [value.creatorProfileId, value.postId, value.launchNoteId].filter(Boolean)
    if (targets.length !== 1) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['creatorProfileId'],
            message: 'Choose exactly one tip target.',
        })
    }
})

type TipTarget =
    | { type: 'creator'; creatorProfileId: string }
    | { type: 'post'; postId: string }
    | { type: 'launch'; launchNoteId: string }

async function resolveRecipientWallet(userId: string) {
    const [creator] = await db
        .select({
            creatorProfileId: creatorProfile.id,
            payoutAddress: creatorProfile.payoutAddress,
            pseudonym: creatorProfile.pseudonym,
        })
        .from(creatorProfile)
        .where(eq(creatorProfile.userId, userId))

    if (creator?.payoutAddress) {
        return {
            address: creator.payoutAddress,
            displayName: creator.pseudonym,
            creatorProfileId: creator.creatorProfileId,
        }
    }

    const [userWallet] = await db
        .select({
            publicKey: wallet.publicKey,
        })
        .from(wallet)
        .where(eq(wallet.userId, userId))

    if (userWallet) {
        return {
            address: userWallet.publicKey,
            displayName: creator?.pseudonym,
            creatorProfileId: creator?.creatorProfileId || null,
        }
    }

    return null
}

tipRoutes.post('/', requireAuth, zValidator('json', tipSchema), async (c) => {
    const userFromSession = c.get('user')
    const { amountUsdc, creatorProfileId, postId, launchNoteId } = c.req.valid('json')

    const tipTarget: TipTarget =
        creatorProfileId
            ? { type: 'creator', creatorProfileId }
            : postId
                ? { type: 'post', postId }
                : { type: 'launch', launchNoteId: launchNoteId! }

    if (amountUsdc <= 0) {
        return c.json({ error: 'Tip amount must be greater than zero.' }, 400)
    }

    const [tipperWallet] = await db
        .select()
        .from(wallet)
        .where(eq(wallet.userId, userFromSession.id))

    if (!tipperWallet) {
        return c.json({ error: 'You need an embedded wallet before you can tip.' }, 400)
    }

    const tipperPrivateKey = decryptPrivateKey(
        tipperWallet.encryptedPrivateKey,
        tipperWallet.iv,
        tipperWallet.authTag
    )
    const tipperAddress = tipperWallet.publicKey

    let recipientUserId: string | null = null
    let recipientWalletAddress: string | null = null
    let tipLabel = 'creator'
    let targetCreatorProfileId: string | null = null

    if (tipTarget.type === 'creator') {
        const [creator] = await db
            .select({
                id: creatorProfile.id,
                userId: creatorProfile.userId,
                pseudonym: creatorProfile.pseudonym,
                isBanned: creatorProfile.isBanned,
            })
            .from(creatorProfile)
            .where(eq(creatorProfile.id, tipTarget.creatorProfileId))

        if (!creator) {
            return c.json({ error: 'Creator not found.' }, 404)
        }
        if (creator.isBanned) {
            return c.json({ error: 'This creator cannot receive tips right now.' }, 403)
        }

        recipientUserId = creator.userId
        tipLabel = creator.pseudonym
        targetCreatorProfileId = creator.id

        const recipient = await resolveRecipientWallet(creator.userId)
        if (!recipient?.address) {
            return c.json({ error: 'This creator has not set up a payout wallet yet.' }, 400)
        }
        recipientWalletAddress = recipient.address
    } else if (tipTarget.type === 'post') {
        const [targetPost] = await db
            .select({
                id: post.id,
                title: post.title,
                allowTips: post.allowTips,
                isPublished: post.isPublished,
                moderationStatus: post.moderationStatus,
                creatorProfileId: creatorProfile.id,
                creatorUserId: creatorProfile.userId,
                creatorPseudonym: creatorProfile.pseudonym,
                creatorIsBanned: creatorProfile.isBanned,
            })
            .from(post)
            .innerJoin(creatorProfile, eq(post.creatorId, creatorProfile.id))
            .where(eq(post.id, tipTarget.postId))

        if (!targetPost) {
            return c.json({ error: 'Post not found.' }, 404)
        }
        if (!targetPost.isPublished || targetPost.moderationStatus !== 'published') {
            return c.json({ error: 'This article is not live yet.' }, 403)
        }
        if (!targetPost.allowTips) {
            return c.json({ error: 'This article is not accepting tips.' }, 403)
        }
        if (targetPost.creatorIsBanned) {
            return c.json({ error: 'This creator cannot receive tips right now.' }, 403)
        }

        recipientUserId = targetPost.creatorUserId
        tipLabel = targetPost.creatorPseudonym || targetPost.title
        targetCreatorProfileId = targetPost.creatorProfileId

        const recipient = await resolveRecipientWallet(targetPost.creatorUserId)
        if (!recipient?.address) {
            return c.json({ error: 'This creator has not set up a payout wallet yet.' }, 400)
        }
        recipientWalletAddress = recipient.address
    } else {
        const [targetLaunch] = await db
            .select({
                id: launchNote.id,
                name: launchNote.name,
                allowTips: launchNote.allowTips,
                status: launchNote.status,
                userId: launchNote.userId,
            })
            .from(launchNote)
            .where(eq(launchNote.id, tipTarget.launchNoteId))

        if (!targetLaunch) {
            return c.json({ error: 'Launch not found.' }, 404)
        }
        if (targetLaunch.status !== 'approved') {
            return c.json({ error: 'This launch is not live yet.' }, 403)
        }
        if (!targetLaunch.allowTips) {
            return c.json({ error: 'This launch is not accepting tips.' }, 403)
        }

        recipientUserId = targetLaunch.userId
        tipLabel = targetLaunch.name

        const recipient = await resolveRecipientWallet(targetLaunch.userId)
        if (!recipient?.address) {
            return c.json({ error: 'This launch author has not set up a payout wallet yet.' }, 400)
        }
        recipientWalletAddress = recipient.address
    }

    if (!recipientUserId || !recipientWalletAddress) {
        return c.json({ error: 'Unable to resolve tip recipient.' }, 400)
    }

    if (recipientUserId === userFromSession.id) {
        return c.json({ error: 'You cannot tip yourself.' }, 400)
    }

    const availableBalance = await getUsdcBalance(tipperAddress)
    if (availableBalance < amountUsdc) {
        return c.json({ error: 'Insufficient USDC balance in your wallet.' }, 402)
    }

    let txId: string | null = null
    try {
        // Send the full tip amount directly to the creator (no platform split on tips)
        txId = await sendUsdcTransfer({
            senderAddress: tipperAddress,
            senderPrivateKey: tipperPrivateKey,
            senderKeyIndex: 0,
            recipientAddress: recipientWalletAddress,
            amount: formatUFix64(amountUsdc),
        })
    } catch (error: any) {
        console.error('Tip transaction failed:', error)
        return c.json({ error: 'Tip transfer failed. Please try again.' }, 502)
    }

    const [createdTip] = await db.insert(tip).values({
        tipperUserId: userFromSession.id,
        recipientUserId,
        targetType: tipTarget.type,
        creatorProfileId: targetCreatorProfileId,
        postId: tipTarget.type === 'post' ? tipTarget.postId : null,
        launchNoteId: tipTarget.type === 'launch' ? tipTarget.launchNoteId : null,
        amountUsdc: amountUsdc.toFixed(2),
        txSignature: txId,
    }).returning()

    await db.insert(notification).values({
        userId: recipientUserId,
        type: 'tip_received',
        title: 'New tip received',
        body: `@${userFromSession.username || userFromSession.name} tipped ${tipLabel} $${amountUsdc.toFixed(2)} USDC.`,
    })

    return c.json({
        success: true,
        tip: createdTip,
        txId,
        amountUsdc,
    }, 201)
})

export default tipRoutes
