import { describe, it, expect } from 'vitest'
import app from '../src/index.js'

describe('Auth & User Routes Security', () => {
    it('Should block unauthorized requests to user profile edits', async () => {
        const res = await app.request('/api/users/123', {
            method: 'PUT',
            body: JSON.stringify({ name: 'Hacker' }),
            headers: { 'Content-Type': 'application/json' }
        })

        // Should hit requireAuth middleware and return 401
        expect(res.status).toBe(401)
    })

    it('Should block unauthorized requests to user data export', async () => {
        const res = await app.request('/api/users/123/export', {
            method: 'GET'
        })

        expect(res.status).toBe(401)
    })
})
