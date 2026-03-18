import { describe, expect, it } from 'vitest'
import { renderPreviewPage } from '../src/routes/share.js'

describe('share preview rendering', () => {
    it('binds social metadata to the share URL instead of the redirect target', () => {
        const html = renderPreviewPage({
            title: 'Torque Benchmarks',
            description: 'Field-tested results from a new actuator sweep.',
            image: 'https://cdn.jence.xyz/torque-bench.png',
            shareUrl: 'https://api.jence.xyz/share/post/123',
            redirectUrl: 'https://jence.xyz/post/123',
            type: 'article',
            author: 'Ada',
        })

        expect(html).toContain('property="og:url" content="https://api.jence.xyz/share/post/123"')
        expect(html).toContain('property="og:image:secure_url" content="https://cdn.jence.xyz/torque-bench.png"')
        expect(html).not.toContain('http-equiv="refresh"')
        expect(html).toContain('window.location.replace("https://jence.xyz/post/123")')
    })
})
