import { Hono } from 'hono'
import { sanityClient } from '../lib/sanity.js'
import { normalizeUploadImage, UploadImageError } from '../lib/image-transcode.js'
import { requireAuth } from '../middleware/auth.js'

type Variables = {
    user: any
    authSession: any
}

/** Detect any Sanity permission / auth error regardless of format. */
function isSanityPermissionError(err: any): boolean {
    const msg = (err?.message || err?.error || '').toLowerCase()
    const status = err?.statusCode || err?.response?.status || 0
    return (
        status === 401 ||
        status === 403 ||
        msg.includes('permission "update" required') ||
        msg.includes('permission "create" required') ||
        msg.includes('insufficient permissions') ||
        msg.includes('forbidden')
    )
}

/** Generate a unique filename to bypass Sanity deduplication. */
function uniqueFilename(original: string): string {
    const dot = original.lastIndexOf('.')
    const base = dot > 0 ? original.slice(0, dot) : original
    const ext = dot > 0 ? original.slice(dot) : ''
    return `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
}

/**
 * Upload to Sanity with two levels of retry:
 *  1. Retry without filename (avoids deduplication PATCH).
 *  2. Retry with a unique filename (forces fresh asset creation).
 */
async function uploadWithRetry(
    type: 'image' | 'file',
    buffer: Buffer,
    filename: string | undefined,
) {
    // Attempt 1 — normal upload
    try {
        return await sanityClient.assets.upload(type, buffer, filename ? { filename } : undefined)
    } catch (err: any) {
        if (!isSanityPermissionError(err)) throw err
        console.log(`Sanity dedup/permission error on initial upload. Retrying without filename…`)
    }

    // Attempt 2 — without filename to skip dedup patch
    try {
        return await sanityClient.assets.upload(type, buffer)
    } catch (err: any) {
        if (!isSanityPermissionError(err)) throw err
        console.log(`Sanity dedup/permission error on retry. Retrying with unique filename…`)
    }

    // Attempt 3 — unique filename forces fresh asset
    return await sanityClient.assets.upload(type, buffer, {
        filename: uniqueFilename(filename || 'jence-upload'),
    })
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
        const isSvg = fileNameLow.endsWith('.svg')
        const isRawFile = /\.(pdf|glb|gltf|obj|stl|step|stp|json)$/i.test(fileNameLow)
        let asset;

        if (isRawFile) {
            if (file.size > 25 * 1024 * 1024) {
                return c.json({ error: 'File size exceeds 25MB limit' }, 400)
            }
            const buffer = Buffer.from(await file.arrayBuffer())
            asset = await uploadWithRetry('file', buffer, file.name)
        } else if (isSvg) {
            if (file.size > 5 * 1024 * 1024) {
                return c.json({ error: 'Image size exceeds 5MB limit' }, 400)
            }
            const buffer = Buffer.from(await file.arrayBuffer())
            asset = await uploadWithRetry('image', buffer, file.name)
        } else {
            if (file.size > 5 * 1024 * 1024) {
                return c.json({ error: 'Image size exceeds 5MB limit' }, 400)
            }
            const { buffer, filename } = await normalizeUploadImage(file)
            asset = await uploadWithRetry('image', buffer, filename)
        }

        return c.json({ url: asset.url })
    } catch (error) {
        if (error instanceof UploadImageError) {
            return c.json({ error: error.message }, error.statusCode)
        }

        console.error('Error uploading to Sanity:', error)

        // Never surface internal Sanity config details to users
        if (isSanityPermissionError(error)) {
            return c.json({
                error: 'Upload failed. Please try again or use a different file.',
            }, 500)
        }

        const message = error instanceof Error ? error.message : ''
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
