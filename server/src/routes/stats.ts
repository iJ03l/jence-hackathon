import { Hono } from 'hono'
import { db } from '../db/index.js'
import { creatorProfile, subscription, vertical, post } from '../db/schema.js'
import { count, eq, and, sql } from 'drizzle-orm'

const statsRoutes = new Hono()

// GET /api/stats/global — public platform stats
statsRoutes.get('/global', async (c) => {
    try {
        const [{ creatorCount }] = await db
            .select({ creatorCount: count() })
            .from(creatorProfile)
            .where(eq(creatorProfile.isBanned, false))

        const [{ subscriberCount }] = await db
            .select({ subscriberCount: count() })
            .from(subscription)
            .where(eq(subscription.status, 'active'))

        // We don't have a payments table yet, so totalPaidOut is placeholder
        const totalPaidOut = 0

        // Get creator counts per vertical
        const verticalCounts = await db
            .select({
                slug: vertical.slug,
                count: count(creatorProfile.id)
            })
            .from(vertical)
            .leftJoin(creatorProfile, and(
                eq(creatorProfile.verticalId, vertical.id),
                eq(creatorProfile.isBanned, false)
            ))
            .groupBy(vertical.slug)

        const creatorsByVertical: Record<string, number> = {}
        for (const row of verticalCounts) {
            creatorsByVertical[row.slug] = Number(row.count)
        }

        // Get post counts per vertical
        const postCounts = await db
            .select({
                slug: vertical.slug,
                count: count(post.id)
            })
            .from(vertical)
            .leftJoin(post, eq(post.verticalId, vertical.id))
            .groupBy(vertical.slug)

        const articlesByVertical: Record<string, number> = {}
        for (const row of postCounts) {
            articlesByVertical[row.slug] = Number(row.count)
        }

        return c.json({
            totalCreators: creatorCount,
            totalSubscribers: subscriberCount,
            totalPaidOut,
            creatorsByVertical,
            articlesByVertical,
        })
    } catch (error: any) {
        return c.json({ error: error.message || 'Failed to fetch global stats' }, 500)
    }
})

export default statsRoutes
