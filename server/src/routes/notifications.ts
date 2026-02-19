import { Hono } from 'hono'
import { db } from '../db/index.js'
import { notification, post, vertical } from '../db/schema.js'
import { eq, desc, and } from 'drizzle-orm'

const notificationsRoutes = new Hono()

// GET /api/notifications?userId=xxx — get user's notifications
notificationsRoutes.get('/', async (c) => {
    const userId = c.req.query('userId')
    if (!userId) return c.json({ error: 'userId is required' }, 400)

    const items = await db
        .select({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            postId: notification.postId,
            creatorPseudonym: notification.creatorPseudonym,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            // Joined fields
            verticalSlug: vertical.slug,
        })
        .from(notification)
        .leftJoin(post, eq(notification.postId, post.id))
        .leftJoin(vertical, eq(post.verticalId, vertical.id))
        .where(eq(notification.userId, userId))
        .orderBy(desc(notification.createdAt))
        .limit(50)

    return c.json(items)
})

// GET /api/notifications/unread-count?userId=xxx
notificationsRoutes.get('/unread-count', async (c) => {
    const userId = c.req.query('userId')
    if (!userId) return c.json({ error: 'userId is required' }, 400)

    const items = await db
        .select()
        .from(notification)
        .where(and(eq(notification.userId, userId), eq(notification.isRead, false)))

    return c.json({ count: items.length })
})

// POST /api/notifications/mark-read — mark all as read
notificationsRoutes.post('/mark-read', async (c) => {
    const { userId } = await c.req.json()
    if (!userId) return c.json({ error: 'userId is required' }, 400)

    await db
        .update(notification)
        .set({ isRead: true })
        .where(and(eq(notification.userId, userId), eq(notification.isRead, false)))

    return c.json({ success: true })
})

export default notificationsRoutes
