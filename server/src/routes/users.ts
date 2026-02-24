import { Hono } from 'hono'
import { db } from '../db/index.js'
import { user, subscription, post, creatorProfile } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const usersRoutes = new Hono()

// PUT /api/users/:id — update user profile (e.g. image)
usersRoutes.put('/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { image, name, role } = body

    if (image === undefined && name === undefined && role === undefined) {
        return c.json({ error: 'Nothing to update' }, 400)
    }

    const [updatedUser] = await db
        .update(user)
        .set({
            ...(image !== undefined && { image }),
            ...(name !== undefined && { name }),
            ...(role !== undefined && { role }),
            updatedAt: new Date(),
        })
        .where(eq(user.id, id))
        .returning()

    if (!updatedUser) {
        return c.json({ error: 'User not found' }, 404)
    }

    return c.json(updatedUser)
})

// POST /api/users/check-email — check if email exists
usersRoutes.post('/check-email', async (c) => {
    const { email } = await c.req.json()
    if (!email) return c.json({ error: 'Email required' }, 400)

    const [found] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1)
    return c.json({ exists: !!found })
})

// GET /api/users/:id/export — export user data
usersRoutes.get('/:id/export', async (c) => {
    const id = c.req.param('id')

    // Fetch user profile
    const [userProfile] = await db.select().from(user).where(eq(user.id, id))

    if (!userProfile) {
        return c.json({ error: 'User not found' }, 404)
    }

    // Fetch related data
    const userSubscriptions = await db.select().from(subscription).where(eq(subscription.subscriberUserId, id))

    // Check if user is a creator
    let creatorData = null
    let creatorPosts: any[] = []

    if (userProfile.role === 'creator') {
        const [profile] = await db.select().from(creatorProfile).where(eq(creatorProfile.userId, id))
        if (profile) {
            creatorData = profile
            creatorPosts = await db.select().from(post).where(eq(post.creatorId, profile.id))
        }
    }

    const exportData = {
        profile: userProfile,
        subscriptions: userSubscriptions,
        creatorProfile: creatorData,
        posts: creatorPosts,
        exportedAt: new Date().toISOString()
    }

    return c.json(exportData)
})

export default usersRoutes
