import { readFile } from 'node:fs/promises'
import { Hono, type Context } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { creatorProfile, user, post, communityPost } from '../db/schema.js'
import { resolveSpaTemplatePath } from '../lib/spa.js'

const shareRoutes = new Hono()

const FRONTEND_URL = (process.env.FRONTEND_URL || process.env.PUBLIC_URL || 'https://jence.xyz').replace(/\/+$/, '')
const SHARE_BASE_URL = (process.env.SHARE_BASE_URL || process.env.API_PUBLIC_URL || process.env.API_URL || '').replace(/\/+$/, '')
const SITE_NAME = 'Jence'
const DEFAULT_IMAGE = `${FRONTEND_URL}/og-image.png`

let spaTemplatePromise: Promise<string> | null = null

type SocialCardType = 'article' | 'website'

type MetadataParams = {
    title: string
    description: string
    image: string
    url: string
    author?: string
    type?: SocialCardType
    robots?: string
}

type SocialPageData = {
    title: string
    description: string
    image: string
    directUrl: string
    author?: string
    type?: SocialCardType
}

const SOCIAL_CRAWLER_TOKENS = [
    'twitterbot',
    'xbot',
    'facebookexternalhit',
    'facebot',
    'linkedinbot',
    'slackbot',
    'discordbot',
    'telegrambot',
    'whatsapp',
    'skypeuripreview',
    'applebot',
    'googleother',
    'embedly',
    'pinterest',
    'vkshare',
    'preview',
    'crawler',
    'spider',
]

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function normalizeText(value?: string | null, limit = 160) {
    const cleaned = (value || '').replace(/\s+/g, ' ').trim()
    if (!cleaned) return ''
    if (cleaned.length <= limit) return cleaned
    return `${cleaned.slice(0, limit - 3).trimEnd()}...`
}

export function isSocialCrawler(userAgent: string) {
    const normalized = userAgent.toLowerCase()
    return SOCIAL_CRAWLER_TOKENS.some((token) => normalized.includes(token))
}

function normalizeOrigin(value: string) {
    try {
        return new URL(value).origin.replace(/\/+$/, '')
    } catch {
        return value.replace(/\/+$/, '')
    }
}

function buildPublicShareUrl(c: Context) {
    if (SHARE_BASE_URL) {
        return `${normalizeOrigin(SHARE_BASE_URL)}${c.req.path}`
    }

    const forwardedProto = c.req.header('x-forwarded-proto')?.split(',')[0]?.trim()
    const forwardedHost = c.req.header('x-forwarded-host')?.split(',')[0]?.trim()
    const host = forwardedHost || c.req.header('host') || new URL(c.req.url).host
    const protocol = forwardedProto
        || (host === 'localhost:8080' || host.startsWith('127.0.0.1') ? 'http' : 'https')

    return `${protocol}://${host}${c.req.path}`
}

function buildSeoBlock(params: MetadataParams) {
    const title = escapeHtml(params.title)
    const description = escapeHtml(params.description)
    const image = escapeHtml(params.image || DEFAULT_IMAGE)
    const url = escapeHtml(params.url)
    const author = escapeHtml(params.author || SITE_NAME)
    const type = params.type || 'article'
    const robots = escapeHtml(params.robots || 'index, follow')

    return `  <!-- SEO -->
  <title>${title} | ${SITE_NAME}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${url}" />
  <meta name="robots" content="${robots}" />
  <meta name="author" content="${author}" />

  <!-- Open Graph -->
  <meta property="og:title" content="${title} | ${SITE_NAME}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:alt" content="${title}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@jence_io" />
  <meta name="twitter:creator" content="@jence_io" />
  <meta name="twitter:title" content="${title} | ${SITE_NAME}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${title}" />

  <!-- PWA / App-like behavior meta tags -->`
}

