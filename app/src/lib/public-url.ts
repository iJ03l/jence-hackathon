const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const normalizeUrlOrigin = (value: string) => {
    try {
        return trimTrailingSlash(new URL(value).origin)
    } catch {
        return trimTrailingSlash(value)
    }
}

export function getSiteBaseUrl() {
    const configured = import.meta.env.VITE_PUBLIC_URL || import.meta.env.VITE_SITE_URL
    if (configured) return normalizeUrlOrigin(configured)

    if (typeof window !== 'undefined' && window.location?.origin) {
        return trimTrailingSlash(window.location.origin)
    }

    return 'https://jence.xyz'
}

export function getShareBaseUrl() {
    const configured = import.meta.env.VITE_SHARE_BASE_URL
    if (configured) return normalizeUrlOrigin(configured)

    const apiUrl = import.meta.env.VITE_API_URL
    if (apiUrl) return normalizeUrlOrigin(apiUrl)

    // On Railway/Static hosts without rewrites, we MUST use the API domain for SEO previews to work.
    // Defaulting to the API domain for jence.xyz production.
    if (typeof window !== 'undefined' && window.location.host === 'jence.xyz') {
        return 'https://api.jence.xyz'
    }

    return getSiteBaseUrl()
}

export function buildSiteUrl(path: string) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${getSiteBaseUrl()}${normalizedPath}`
}

export function buildShareUrl(path: string) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${getShareBaseUrl()}${normalizedPath}`
}

export function buildArticleShareUrl(id: string) {
    return buildShareUrl(`/share/post/${id}`)
}

export function buildCommunityPostShareUrl(id: string) {
    return buildShareUrl(`/share/community/post/${id}`)
}
