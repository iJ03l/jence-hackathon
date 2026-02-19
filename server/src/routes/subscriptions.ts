import { Hono } from 'hono'
import { db } from '../db/index.js'
import { subscription } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'

const subscriptionsRoutes = new Hono()

// POST /api/subscriptions — subscribe to a creator
subscriptionsRoutes.post('/', async (c) => {
    const body = await c.req.json()
    const { subscriberUserId, creatorProfileId } = body

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

    const [sub] = await db.insert(subscription).values({
        subscriberUserId,
        creatorProfileId,
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
