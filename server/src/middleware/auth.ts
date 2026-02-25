import { createMiddleware } from 'hono/factory'
import { auth } from '../auth.js'

// Extracts the Better Auth session from the incoming request.
// Use this for routes that REQUIRE authentication.
export const requireAuth = createMiddleware(async (c, next) => {
    // 1. Convert hono request to standard node request for better-auth
    // (Better-auth provides API handler, we just query the session)
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    })

    if (!session || !session.user || !session.session) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    if (session.user.isBanned) {
        return c.json({ error: 'Account suspended.' }, 403)
    }

    // Pass the user and session down via context
    c.set('user', session.user)
    c.set('authSession', session.session)

    await next()
})

// Use this for routes where auth is OPTIONAL but helpful (like the public feed to check subscriptions)
export const optionalAuth = createMiddleware(async (c, next) => {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    })

    if (session && session.user) {
        c.set('user', session.user)
        c.set('authSession', session.session)
    }

    await next()
})
