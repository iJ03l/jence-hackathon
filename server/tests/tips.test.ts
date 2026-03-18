import { describe, it, expect } from 'vitest'
import app from '../src/index.js'

describe('Tips Routes Security', () => {
    it('should block unauthenticated tip requests', async () => {
        const res = await app.request('/api/tips', {
            method: 'POST',
            body: JSON.stringify({
                amountUsdc: 1,
                creatorProfileId: '00000000-0000-0000-0000-000000000000',
            }),
            headers: { 'Content-Type': 'application/json' },
        })

        expect(res.status).toBe(401)
    })
})
