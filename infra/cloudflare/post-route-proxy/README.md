# Post Route Proxy

Cloudflare Worker that proxies crawler-sensitive Jence routes on `jence.xyz` to the Hono server on `api.jence.xyz`.

## Routed Paths

- `/post/*`
- `/community/post/*`
- `/share/*`

Everything else stays on the existing frontend host.

## Why

Direct post URLs need server-rendered Open Graph HTML for social crawlers. The frontend on `jence.xyz` is still a static SPA, so these routes must be forwarded to the API service where metadata is injected.

## Deploy

1. Install Wrangler if needed.
2. From this directory, run `wrangler deploy`.
3. Confirm the Worker routes match `wrangler.toml`.
4. Deploy the server and frontend from the same commit.

## Verify

```bash
ID=7bb647de-f3f8-490f-a575-ac5fa485d78b

curl -s https://jence.xyz/post/$ID | rg 'og:title|og:url|twitter:card|canonical'
curl -s https://jence.xyz/share/post/$ID | rg 'og:title|og:url|twitter:card|canonical'
```

Expected:

- `https://jence.xyz/post/$ID` returns article-specific metadata with `og:url` set to the direct post URL.
- `https://jence.xyz/share/post/$ID` returns redirecting preview HTML.

## Deployment Order

Deploy the Worker first, then deploy the server and frontend. The server-generated direct route HTML expects the frontend's `/assets/*` files to come from the same build.
