
const trimTrailingSlash = (value) => value.replace(/\/+$/, '')

const normalizeUrlOrigin = (value) => {
    try {
        return trimTrailingSlash(new URL(value).origin)
    } catch {
        return trimTrailingSlash(value)
    }
}

const env = {
    VITE_API_URL: 'https://api.jence.xyz',
    VITE_PUBLIC_URL: 'https://jence.xyz'
}

function getSiteBaseUrl() {
    const configured = env.VITE_PUBLIC_URL || env.VITE_SITE_URL
    if (configured) return normalizeUrlOrigin(configured)
    return 'https://jence.xyz'
}

function getShareBaseUrl() {
    const configured = env.VITE_SHARE_BASE_URL
    if (configured) return normalizeUrlOrigin(configured)

    const apiUrl = env.VITE_API_URL
    if (apiUrl) return normalizeUrlOrigin(apiUrl)

    return getSiteBaseUrl()
}

console.log('Share Base URL:', getShareBaseUrl())
