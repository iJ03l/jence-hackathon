import { Hono } from 'hono'
import { db } from '../db/index.js'
import { vertical, creatorProfile, post, user } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'

const verticalsRoutes = new Hono()

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
        .where(
            and(
                eq(post.verticalId, found.id),
                eq(post.isFree, true),
                eq(post.isPublished, true)
            )
        )
        .limit(20)

    return c.json({
        vertical: found,
        posts: recentPosts,
    })
})

export default verticalsRoutes
