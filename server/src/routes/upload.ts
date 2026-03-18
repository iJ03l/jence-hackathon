import { Hono } from 'hono'
import { sanityClient } from '../lib/sanity.js'
import { normalizeUploadImage, UploadImageError } from '../lib/image-transcode.js'
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

        const { buffer, filename } = await normalizeUploadImage(file)

        let asset;
        try {
            asset = await sanityClient.assets.upload('image', buffer, {
                filename,
            })
        } catch (sanityError: any) {
            const msg = sanityError.message || ''
            // Under limited token roles (e.g. "create" but no "update"), Sanity throws an 
            // update permission error if the image already exists (deduplication) because 
            // it attempts to PATCH the existing asset with the new filename.
            if (msg.includes('permission "update" required')) {
                console.log('Sanity deduplication patch failed (token lacks update rights). Retrying without filename...')
                asset = await sanityClient.assets.upload('image', buffer)
            } else {
                throw sanityError
            }
        }

        return c.json({ url: asset.url })
    } catch (error) {
        if (error instanceof UploadImageError) {
            return c.json({ error: error.message }, error.statusCode)
        }

        console.error('Error uploading to Sanity:', error)

        const message = error instanceof Error ? error.message : ''
        if (message.includes('permission "update" required')) {
            return c.json({
                error: 'Sanity upload is not configured with write access. Check SANITY_WRITE_TOKEN.',
            }, 500)
        }

        if (
            message.includes('Invalid image, could not read metadata') ||
            message.includes('Could not convert AVIF image') ||
            message.includes('Could not convert HEIC image')
        ) {
            return c.json({
                error: 'Jence could not process that image. Use JPG, PNG, GIF, WebP, AVIF, or HEIC.',
            }, 400)
        }

        return c.json({ error: 'File upload failed' }, 500)
    }
})

export default uploadRoutes
