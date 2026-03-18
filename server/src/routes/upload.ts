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

        const allowedTypes = new Set([
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ])

        if (!allowedTypes.has(file.type)) {
            return c.json({
                error: 'Unsupported image format. Use JPG, PNG, GIF, or WebP.',
            }, 400)
        }

        const buffer = await file.arrayBuffer()

        const asset = await sanityClient.assets.upload('image', Buffer.from(buffer), {
            filename: file.name
        })

        return c.json({ url: asset.url })
    } catch (error) {
        console.error('Error uploading to Sanity:', error)

        const message = error instanceof Error ? error.message : ''
        if (message.includes('permission "update" required')) {
            return c.json({
                error: 'Sanity upload is not configured with write access. Check SANITY_WRITE_TOKEN.',
            }, 500)
        }

        if (message.includes('Invalid image, could not read metadata')) {
            return c.json({
                error: 'Unsupported or corrupt image. Use JPG, PNG, GIF, or WebP.',
            }, 400)
        }

        return c.json({ error: 'File upload failed' }, 500)
    }
})

export default uploadRoutes
