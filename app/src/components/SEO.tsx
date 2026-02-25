import { Helmet } from 'react-helmet-async'

interface SEOProps {
    title?: string
    description?: string
    image?: string
    url?: string
    type?: 'website' | 'article' | 'profile'
    noIndex?: boolean
    children?: React.ReactNode
}

const SITE_NAME = 'Jence'
const DEFAULT_DESCRIPTION = 'Access anonymous expert analysis from verified industry insiders. Subscribe to premium insights on crypto, finance, tech, and more on Jence.'
const DEFAULT_IMAGE = 'https://jence.xyz/og-image.png'
const BASE_URL = 'https://jence.xyz'

export default function SEO({
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    url,
    type = 'website',
    noIndex = false,
    children,
}: SEOProps) {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Anonymous Expert Analysis`
    const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={fullUrl} />
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={SITE_NAME} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
            {children}
        </Helmet>
    )
}