export function renderAppPage(template: string, params: MetadataParams) {
    const withBase = /<base\s+href=["']\/["']\s*\/?>/i.test(template)
        ? template
        : template.replace('<head>', '<head>\n  <base href="/" />')

    const seoBlock = buildSeoBlock(params)

    if (/<!-- SEO -->[\s\S]*?<!-- PWA \/ App-like behavior meta tags -->/.test(withBase)) {
        return withBase.replace(/<!-- SEO -->[\s\S]*?<!-- PWA \/ App-like behavior meta tags -->/, seoBlock)
    }

    return withBase.replace('</head>', `${seoBlock}\n</head>`)
}

async function getSpaTemplate() {
    spaTemplatePromise ||= readFile(resolveSpaTemplatePath(), 'utf8')

    try {
        return await spaTemplatePromise
    } catch (error) {
        spaTemplatePromise = null
        throw error
    }
}

export function renderPreviewPage(params: {
    title: string
    description: string
    image: string
    shareUrl: string
    redirectUrl: string
    author?: string
    type?: 'article' | 'website'
    isBot?: boolean
}) {
    const title = escapeHtml(params.title)
    const description = escapeHtml(params.description)
    const image = escapeHtml(params.image || DEFAULT_IMAGE)
    const shareUrl = escapeHtml(params.shareUrl)
    const redirectUrl = escapeHtml(params.redirectUrl)
    const author = params.author ? escapeHtml(params.author) : ''
    const type = params.type || 'article'

    return `<!doctype html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} | ${SITE_NAME}</title>
  <meta name="description" content="${description}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${redirectUrl}" />

  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:title" content="${title} | ${SITE_NAME}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:alt" content="${title}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${shareUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@jence_io" />
  <meta name="twitter:creator" content="@jence_io" />
  <meta name="twitter:title" content="${title} | ${SITE_NAME}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${title}" />
  ${author ? `<meta name="author" content="${author}" />` : ''}
  ${!params.isBot ? `
  <meta http-equiv="refresh" content="0; url=${redirectUrl}" />
  <script>
    window.location.replace(${JSON.stringify(params.redirectUrl)});
  </script>` : ''}
  <style>
    :root { color-scheme: dark; }
    html, body { margin: 0; min-height: 100%; background: #090909; color: #e5e5e5; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { display: grid; place-items: center; padding: 24px; }
    .shell { max-width: 560px; width: 100%; padding: 28px; border: 1px solid rgba(255,255,255,.08); border-radius: 24px; background: rgba(255,255,255,.03); box-shadow: 0 24px 80px rgba(0,0,0,.35); }
    .eyebrow { text-transform: uppercase; letter-spacing: .22em; font-size: 11px; color: #d4af37; margin-bottom: 14px; }
    h1 { margin: 0 0 12px; font-size: clamp(24px, 4vw, 34px); line-height: 1.15; }
    p { margin: 0 0 20px; color: #b4b4b4; line-height: 1.6; }
    a { color: #d4af37; text-decoration: none; }
  </style>
</head>
<body>
  <main class="shell">
    <div class="eyebrow">Jence Preview</div>
    <h1>${title}</h1>
    <p>${description || 'Opening this Jence page...'}</p>
    <a href="${redirectUrl}">Continue</a>
  </main>
</body>
</html>`
}

async function getArticlePageData(id: string): Promise<SocialPageData | null> {
    const [postData] = await db
        .select({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            imageUrl: post.imageUrl,
            createdAt: post.createdAt,
            creatorPseudonym: creatorProfile.pseudonym,
            creatorUsername: user.username,
            creatorImage: user.image,
        })
        .from(post)
        .innerJoin(creatorProfile, eq(post.creatorId, creatorProfile.id))
        .innerJoin(user, eq(creatorProfile.userId, user.id))
        .where(eq(post.id, id))

    if (!postData) return null

    const description = normalizeText(postData.excerpt || postData.content, 160) || `Read ${postData.title} on Jence.`
    return {
        title: postData.title,
        description,
        image: postData.imageUrl || postData.creatorImage || DEFAULT_IMAGE,
        author: postData.creatorPseudonym || postData.creatorUsername || SITE_NAME,
        directUrl: `${FRONTEND_URL}/post/${postData.id}`,
        type: 'article',
    }
}

async function getCommunityPageData(id: string): Promise<SocialPageData | null> {
    const [postData] = await db
        .select({
            id: communityPost.id,
            content: communityPost.content,
            createdAt: communityPost.createdAt,
            name: user.name,
            username: user.username,
            image: user.image,
            pseudonym: creatorProfile.pseudonym,
        })
        .from(communityPost)
        .innerJoin(user, eq(communityPost.userId, user.id))
        .leftJoin(creatorProfile, eq(user.id, creatorProfile.userId))
        .where(eq(communityPost.id, id))

    if (!postData) return null

    const author = postData.pseudonym || postData.username || postData.name || SITE_NAME
    return {
        title: `Discussion by @${postData.username || author}`,
        description: normalizeText(postData.content, 160) || `Read the discussion by ${author} on Jence.`,
        image: postData.image || DEFAULT_IMAGE,
        author,
        directUrl: `${FRONTEND_URL}/community/post/${postData.id}`,
        type: 'article',
    }
}

async function respondWithSocialPage(
    c: Context,
    pageData: SocialPageData | null,
    notFound: {
        title: string
        description: string
        directUrl: string
    }
) {
    const isShareRoute = c.req.path.startsWith('/share/')
    const status = pageData ? 200 : 404
    const title = pageData?.title || notFound.title
    const description = pageData?.description || notFound.description
    const image = pageData?.image || DEFAULT_IMAGE
    const directUrl = pageData?.directUrl || notFound.directUrl
    const author = pageData?.author
    const type = pageData?.type || 'website'

    c.header('Cache-Control', pageData ? 'public, max-age=300, s-maxage=300' : 'public, max-age=60, s-maxage=60')

    if (isShareRoute) {
        const ua = c.req.header('user-agent') || ''
        const isBot = isSocialCrawler(ua)
        const shareUrl = buildPublicShareUrl(c)

        return c.html(renderPreviewPage({
            title,
            description,
            image,
            shareUrl,
            redirectUrl: directUrl,
            author,
            type,
            isBot,
        }), status)
    }

    const template = await getSpaTemplate()
    return c.html(renderAppPage(template, {
        title,
        description,
        image,
        url: directUrl,
        author,
        type,
        robots: pageData ? 'index, follow' : 'noindex, nofollow',
    }), status)
}

shareRoutes.get('/post/:id', async (c) => {
    const id = c.req.param('id')
    console.log(`[Share] Resolving article ${id} for ${c.req.path}`)

    const pageData = await getArticlePageData(id)

    if (!pageData) {
        console.warn(`[Share] Post ${id} not found`)
    } else {
        console.log(`[Share] Serving article metadata for: ${pageData.title} by ${pageData.author}`)
    }

    return respondWithSocialPage(c, pageData, {
        title: 'Article not found',
        description: 'This Jence article is unavailable or has been removed.',
        directUrl: `${FRONTEND_URL}/post/${id}`,
    })
})

shareRoutes.get('/community/post/:id', async (c) => {
    const id = c.req.param('id')
    console.log(`[Share] Resolving community post ${id} for ${c.req.path}`)

    const pageData = await getCommunityPageData(id)

    if (!pageData) {
        console.warn(`[Share] Community post ${id} not found`)
    } else {
        console.log(`[Share] Serving community metadata for: ${pageData.title}`)
    }

    return respondWithSocialPage(c, pageData, {
        title: 'Discussion not found',
        description: 'This Jence discussion is unavailable or has been removed.',
        directUrl: `${FRONTEND_URL}/community/post/${id}`,
    })
})

export default shareRoutes
