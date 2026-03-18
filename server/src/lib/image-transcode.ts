import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const SUPPORTED_IMAGE_MESSAGE = 'Jence only accepts JPG, PNG, GIF, WebP, AVIF, or HEIC images.'

export class UploadImageError extends Error {
    constructor(message: string, public readonly statusCode: 400 | 415 | 422 = 400) {
        super(message)
        this.name = 'UploadImageError'
    }
}

const DIRECT_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
])

const AVIF_MIME_TYPES = new Set([
    'image/avif',
    'image/avif-sequence',
])

const HEIC_MIME_TYPES = new Set([
    'image/heic',
    'image/heif',
    'image/heic-sequence',
    'image/heif-sequence',
])

const DIRECT_EXTENSIONS = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
]

const AVIF_EXTENSIONS = [
    '.avif',
    '.avifs',
]

const HEIC_EXTENSIONS = [
    '.heic',
    '.heif',
    '.heics',
    '.heifs',
]

const DIRECT_EXTENSION_BY_MIME = new Map([
    ['image/jpeg', '.jpg'],
    ['image/png', '.png'],
    ['image/gif', '.gif'],
    ['image/webp', '.webp'],
])

const DIRECT_EXTENSION_BY_NAME = new Map([
    ['.jpg', '.jpg'],
    ['.jpeg', '.jpg'],
    ['.png', '.png'],
    ['.gif', '.gif'],
    ['.webp', '.webp'],
])

function matchesExtension(name: string, extensions: string[]) {
    return extensions.some((extension) => name.endsWith(extension))
}

function getUploadKind(file: File): 'direct' | 'avif' | 'heic' | null {
    const mimeType = file.type.toLowerCase()
    const fileName = file.name.toLowerCase()

    if (DIRECT_MIME_TYPES.has(mimeType) || matchesExtension(fileName, DIRECT_EXTENSIONS)) {
        return 'direct'
    }

    if (AVIF_MIME_TYPES.has(mimeType) || matchesExtension(fileName, AVIF_EXTENSIONS)) {
        return 'avif'
    }

    if (HEIC_MIME_TYPES.has(mimeType) || matchesExtension(fileName, HEIC_EXTENSIONS)) {
        return 'heic'
    }

    return null
}

function getBaseName(fileName: string) {
    const rawName = path.parse(fileName || '').name || 'jence-upload'
    const normalized = rawName
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase()
        .slice(0, 80)

    return normalized || 'jence-upload'
}

function getDirectExtension(file: File) {
    const mimeExtension = DIRECT_EXTENSION_BY_MIME.get(file.type.toLowerCase())
    if (mimeExtension) return mimeExtension

    const fileExtension = DIRECT_EXTENSION_BY_NAME.get(path.extname(file.name).toLowerCase())
    if (fileExtension) return fileExtension

    return '.jpg'
}

async function transcodeAvifToWebp(inputPath: string, outputPath: string) {
    await execFileAsync('ffmpeg', [
        '-y',
        '-v',
        'error',
        '-i',
        inputPath,
        '-frames:v',
        '1',
        '-c:v',
        'libwebp',
        '-q:v',
        '85',
        outputPath,
    ], { maxBuffer: 20 * 1024 * 1024 })
}

async function transcodeHeicToWebp(inputPath: string, outputPath: string) {
    await execFileAsync('magick', [
        inputPath,
        '-auto-orient',
        '-strip',
        '-quality',
        '85',
        outputPath,
    ], { maxBuffer: 20 * 1024 * 1024 })
}

export async function normalizeUploadImage(file: File): Promise<{ buffer: Buffer; filename: string }> {
    const kind = getUploadKind(file)
    if (!kind) {
        throw new UploadImageError(SUPPORTED_IMAGE_MESSAGE, 415)
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    if (kind === 'direct') {
        return { buffer, filename: `${getBaseName(file.name)}${getDirectExtension(file)}` }
    }

    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'jence-upload-'))
    const inputExt = kind === 'avif' ? 'avif' : 'heic'
    const inputPath = path.join(tempDir, `input.${inputExt}`)
    const outputPath = path.join(tempDir, 'output.webp')

    try {
        await writeFile(inputPath, buffer)

        if (kind === 'avif') {
            await transcodeAvifToWebp(inputPath, outputPath)
        } else {
            await transcodeHeicToWebp(inputPath, outputPath)
        }

        const converted = await readFile(outputPath)
        return {
            buffer: converted,
            filename: `${getBaseName(file.name)}.webp`,
        }
    } catch (error) {
        const source = kind === 'avif' ? 'AVIF' : 'HEIC'
        throw new UploadImageError(
            `Jence could not convert that ${source} image. Re-export it or upload JPG, PNG, GIF, WebP, AVIF, or HEIC instead.`,
            422
        )
    } finally {
        await rm(tempDir, { recursive: true, force: true }).catch(() => {})
    }
}
