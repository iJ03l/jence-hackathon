interface Env {
    API_ORIGIN: string
}

const ROUTED_PREFIXES = ['/post/', '/community/post/', '/share/']

function shouldProxy(pathname: string) {
    return ROUTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function buildForwardedFor(request: Request) {
    const existing = request.headers.get('x-forwarded-for')?.trim()
    const clientIp = request.headers.get('cf-connecting-ip')?.trim()

    if (existing && clientIp) return `${existing}, ${clientIp}`
    return existing || clientIp || ''
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const incomingUrl = new URL(request.url)

        if (!shouldProxy(incomingUrl.pathname)) {
            return fetch(request)
        }

        const targetBase = new URL(env.API_ORIGIN)
        const targetUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, targetBase)

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
