const ROUTED_PREFIXES = ['/post/', '/community/post/', '/share/']

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

function isBot(userAgent) {
    const normalized = userAgent.toLowerCase()
    return SOCIAL_CRAWLER_TOKENS.some((token) => normalized.includes(token))
}

function shouldProxy(pathname, userAgent) {
    if (pathname.startsWith('/share/')) {
        return true
    }
    const isPostRoute = pathname.startsWith('/post/') || pathname.startsWith('/community/post/')
    if (isPostRoute && isBot(userAgent)) {
        return true
    }
    return false
}

function buildForwardedFor(request) {
    const existing = request.headers.get('x-forwarded-for')?.trim()
    const clientIp = request.headers.get('cf-connecting-ip')?.trim()

    if (existing && clientIp) return `${existing}, ${clientIp}`
    return existing || clientIp || ''
}

export default {
    async fetch(request, env) {
        const incomingUrl = new URL(request.url)
        const userAgent = request.headers.get('user-agent') || ''

        if (!shouldProxy(incomingUrl.pathname, userAgent)) {
            return fetch(request)
        }

        const targetBase = new URL(env.API_ORIGIN || 'https://api.jence.xyz')
        
        let proxyPathname = incomingUrl.pathname
        if (!proxyPathname.startsWith('/share/')) {
            proxyPathname = `/share${proxyPathname}`
        }
        
        const targetUrl = new URL(`${proxyPathname}${incomingUrl.search}`, targetBase)

        const headers = new Headers(request.headers)
        headers.set('x-forwarded-host', incomingUrl.host)
        headers.set('x-forwarded-proto', incomingUrl.protocol.replace(':', ''))

        const forwardedFor = buildForwardedFor(request)
        if (forwardedFor) {
            headers.set('x-forwarded-for', forwardedFor)
        }

        const proxiedRequest = new Request(targetUrl.toString(), {
            method: request.method,
            headers,
            body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
            redirect: 'manual',
        })

        return fetch(proxiedRequest)
    },
}
