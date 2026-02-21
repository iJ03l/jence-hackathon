import { Hono } from 'hono'
import { db } from '../db/index.js'
import { user } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const usersRoutes = new Hono()

// PUT /api/users/:id — update user profile (e.g. image)
usersRoutes.put('/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { image, name, role } = body

    if (!image && !name && !role) {
        return c.json({ error: 'Nothing to update' }, 400)
    }

    const [updatedUser] = await db
        .update(user)
        .set({
            ...(image && { image }),
            ...(name && { name }),
            ...(role && { role }),
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

export default usersRoutes
