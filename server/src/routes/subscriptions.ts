import { Hono } from 'hono'
import { db } from '../db/index.js'
import { subscription, creatorProfile, wallet, notification } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { decryptPrivateKey } from '../lib/kms.js'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth.js'
import { sendUsdcWithSplit, formatUFix64 } from '../lib/flow-tx.js'

const CREATOR_SHARE_PERCENT = parseInt(process.env.VITE_CREATOR_PAYOUT_PERCENT || '80', 10)

type Variables = {
    user: any
    authSession: any
}

const subscriptionsRoutes = new Hono<{ Variables: Variables }>()

// POST /api/subscriptions — subscribe to a creator
subscriptionsRoutes.post('/', requireAuth, zValidator('json', z.object({
    creatorProfileId: z.string().uuid()
})), async (c) => {
    const { creatorProfileId } = c.req.valid('json')
    const userFromSession = c.get('user')
    const subscriberUserId = userFromSession.id

    // Check if already subscribed
    const [existing] = await db
        .select()
        .from(subscription)
        .where(
            and(
                eq(subscription.subscriberUserId, subscriberUserId),
                eq(subscription.creatorProfileId, creatorProfileId)
            )
        )

    if (existing) {
        return c.json({ error: 'Already subscribed' }, 409)
    }

    // Look up creator
    const [creator] = await db
        .select({ subscriptionPrice: creatorProfile.subscriptionPrice, payoutAddress: creatorProfile.payoutAddress, userId: creatorProfile.userId })
        .from(creatorProfile)
        .where(eq(creatorProfile.id, creatorProfileId))

    if (!creator) {
        return c.json({ error: 'Creator not found' }, 404)
    }

    const price = parseFloat(creator.subscriptionPrice || '0')
    let txId = null

    console.log(`[SUB] Subscriber ${subscriberUserId} -> Creator ${creatorProfileId} | Price: $${price} USDC`)

    // If price > 0, we must process the initial payment via Flow
    if (price > 0) {
        console.log(`[SUB] Paid subscription — building Flow USDC transfer...`)
        let finalCreatorPayoutAddress = creator.payoutAddress

        if (!finalCreatorPayoutAddress) {
            const [creatorWallet] = await db.select().from(wallet).where(eq(wallet.userId, creator.userId))
            if (creatorWallet) {
                finalCreatorPayoutAddress = creatorWallet.publicKey
            } else {
                return c.json({ error: 'Creator has not set up a payout wallet yet.' }, 400)
            }
        }

        const [subscriberWallet] = await db.select().from(wallet).where(eq(wallet.userId, subscriberUserId))
        if (!subscriberWallet) {
            return c.json({ error: 'You do not have a wallet set up. Please go to Settings to create one.' }, 400)
        }

        try {
            const subscriberPrivateKey = decryptPrivateKey(
                subscriberWallet.encryptedPrivateKey,
                subscriberWallet.iv,
                subscriberWallet.authTag
            )
            const platformWalletAddr = process.env.FLOW_PLATFORM_WALLET

            txId = await sendUsdcWithSplit({
                senderAddress: subscriberWallet.publicKey,
                senderPrivateKey: subscriberPrivateKey,
                senderKeyIndex: 0,
                creatorAddress: finalCreatorPayoutAddress,
                platformAddress: platformWalletAddr,
                totalUsdc: price,
                creatorSharePercent: CREATOR_SHARE_PERCENT,
            })

            console.log(`[SUB] ✅ Payment broadcast! TX: ${txId}`)
            console.log(`[SUB]    Flowscan: https://flowscan.io/transaction/${txId}`)
        } catch (error: any) {
            console.error('Subscription payment error:', error)
            return c.json({ error: 'Payment failed. Ensure your wallet has enough USDC.' }, 402)
        }
    } else {
        console.log(`[SUB] Free subscription — no USDC payment processed.`)
    }

    // Set next billing date to 30 days from now
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + 30)

    const [sub] = await db.insert(subscription).values({
        subscriberUserId,
        creatorProfileId,
        txSignature: txId,
        amountUsdc: price > 0 ? String(price) : null,
        nextBillingDate: nextDate,
        status: 'active'
    }).returning()

    // Add Notification for creator
    await db.insert(notification).values({
        userId: creator.userId,
        type: 'new_subscription',
        title: 'New Subscriber!',
        body: `@${userFromSession.username || userFromSession.name} just subscribed to your content.`,
    })

    console.log(`[SUB] ✅ Subscription ${sub.id} created | Next billing: ${nextDate.toISOString()} | TX: ${txId || 'N/A (free)'}`)

    return c.json(sub, 201)
})

// DELETE /api/subscriptions/:id — unsubscribe
subscriptionsRoutes.delete('/:id', requireAuth, async (c) => {
    const id = c.req.param('id')
    const userFromSession = c.get('user')

    const [deleted] = await db
        .delete(subscription)
        .where(and(eq(subscription.id, id), eq(subscription.subscriberUserId, userFromSession.id)))
        .returning()

    if (!deleted) {
        return c.json({ error: 'Subscription not found or unauthorized' }, 404)
    }

    return c.json({ success: true })
})

export default subscriptionsRoutes
