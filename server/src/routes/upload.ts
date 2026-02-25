import { Hono } from 'hono'
import { sanityClient } from '../lib/sanity.js'
import { requireAuth } from '../middleware/auth.js'

type Variables = {
    user: any
    authSession: any
}

const uploadRoutes = new Hono<{ Variables: Variables }>()

uploadRoutes.post('/', requireAuth, async (c) => {
    try {
        const body = await c.req.parseBody()
        const file = body['file'] as File

        if (!file) {
            return c.json({ error: 'No file provided' }, 400)
        }

        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            return c.json({ error: 'File size exceeds 5MB limit' }, 400)
        }

        // Validate basic image types if necessary
        if (!file.type.startsWith('image/')) {
            return c.json({ error: 'Invalid file type. Only images are allowed' }, 400)
        }

        const buffer = await file.arrayBuffer()

        const asset = await sanityClient.assets.upload('image', Buffer.from(buffer), {
            filename: file.name
        })

        return c.json({ url: asset.url })
    } catch (error) {
        console.error('Error uploading to Sanity:', error)
        return c.json({ error: 'File upload failed' }, 500)
    }
})

export default uploadRoutes
