import { Hono } from 'hono'
import { db } from '../db/index.js'
import { user } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const usersRoutes = new Hono()

// PUT /api/users/:id — update user profile (e.g. image)
usersRoutes.put('/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { image, name } = body

    if (!image && !name) {
        return c.json({ error: 'Nothing to update' }, 400)
    }

    const [updatedUser] = await db
        .update(user)
        .set({
            ...(image && { image }),
            ...(name && { name }),
            updatedAt: new Date(),
        })
        .where(eq(user.id, id))
        .returning()

    if (!updatedUser) {
        return c.json({ error: 'User not found' }, 404)
    }

    return c.json(updatedUser)
})

export default usersRoutes
