import { describe, expect, it } from 'vitest'
import { normalizeUploadImage } from '../src/lib/image-transcode.js'

describe('normalizeUploadImage', () => {
    it('sanitizes direct filenames before upload', async () => {
        const file = new File(
            [new Uint8Array([1, 2, 3, 4])],
            '../../My Photo (Final)! .jpeg',
            { type: 'image/jpeg' }
        )

        const result = await normalizeUploadImage(file)

        expect(result.filename).toBe('my-photo-final.jpg')
        expect(Buffer.isBuffer(result.buffer)).toBe(true)
    })

    it('rejects unsupported formats with a branded error', async () => {
        const file = new File(
            [new Uint8Array([1, 2, 3, 4])],
            'scan.tiff',
            { type: 'image/tiff' }
        )

        await expect(normalizeUploadImage(file)).rejects.toMatchObject({
            name: 'UploadImageError',
            statusCode: 415,
            message: 'Jence only accepts JPG, PNG, GIF, WebP, AVIF, or HEIC images.',
        })
    })
})
