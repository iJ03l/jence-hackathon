import { Hono } from 'hono'
import { db } from '../db/index.js'
import { vertical, creatorProfile, post, user, postVote, postDailyView } from '../db/schema.js'
import { eq, and, desc, sql } from 'drizzle-orm'

const verticalsRoutes = new Hono()

const verticalPostTodayViews = db
    .select({
        postId: postDailyView.postId,
        todayViews: postDailyView.viewCount,
    })
    .from(postDailyView)
    .where(sql`${postDailyView.viewDate} = CURRENT_DATE`)
    .as('vertical_post_today_views')

const verticalPostScores = db
    .select({
        postId: postVote.postId,
        score: sql<number>`coalesce(sum(${postVote.value}), 0)`.as('score'),
    })
    .from(postVote)
    .groupBy(postVote.postId)
    .as('vertical_post_scores')

const verticalTodayViewsOrder = sql<number>`coalesce(${verticalPostTodayViews.todayViews}, 0)`
const verticalScoreOrder = sql<number>`coalesce(${verticalPostScores.score}, 0)`

// GET /api/verticals — list all verticals
verticalsRoutes.get('/', async (c) => {
    const verticals = await db.select().from(vertical)
    return c.json(verticals)
})

// GET /api/verticals/:slug — get vertical by slug with recent posts
verticalsRoutes.get('/:slug', async (c) => {
    const slug = c.req.param('slug')

    const [found] = await db.select().from(vertical).where(eq(vertical.slug, slug))
    if (!found) {
        return c.json({ error: 'Vertical not found' }, 404)
    }

    const recentPosts = await db
        .select({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            createdAt: post.createdAt,
            creatorPseudonym: creatorProfile.pseudonym,
            creatorUsername: user.username,
            creatorImage: user.image,
        })
        .from(post)
        .innerJoin(creatorProfile, eq(post.creatorId, creatorProfile.id))
        .innerJoin(user, eq(creatorProfile.userId, user.id))
        .leftJoin(verticalPostTodayViews, eq(post.id, verticalPostTodayViews.postId))
        .leftJoin(verticalPostScores, eq(post.id, verticalPostScores.postId))
        .where(
            and(
                eq(post.verticalId, found.id),
                eq(post.isFree, true),
                eq(post.isPublished, true)
            )
        )
        .orderBy(desc(verticalTodayViewsOrder), desc(verticalScoreOrder), desc(post.createdAt))
        .limit(20)

    return c.json({
        vertical: found,
        posts: recentPosts,
    })
})

export default verticalsRoutes
