import { describe, it, expect } from 'vitest'
import app from '../src/index.js'

describe('Launch Routes Security', () => {
    it('Should block unauthenticated launch upvotes', async () => {
        const res = await app.request('/api/launches/123/upvote', {
            method: 'POST',
        })

        expect(res.status).toBe(401)
    })

    it('Should block unauthenticated launch upvote removals', async () => {
        const res = await app.request('/api/launches/123/upvote', {
            method: 'DELETE',
        })

        expect(res.status).toBe(401)
    })
})
