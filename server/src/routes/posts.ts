import { Hono } from 'hono'
import { db } from '../db/index.js'
import { post, creatorProfile, subscription } from '../db/schema.js'
import { eq, inArray, desc } from 'drizzle-orm'

const postsRoutes = new Hono()

// GET /api/posts — feed (latest posts, optionally filtered by subscriber's subscriptions)
postsRoutes.get('/', async (c) => {
    const userId = c.req.query('userId')

    if (userId) {
        // Get subscribed creator IDs
        const subs = await db
            .select({ creatorProfileId: subscription.creatorProfileId })
            .from(subscription)
            .where(eq(subscription.subscriberUserId, userId))

        const creatorIds = subs.map(s => s.creatorProfileId)

        if (creatorIds.length === 0) {
            return c.json([])
        }

        const feedPosts = await db
            .select({
                id: post.id,
                title: post.title,
                excerpt: post.excerpt,
                isFree: post.isFree,
                createdAt: post.createdAt,
                creatorPseudonym: creatorProfile.pseudonym,
                creatorId: creatorProfile.id,
            })
            .from(post)
            .innerJoin(creatorProfile, eq(post.creatorId, creatorProfile.id))
            .where(inArray(post.creatorId, creatorIds))
            .orderBy(desc(post.createdAt))
            .limit(50)

        return c.json(feedPosts)
    }

    // Public feed — latest posts
    const latestPosts = await db
        .select({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            isFree: post.isFree,
            createdAt: post.createdAt,
            creatorPseudonym: creatorProfile.pseudonym,
            creatorId: creatorProfile.id,
        })
        .from(post)
        .innerJoin(creatorProfile, eq(post.creatorId, creatorProfile.id))
        .where(eq(post.isPublished, true))
        .orderBy(desc(post.createdAt))
        .limit(50)

    return c.json(latestPosts)
})

// POST /api/posts — create a new post (creator only)
postsRoutes.post('/', async (c) => {
    const body = await c.req.json()
    const { title, content, excerpt, creatorId, verticalId, isFree } = body

    if (!title || !content || !creatorId || !verticalId) {
        return c.json({ error: 'Missing required fields' }, 400)
    }

    const [newPost] = await db.insert(post).values({
        title,
        content,
        excerpt: excerpt || content.substring(0, 200),
        creatorId,
        verticalId,
        isFree: isFree ?? false,
    }).returning()

    return c.json(newPost, 201)
})

export default postsRoutes
