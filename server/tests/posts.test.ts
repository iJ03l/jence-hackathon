import { describe, it, expect } from 'vitest'
import app from '../src/index.js'

describe('Posts Routes Security', () => {
    it('Should block unauthenticated requests from creating a post', async () => {
        const res = await app.request('/api/posts', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Malicious Post',
                content: 'Hack hack',
                creatorId: '00000000-0000-0000-0000-000000000000',
                verticalId: '00000000-0000-0000-0000-000000000000'
            }),
            headers: { 'Content-Type': 'application/json' }
        })

        expect(res.status).toBe(401)
    })

    it('Should block unauthenticated voting attempts', async () => {
        const res = await app.request('/api/posts/123/vote', {
            method: 'POST',
            body: JSON.stringify({ value: 1 }),
            headers: { 'Content-Type': 'application/json' }
        })

        expect(res.status).toBe(401)
    })

    it('Should block unauthenticated delete requests', async () => {
        const res = await app.request('/api/posts/123', {
            method: 'DELETE'
        })

        expect(res.status).toBe(401)
    })
})
