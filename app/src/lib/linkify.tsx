import React from 'react'

/**
 * Converts plain text containing URLs into JSX with clickable links.
 * Matches:
 *   - https://example.com/path
 *   - http://example.com
 *   - www.example.com/path
 *   - example.co, example.com, example.org, etc. (bare domains)
 */
export function linkifyText(text: string): React.ReactNode {
    // Pattern breakdown:
    // 1. Full URLs with protocol: https?://...
    // 2. www. prefixed: www.domain.tld...
    // 3. Bare domains: word.tld (common TLDs only to avoid false positives)
    const urlRegex = /(https?:\/\/[^\s<>]+|www\.[^\s<>]+|[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/[^\s<>]*)?)/gi

    const parts = text.split(urlRegex)
    if (parts.length === 1) return text // No links found

    return parts.map((part, i) => {
        if (urlRegex.lastIndex = 0, urlRegex.test(part)) {
            // Determine the href
            let href = part
            if (!/^https?:\/\//i.test(href)) {
                href = 'https://' + href
            }
            // Strip trailing punctuation that's likely not part of the URL
            const trailingMatch = part.match(/([.,;:!?)]+)$/)
            let displayText = part
            let trailing = ''
            if (trailingMatch) {
                displayText = part.slice(0, -trailingMatch[1].length)
                trailing = trailingMatch[1]
                href = href.slice(0, -trailingMatch[1].length)
            }
            return (
                <React.Fragment key={i}>
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-jence-gold hover:underline break-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {displayText}
                    </a>
                    {trailing}
                </React.Fragment>
            )
        }
        return part
    })
}
