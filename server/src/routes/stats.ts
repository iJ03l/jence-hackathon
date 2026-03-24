import { Hono } from 'hono'
import { db } from '../db/index.js'
import { creatorProfile, subscription, vertical, post, tip } from '../db/schema.js'
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

        // Compute total funding volume
        const [tipResult] = await db
            .select({ totalTips: sql<number>`SUM(CAST(${tip.amountUsdc} AS numeric))` })
            .from(tip)

        const [subResult] = await db
            .select({ totalSubs: sql<number>`SUM(CAST(${subscription.amountUsdc} AS numeric))` })
            .from(subscription)
            .where(eq(subscription.status, 'active'))

        const totalTips = Number(tipResult?.totalTips) || 0
        const totalSubs = Number(subResult?.totalSubs) || 0
        const totalVolume = totalTips + totalSubs

        // Assuming 80% goes to creators
        const totalPaidOut = totalVolume * 0.80

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

// GET /api/stats/treasury — community treasury analytics
statsRoutes.get('/treasury', async (c) => {
    try {
        const [tipResult] = await db
            .select({ totalTips: sql<number>`SUM(CAST(${tip.amountUsdc} AS numeric))` })
            .from(tip)

        const [subResult] = await db
            .select({ totalSubs: sql<number>`SUM(CAST(${subscription.amountUsdc} AS numeric))` })
            .from(subscription)
            .where(eq(subscription.status, 'active'))

        const totalTips = Number(tipResult?.totalTips) || 0
        const totalSubsMonthly = Number(subResult?.totalSubs) || 0
        const totalVolume = totalTips + totalSubsMonthly

        const creatorEarnings = totalVolume * 0.80
        const platformTreasury = totalVolume * 0.20

        return c.json({
            totalVolumeGenerated: totalVolume,
            creatorEarnings: creatorEarnings,
            platformTreasuryRevenue: platformTreasury,
            totalTipsAllTime: totalTips,
            activeMonthlyRecurringRevenue: totalSubsMonthly
        })
    } catch (error: any) {
        return c.json({ error: error.message || 'Failed to fetch treasury stats' }, 500)
    }
})

export default statsRoutes
