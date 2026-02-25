import { Hono } from 'hono'
import { db } from '../db/index.js'
import { user, subscription, post, creatorProfile } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth } from '../middleware/auth.js'

type Variables = {
    user: any
    authSession: any
}

const usersRoutes = new Hono<{ Variables: Variables }>()

// PUT /api/users/:id — update user profile (e.g. image)
usersRoutes.put('/:id', requireAuth, zValidator('json', z.object({
    image: z.string().url().optional(),
    name: z.string().min(1).optional(),
    role: z.enum(['subscriber', 'creator', 'admin']).optional()
})), async (c) => {
    const id = c.req.param('id')
    const { image, name, role } = c.req.valid('json')
    const sessionUser = c.get('user')

    // Only admins or the user themselves can update their profile
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
        return c.json({ error: 'Forbidden' }, 403)
    }

    // Only admins can change roles
    const safeRole = sessionUser.role === 'admin' ? role : undefined

    if (image === undefined && name === undefined && safeRole === undefined) {
        return c.json({ error: 'Nothing to update' }, 400)
    }

    const [updatedUser] = await db
        .update(user)
        .set({
            ...(image !== undefined && { image }),
            ...(name !== undefined && { name }),
            ...(safeRole !== undefined && { role: safeRole }),
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
usersRoutes.post('/check-email', zValidator('json', z.object({
    email: z.string().email()
})), async (c) => {
    const { email } = c.req.valid('json')

    const [found] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1)
    return c.json({ exists: !!found })
})

// GET /api/users/:id/export — export user data
usersRoutes.get('/:id/export', requireAuth, async (c) => {
    const id = c.req.param('id')
    const sessionUser = c.get('user')

    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
        return c.json({ error: 'Forbidden' }, 403)
    }

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

// PUT /api/users/:id/ban — toggle ban status (admins only)
usersRoutes.put('/:id/ban', requireAuth, zValidator('json', z.object({
    isBanned: z.boolean()
})), async (c) => {
    const id = c.req.param('id')
    const { isBanned } = c.req.valid('json')
    const sessionUser = c.get('user')

    if (sessionUser.role !== 'admin') {
        return c.json({ error: 'Forbidden. Admins only.' }, 403)
    }

    const [updatedUser] = await db
        .update(user)
        .set({
            isBanned,
            updatedAt: new Date(),
        })
        .where(eq(user.id, id))
        .returning()

    if (!updatedUser) {
        return c.json({ error: 'User not found' }, 404)
    }

    // Also update creator profile if they have one
    const [creator] = await db.select().from(creatorProfile).where(eq(creatorProfile.userId, id))
    if (creator) {
        await db.update(creatorProfile).set({ isBanned }).where(eq(creatorProfile.id, creator.id))
    }

    return c.json(updatedUser)
})

export default usersRoutes
