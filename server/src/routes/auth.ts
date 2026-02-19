import { Hono } from 'hono'
import { auth } from '../auth.js'

const authRoutes = new Hono()

// Mount Better Auth handler — handles all /api/auth/* routes
authRoutes.all('/*', (c) => {
    return auth.handler(c.req.raw)
})

export default authRoutes
