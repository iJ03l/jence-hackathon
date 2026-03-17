import { Hono } from 'hono'
import { db } from '../db/index.js'
import { user, creatorProfile, subscription, post, postVote } from '../db/schema.js'
import { count, eq, sql, desc, sum, and } from 'drizzle-orm'
import { auth } from '../auth.js'

const adminRoutes = new Hono()

// Middleware to ensure admin role
adminRoutes.use('*', async (c, next) => {
    // If running in development without auth headers, we could mock admin,
    // but BetterAuth requires the Session to be checked via API or DB.
    // For standard BetterAuth with Hono:
    const sessionCookie = c.req.header('cookie')
    // We can also just read the Auth context if integrated, but let's query DB using the auth wrapper logic
    // Actually, Better Auth `auth.api.getSession(c.req)` is cleaner:
    const s = await auth.api.getSession({
        headers: c.req.raw.headers
    })

    if (!s || !s.user) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    if (s.user.role !== 'admin') {
        return c.json({ error: 'Forbidden. Admin only access.' }, 403)
    }

    await next()
})

// GET /api/admin/metrics
// Returns total page views (not tracked yet easily, we'll dummy or use post likes for now),
// top articles, user counts, amount tipped
adminRoutes.get('/metrics', async (c) => {
    try {
        // User counts
        const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(user)
        
        const [{ totalCreators }] = await db.select({ totalCreators: count() })
            .from(user).where(eq(user.role, 'creator'))
        
        // Amount tipped (sum of all subscriptions tracked if we assume they are active tipped amounts)
        // Since subscriptionAmountUsdc is a string, we SQL cast it
        const [{ amountTipped }] = await db.select({
            amountTipped: sql<number>`SUM(CAST(${subscription.amountUsdc} AS numeric))`
        })
        .from(subscription)
        .where(eq(subscription.status, 'active'))

        // Top articles (by likes implicitly through postVote, but we can just use the post table if tracking total)
        const topArticles = await db.select({
            id: post.id,
            title: post.title,
            creatorPseudonym: creatorProfile.pseudonym,
            likes: sql<number>`(SELECT COALESCE(SUM(value), 0) FROM ${postVote} WHERE ${postVote.postId} = ${post.id})`.mapWith(Number),
            createdAt: post.createdAt
        })
        .from(post)
        .leftJoin(creatorProfile, eq(post.creatorId, creatorProfile.id))
        .orderBy(desc(sql`likes`))
        .limit(10)

        // Mocking total page views as we don't track metrics table yet
        const dummyPageViews = totalUsers * 154

        return c.json({
            metrics: {
                totalUsers,
                totalCreators,
                amountTipped: amountTipped || 0,
                pageViews: dummyPageViews
            },
            topArticles
        })

    } catch (error: any) {
        console.error('Admin metrics error:', error)
        return c.json({ error: 'Failed to fetch admin metrics' }, 500)
    }
})

// GET /api/admin/users
// Returns a searchable list of users
adminRoutes.get('/users', async (c) => {
    try {
        const query = c.req.query('q') || ''
        
        // We will fetch users and join with creator params
        let baseQuery = db.select({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            isBanned: user.isBanned,
            createdAt: user.createdAt,
            pseudonym: creatorProfile.pseudonym,
        })
        .from(user)
        .leftJoin(creatorProfile, eq(user.id, creatorProfile.userId))

        const results = await baseQuery.orderBy(desc(user.createdAt)).limit(100)

        // If simple search query present
        const filtered = query 
            ? results.filter(u => 
                (u.username?.toLowerCase().includes(query.toLowerCase())) ||
                (u.email?.toLowerCase().includes(query.toLowerCase())) ||
                (u.pseudonym?.toLowerCase().includes(query.toLowerCase()))
              )
            : results

        return c.json({ users: filtered })

    } catch (error: any) {
        return c.json({ error: 'Failed to fetch users' }, 500)
    }
})

// POST /api/admin/users/:id/ban
// Toggles the isBanned state of a user
adminRoutes.post('/users/:id/ban', async (c) => {
    try {
        const userId = c.req.param('id')
        const body = await c.req.json()
        const { isBanned } = body

        if (typeof isBanned !== 'boolean') {
            return c.json({ error: 'isBanned must be a boolean' }, 400)
        }

        await db.update(user)
            .set({ isBanned })
            .where(eq(user.id, userId))

        // Cascade to creatorProfile if exists
        await db.update(creatorProfile)
            .set({ isBanned })
            .where(eq(creatorProfile.userId, userId))

        return c.json({ success: true, isBanned })

    } catch (error: any) {
        return c.json({ error: 'Failed to toggle ban status' }, 500)
    }
})

export default adminRoutes
