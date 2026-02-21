import { Hono } from 'hono'
import { SignJWT, importPKCS8 } from 'jose'
import { auth } from '../auth.js'

type Variables = {
    user: {
        id: string
        name: string
        email: string
    }
}

const privyRoutes = new Hono<{ Variables: Variables }>()

// Require Better Auth for all privy routes
privyRoutes.use('/*', async (c, next) => {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers
    })

    if (!session || !session.user) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    c.set('user', session.user as any)
    await next()
})

// GET /api/privy/token — Generate a Custom JWT for Privy
privyRoutes.get('/token', async (c) => {
    const user = c.get('user')
    const appId = process.env.PRIVY_APP_ID || process.env.VITE_PRIVY_APP_ID
    const appSecret = process.env.PRIVY_APP_SECRET

    if (!appId || !appSecret) {
        console.error('Missing Privy credentials in environment variables.')
        return c.json({ error: 'Server configuration error' }, 500)
    }

    try {
        // Import the private key (app secret) for use with jose
        const privateKey = await importPKCS8(appSecret, 'ES256')

        // Create the JWT
        const jwt = await new SignJWT({})
            .setProtectedHeader({ alg: 'ES256', typ: 'JWT' })
            .setSubject(user.id)
            .setIssuer(appId)
            .setAudience(appId)
            .setIssuedAt()
            .setExpirationTime('1h') // Token expires in 1 hour
            .sign(privateKey)

        return c.json({ token: jwt })
    } catch (error) {
        console.error('Failed to generate Privy token:', error)
        return c.json({ error: 'Failed to generate token' }, 500)
    }
})

export default privyRoutes
