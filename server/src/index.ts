import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { setGlobalDispatcher, Agent } from 'undici'

// Fix Node.js 18+ fetch ETIMEDOUT bug — autoSelectFamily tries both IPv4/IPv6
// concurrently (Happy Eyeballs) so Google OAuth token exchange doesn't time out
setGlobalDispatcher(new Agent({
    connect: { timeout: 60_000 },
    autoSelectFamily: true,
    autoSelectFamilyAttemptTimeout: 2_000,
}))

import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import verticalsRoutes from './routes/verticals.js'
import creatorsRoutes from './routes/creators.js'
import postsRoutes from './routes/posts.js'
import subscriptionsRoutes from './routes/subscriptions.js'
import notificationsRoutes from './routes/notifications.js'
import communityRoutes from './routes/community.js'
import uploadRoutes from './routes/upload.js'
import privyRoutes from './routes/privy.js'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
    origin: (origin) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'https://jence.xyz',
            'https://www.jence.xyz',
            ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, '')] : [])
        ]
        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
            return origin
        }
        return allowedOrigins[1] // Default to production site
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
}))

// Health check
app.get('/', (c) => {
    return c.json({
        name: 'Jence API',
        version: '1.0.0',
        description: 'Expert sector research platform — anonymous and crypto-settled',
    })
})

// Mount routes
app.route('/api/auth', authRoutes)
app.route('/api/users', usersRoutes)
app.route('/api/verticals', verticalsRoutes)
app.route('/api/creators', creatorsRoutes)
app.route('/api/posts', postsRoutes)
app.route('/api/subscriptions', subscriptionsRoutes)
app.route('/api/notifications', notificationsRoutes)
app.route('/api/community', communityRoutes)
app.route('/api/upload', uploadRoutes)
app.route('/api/privy', privyRoutes)

// Start server
const port = parseInt(process.env.PORT || '8080', 10)

serve({
    fetch: app.fetch,
    port,
    hostname: '0.0.0.0', // Listen on all network interfaces
}, (info) => {
    console.log(`🚀 Jence server running on http://localhost:${info.port}`)
})

export default app
