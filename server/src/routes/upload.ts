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

        const fileNameLow = file.name.toLowerCase()
        const isRawFile = /\.(pdf|glb|gltf|obj|stl|step|stp)$/i.test(fileNameLow)
        let asset;

        if (isRawFile) {
            // 25MB limit for raw 3D/PDF files
            if (file.size > 25 * 1024 * 1024) {
                return c.json({ error: 'File size exceeds 25MB limit' }, 400)
            }
            const buffer = Buffer.from(await file.arrayBuffer())
            asset = await sanityClient.assets.upload('file', buffer, {
                filename: file.name
            })
        } else {
            // 5MB limit for images
            if (file.size > 5 * 1024 * 1024) {
                return c.json({ error: 'Image size exceeds 5MB limit' }, 400)
            }

            const { buffer, filename } = await normalizeUploadImage(file)
            
            try {
                asset = await sanityClient.assets.upload('image', buffer, {
                    filename,
                })
            } catch (sanityError: any) {
                const msg = sanityError.message || ''
                if (msg.includes('permission "update" required') || msg.includes('permission "create" required')) {
                    console.log('Sanity deduplication patch failed (token lacks update/create rights). Retrying without filename...')
                    asset = await sanityClient.assets.upload('image', buffer)
                } else {
                    throw sanityError
                }
            }
        }

        return c.json({ url: asset.url })
    } catch (error) {
        if (error instanceof UploadImageError) {
            return c.json({ error: error.message }, error.statusCode)
        }

        console.error('Error uploading to Sanity:', error)

        const message = error instanceof Error ? error.message : ''
        if (message.includes('permission "update" required') || message.includes('permission "create" required')) {
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
