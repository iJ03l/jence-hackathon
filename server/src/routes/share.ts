import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { creatorProfile, user, post, communityPost } from '../db/schema.js'

const shareRoutes = new Hono()

const FRONTEND_URL = (process.env.FRONTEND_URL || process.env.PUBLIC_URL || 'https://jence.xyz').replace(/\/+$/, '')
const SITE_NAME = 'Jence'
const DEFAULT_IMAGE = `${FRONTEND_URL}/og-image.png`

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

function renderPreviewPage(params: {
    title: string
    description: string
    image: string
    canonicalUrl: string
    redirectUrl: string
    author?: string
    type?: 'article' | 'website'
}) {
    const title = escapeHtml(params.title)
    const description = escapeHtml(params.description)
    const image = escapeHtml(params.image || DEFAULT_IMAGE)
    const canonicalUrl = escapeHtml(params.canonicalUrl)
    const redirectUrl = escapeHtml(params.redirectUrl)
    const author = params.author ? escapeHtml(params.author) : ''
    const type = params.type || 'article'

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} | ${SITE_NAME}</title>
  <meta name="description" content="${description}" />
  <meta name="robots" content="noindex, nofollow" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta http-equiv="refresh" content="0;url=${redirectUrl}" />

  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:title" content="${title} | ${SITE_NAME}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:alt" content="${title}" />
  <meta property="og:url" content="${canonicalUrl}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title} | ${SITE_NAME}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${title}" />
  ${author ? `<meta name="author" content="${author}" />` : ''}
  <script>
    window.location.replace(${JSON.stringify(params.redirectUrl)});
  </script>
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
    <p>${description || 'Redirecting to Jence...'}</p>
    <a href="${redirectUrl}">Continue</a>
  </main>
</body>
</html>`
}

shareRoutes.get('/post/:id', async (c) => {
    const id = c.req.param('id')

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

    if (!postData) {
        return c.html(renderPreviewPage({
            title: 'Article not found',
            description: 'This Jence article is unavailable or has been removed.',
            image: DEFAULT_IMAGE,
            canonicalUrl: `${FRONTEND_URL}/`,
            redirectUrl: `${FRONTEND_URL}/`,
            type: 'website',
        }), 404)
    }

    const canonicalUrl = `${FRONTEND_URL}/post/${postData.id}`
    const description = normalizeText(postData.excerpt || postData.content, 160) || `Read ${postData.title} on Jence.`
    const image = postData.imageUrl || postData.creatorImage || DEFAULT_IMAGE
    const author = postData.creatorPseudonym || postData.creatorUsername || 'Jence'

    c.header('X-Robots-Tag', 'noindex, nofollow')
    return c.html(renderPreviewPage({
        title: postData.title,
        description,
        image,
        canonicalUrl,
        redirectUrl: canonicalUrl,
        author,
        type: 'article',
    }))
})

shareRoutes.get('/community/post/:id', async (c) => {
    const id = c.req.param('id')

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

    if (!postData) {
        return c.html(renderPreviewPage({
            title: 'Discussion not found',
            description: 'This Jence discussion is unavailable or has been removed.',
            image: DEFAULT_IMAGE,
            canonicalUrl: `${FRONTEND_URL}/community`,
            redirectUrl: `${FRONTEND_URL}/community`,
            type: 'website',
        }), 404)
    }

    const canonicalUrl = `${FRONTEND_URL}/community/post/${postData.id}`
    const author = postData.pseudonym || postData.username || postData.name || 'Jence'
    const description = normalizeText(postData.content, 160) || `Read the discussion by ${author} on Jence.`

    c.header('X-Robots-Tag', 'noindex, nofollow')
    return c.html(renderPreviewPage({
        title: `Discussion by @${postData.username || author}`,
        description,
        image: postData.image || DEFAULT_IMAGE,
        canonicalUrl,
        redirectUrl: canonicalUrl,
        author,
        type: 'article',
    }))
})

export default shareRoutes
