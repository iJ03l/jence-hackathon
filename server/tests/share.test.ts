import { describe, expect, it } from 'vitest'
import { renderAppPage, renderPreviewPage } from '../src/routes/share.js'

describe('share preview rendering', () => {
    it('binds social metadata to the redirect target for better canonical identity', () => {
        const html = renderPreviewPage({
            title: 'Torque Benchmarks',
            description: 'Field-tested results from a new actuator sweep.',
            image: 'https://cdn.jence.xyz/torque-bench.png',
            shareUrl: 'https://api.jence.xyz/share/post/123',
            redirectUrl: 'https://jence.xyz/post/123',
            type: 'article',
            author: 'Ada',
            isBot: false,
        })

        expect(html).toContain('property="og:url" content="https://jence.xyz/post/123"')
        expect(html).toContain('property="og:image:secure_url" content="https://cdn.jence.xyz/torque-bench.png"')
        expect(html).toContain('http-equiv="refresh" content="0; url=https://jence.xyz/post/123"')
        expect(html).toContain('window.location.replace("https://jence.xyz/post/123")')
    })

    it('omits redirect scripts and meta refresh for bots', () => {
        const html = renderPreviewPage({
            title: 'Torque Benchmarks',
            description: 'Field-tested results from a new actuator sweep.',
            image: 'https://cdn.jence.xyz/torque-bench.png',
            shareUrl: 'https://api.jence.xyz/share/post/123',
            redirectUrl: 'https://jence.xyz/post/123',
            type: 'article',
            isBot: true,
        })

        expect(html).toContain('property="og:url" content="https://jence.xyz/post/123"')
        expect(html).not.toContain('http-equiv="refresh"')
        expect(html).not.toContain('window.location.replace')
    })

    it('keeps the canonical URL pointed at the frontend article', () => {
        const html = renderPreviewPage({
            title: 'Torque Benchmarks',
            description: 'Field-tested results from a new actuator sweep.',
            image: 'https://cdn.jence.xyz/torque-bench.png',
            shareUrl: 'https://api.jence.xyz/share/post/123',
            redirectUrl: 'https://jence.xyz/post/123',
            type: 'article',
        })

        expect(html).toContain('<link rel="canonical" href="https://jence.xyz/post/123" />')
    })

    it('injects direct-route metadata into the SPA shell', () => {
        const template = `<!doctype html>
<html lang="en">
<head>
  <!-- SEO -->
  <title>Jence | Robotics and Hardware Engineering</title>
  <meta name="description" content="Default description." />
  <link rel="canonical" href="https://jence.xyz" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="Jence" />
  <!-- Open Graph -->
  <meta property="og:title" content="Jence | Robotics and Hardware Engineering" />
  <meta property="og:description" content="Default description." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://jence.xyz" />
  <meta property="og:site_name" content="Jence" />
  <meta property="og:image" content="https://jence.xyz/lp.png" />
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Jence | Robotics and Hardware Engineering" />
  <meta name="twitter:description" content="Default description." />
  <meta name="twitter:image" content="https://jence.xyz/lp.png" />
  <!-- PWA / App-like behavior meta tags -->
  <script type="module" crossorigin src="./assets/index.js"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>`

        const html = renderAppPage(template, {
            title: 'Torque Benchmarks',
            description: 'Field-tested results from a new actuator sweep.',
            image: 'https://cdn.jence.xyz/torque-bench.png',
            url: 'https://jence.xyz/post/123',
            author: 'Ada',
            type: 'article',
        })

        expect(html).toContain('<base href="/" />')
        expect(html).toContain('<link rel="canonical" href="https://jence.xyz/post/123" />')
        expect(html).toContain('property="og:url" content="https://jence.xyz/post/123"')
        expect(html).toContain('name="author" content="Ada"')
        expect(html).toContain('<script type="module" crossorigin src="./assets/index.js"></script>')
    })
})
