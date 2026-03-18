import { Hono } from 'hono'
import { db } from '../db/index.js'
import { creatorProfile, launchNote, notification, post, tip, wallet } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth.js'
import { decryptWallet } from '../lib/kms.js'
import { getRelayerKeypair, getRpcConnection } from '../lib/relayer.js'
import { getUsdcBalance, getUsdcAta, toUsdcMinorUnits, USDC_MINT } from '../lib/usdc.js'
import { PublicKey, Transaction } from '@solana/web3.js'
import {
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
} from '@solana/spl-token'

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
    const amountMinorUnits = toUsdcMinorUnits(amountUsdc)

    const tipTarget: TipTarget =
        creatorProfileId
            ? { type: 'creator', creatorProfileId }
            : postId
                ? { type: 'post', postId }
                : { type: 'launch', launchNoteId: launchNoteId! }

    if (amountMinorUnits <= 0) {
        return c.json({ error: 'Tip amount must be greater than zero.' }, 400)
    }

    const [tipperWallet] = await db
        .select()
        .from(wallet)
        .where(eq(wallet.userId, userFromSession.id))

    if (!tipperWallet) {
        return c.json({ error: 'You need an embedded wallet before you can tip.' }, 400)
    }

    const tipperKeypair = decryptWallet(
        tipperWallet.encryptedPrivateKey,
        tipperWallet.iv,
        tipperWallet.authTag
    )
    const tipperPubkey = tipperKeypair.publicKey

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

    const connection = getRpcConnection()
    const availableBalance = await getUsdcBalance(tipperPubkey, connection)
    if (availableBalance < amountUsdc) {
        return c.json({ error: 'Insufficient USDC balance in your wallet.' }, 402)
    }

    let recipientPubkey: PublicKey
    try {
        recipientPubkey = new PublicKey(recipientWalletAddress)
    } catch {
        return c.json({ error: 'Recipient payout address is invalid.' }, 400)
    }
    const recipientAta = getUsdcAta(recipientPubkey)
    const tipperAta = getUsdcAta(tipperPubkey)
    const relayer = getRelayerKeypair()
    const transaction = new Transaction()

    const recipientAtaInfo = await connection.getAccountInfo(recipientAta)
    if (!recipientAtaInfo) {
        transaction.add(
            createAssociatedTokenAccountInstruction(
                relayer.publicKey,
                recipientAta,
                recipientPubkey,
                USDC_MINT,
            )
        )
    }

    transaction.add(
        createTransferInstruction(
            tipperAta,
            recipientAta,
            tipperPubkey,
            amountMinorUnits,
        )
    )

    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = relayer.publicKey
    transaction.sign(tipperKeypair, relayer)

    let txSignature: string | null = null
    try {
        txSignature = await connection.sendRawTransaction(transaction.serialize(), {
            skipPreflight: true,
            maxRetries: 3,
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
        txSignature,
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
        txSignature,
        amountUsdc,
    }, 201)
})

export default tipRoutes
