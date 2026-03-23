import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
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
import tipsRoutes from './routes/tips.js'
import notificationsRoutes from './routes/notifications.js'
import communityRoutes from './routes/community.js'
import uploadRoutes from './routes/upload.js'
import walletRoutes from './routes/wallet.js'
import statsRoutes from './routes/stats.js'
import launchRoutes from './routes/launches.js'
import adminRoutes from './routes/admin.js'
import searchRoutes from './routes/search.js'
import shareRoutes from './routes/share.js'
import { startSubscriptionCron } from './cron/subscriptions.js'
import { resolveSpaStaticRoot } from './lib/spa.js'

const app = new Hono()
const SPA_STATIC_ROOT = resolveSpaStaticRoot()
const serveSpaStatic = serveStatic({ root: SPA_STATIC_ROOT })

// Middleware
app.use('*', secureHeaders())
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
    allowHeaders: ['Content-Type', 'Authorization', 'x-admin-token'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
}))

// Health check
app.get('/', (c) => {
    return c.json({
        name: 'Jence API',
        version: '1.0.0',
        description: 'Robotics and hardware engineering publication API',
    })
})

// Mount routes
app.route('/api/auth', authRoutes)
app.route('/api/users', usersRoutes)
app.route('/api/verticals', verticalsRoutes)
app.route('/api/creators', creatorsRoutes)
app.route('/api/posts', postsRoutes)
app.route('/api/subscriptions', subscriptionsRoutes)
app.route('/api/tips', tipsRoutes)
app.route('/api/notifications', notificationsRoutes)
app.route('/api/community', communityRoutes)
app.route('/api/upload', uploadRoutes)
app.route('/api/wallet', walletRoutes)
app.route('/api/stats', statsRoutes)
app.route('/api/launches', launchRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/search', searchRoutes)
app.route('/share', shareRoutes)
app.route('/', shareRoutes)

app.use('/assets/*', serveSpaStatic)
app.get('/:asset', async (c, next) => {
    const asset = c.req.param('asset')
    if (!asset.includes('.')) {
        return next()
    }

    return serveSpaStatic(c, next)
})

// Start server
const shouldStartServer = process.env.NODE_ENV !== 'test' && !process.env.VITEST

if (shouldStartServer) {
    const port = parseInt(process.env.PORT || '8080', 10)

    serve({
        fetch: app.fetch,
        port,
        hostname: '0.0.0.0', // Listen on all network interfaces
    }, (info) => {
        console.log(`🚀 Jence server running on http://localhost:${info.port}`)
        startSubscriptionCron()
    })
}

export default app
