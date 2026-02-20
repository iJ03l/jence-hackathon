import { Hono } from 'hono'
import { db } from '../db/index.js'
import { subscription, creatorProfile } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'

const subscriptionsRoutes = new Hono()

// POST /api/subscriptions — subscribe to a creator
subscriptionsRoutes.post('/', async (c) => {
    const body = await c.req.json()
    const { subscriberUserId, creatorProfileId, txSignature } = body

    if (!subscriberUserId || !creatorProfileId) {
        return c.json({ error: 'Missing required fields' }, 400)
    }

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

    // Look up the creator's subscription price
    const [creator] = await db
        .select({ subscriptionPrice: creatorProfile.subscriptionPrice })
        .from(creatorProfile)
        .where(eq(creatorProfile.id, creatorProfileId))

    if (!creator) {
        return c.json({ error: 'Creator not found' }, 404)
    }

    const price = parseFloat(creator.subscriptionPrice || '0')

    // If price > 0, a transaction signature is required
    if (price > 0 && !txSignature) {
        return c.json({ error: 'Payment required. Please provide a transaction signature.' }, 402)
    }

    // TODO: For production, verify the transaction on-chain:
    // 1. Use @solana/web3.js Connection.getTransaction(txSignature) 
    // 2. Verify it contains correct USDC transfers to creator + platform wallets
    // 3. Verify the amounts match the expected price and split
    // For now, we trust the txSignature if provided

    const [sub] = await db.insert(subscription).values({
        subscriberUserId,
        creatorProfileId,
        txSignature: txSignature || null,
        amountUsdc: price > 0 ? String(price) : null,
    }).returning()

    return c.json(sub, 201)
})

// DELETE /api/subscriptions/:id — unsubscribe
subscriptionsRoutes.delete('/:id', async (c) => {
    const id = c.req.param('id')

    const [deleted] = await db
        .delete(subscription)
        .where(eq(subscription.id, id))
        .returning()

    if (!deleted) {
        return c.json({ error: 'Subscription not found' }, 404)
    }

    return c.json({ success: true })
})

export default subscriptionsRoutes
