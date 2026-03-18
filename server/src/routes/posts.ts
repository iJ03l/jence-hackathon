import { Hono } from 'hono'
import { db } from '../db/index.js'
import { post, creatorProfile, subscription, postVote, postComment, user, vertical, strike, notification, postDailyView, tip } from '../db/schema.js'
import { eq, inArray, desc, sql, and, count, sum } from 'drizzle-orm'
import { notifySubscribersOfNewPost } from '../services/notify.js'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth, optionalAuth } from '../middleware/auth.js'

type Variables = {
    user: any
    authSession: any
}

const postsRoutes = new Hono<{ Variables: Variables }>()

const postTodayViews = db
    .select({
        postId: postDailyView.postId,
        todayViews: postDailyView.viewCount,
    })
    .from(postDailyView)
    .where(sql`${postDailyView.viewDate} = CURRENT_DATE`)
    .as('post_today_views')

const postScores = db
    .select({
        postId: postVote.postId,
        score: sql<number>`coalesce(sum(${postVote.value}), 0)`.as('score'),
    })
    .from(postVote)
    .groupBy(postVote.postId)
    .as('post_scores')

const postTodayViewsOrder = sql<number>`coalesce(${postTodayViews.todayViews}, 0)`
const postScoreOrder = sql<number>`coalesce(${postScores.score}, 0)`

async function trackPostView(postId: string) {
    await db.insert(postDailyView)
        .values({ postId })
        .onConflictDoUpdate({
            target: [postDailyView.postId, postDailyView.viewDate],
            set: {
                viewCount: sql`${postDailyView.viewCount} + 1`,
                updatedAt: sql`now()`,
            },
        })
}

// GET /api/posts — feed (latest posts, optionally filtered by subscriber's subscriptions)
postsRoutes.get('/', optionalAuth, async (c) => {
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
                allowTips: post.allowTips,
                createdAt: post.createdAt,
                creatorPseudonym: creatorProfile.pseudonym,
                creatorId: creatorProfile.id,
                verticalName: vertical.name,
                verticalSlug: vertical.slug,
            })
            .from(post)
            .innerJoin(creatorProfile, eq(post.creatorId, creatorProfile.id))
            .leftJoin(vertical, eq(post.verticalId, vertical.id))
            .leftJoin(postTodayViews, eq(post.id, postTodayViews.postId))
            .leftJoin(postScores, eq(post.id, postScores.postId))
            .where(and(
                inArray(post.creatorId, creatorIds),
                eq(post.isPublished, true)
            ))
            .orderBy(desc(postTodayViewsOrder), desc(postScoreOrder), desc(post.createdAt))
            .limit(50)

        return c.json(feedPosts)
    }

    // Public feed — latest posts
    const latestPosts = await db
            .select({
                id: post.id,
                title: post.title,
                excerpt: post.excerpt,
                imageUrl: post.imageUrl,
                isFree: post.isFree,
                allowTips: post.allowTips,
                createdAt: post.createdAt,
                creatorPseudonym: creatorProfile.pseudonym,
                creatorId: creatorProfile.id,
                verticalName: vertical.name,
                verticalSlug: vertical.slug,
        })
        .from(post)
        .innerJoin(creatorProfile, eq(post.creatorId, creatorProfile.id))
        .leftJoin(vertical, eq(post.verticalId, vertical.id))
        .leftJoin(postTodayViews, eq(post.id, postTodayViews.postId))
        .leftJoin(postScores, eq(post.id, postScores.postId))
        .where(eq(post.isPublished, true))
        .orderBy(desc(postTodayViewsOrder), desc(postScoreOrder), desc(post.createdAt))
        .limit(50)

    return c.json(latestPosts)
})

const createPostSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    excerpt: z.string().optional(),
    disclosure: z.string().optional(),
    imageUrl: z.string().url().optional(),
    creatorId: z.string().uuid(),
    verticalId: z.string().uuid(),
    isFree: z.boolean().optional(),
    allowTips: z.boolean().optional(),
})

// POST /api/posts — create a new post (creator only)
postsRoutes.post('/', requireAuth, zValidator('json', createPostSchema), async (c) => {
    const userFromSession = c.get('user')
    const { title, content, excerpt, disclosure, imageUrl, creatorId, verticalId, isFree, allowTips } = c.req.valid('json')

    // Verify user owns the creator profile
    const creatorUser = await db.query.creatorProfile.findFirst({
        where: eq(creatorProfile.id, creatorId),
        columns: { userId: true }
    })

    if (creatorUser?.userId !== userFromSession.id) {
        return c.json({ error: 'Forbidden' }, 403)
    }

    const [newPost] = await db.insert(post).values({
        title,
        content,
        excerpt: excerpt || content.substring(0, 200),
        disclosure: disclosure?.trim() || null,
        imageUrl: imageUrl || null,
        creatorId,
        verticalId,
        isFree: isFree ?? false,
        allowTips: allowTips ?? false,
    }).returning()

    // Fire-and-forget: notify all subscribers via in-app + email
    notifySubscribersOfNewPost({
        id: newPost.id,
        title: newPost.title,
        excerpt: newPost.excerpt,
        creatorId: newPost.creatorId,
        verticalId: newPost.verticalId,
    }).catch(console.error)

    return c.json(newPost, 201)
})

// DELETE /api/posts/:id — delete a post (creator only)
postsRoutes.delete('/:id', requireAuth, async (c) => {
    const id = c.req.param('id')
    const userFromSession = c.get('user')

    const postRecord = await db.query.post.findFirst({
        where: eq(post.id, id)
    })

    if (!postRecord) return c.json({ error: 'Post not found' }, 404)

    const creatorQuery = await db.select({ userId: creatorProfile.userId })
        .from(creatorProfile)
        .where(eq(creatorProfile.id, postRecord.creatorId))

    const creatorUserId = creatorQuery[0]?.userId

    if (creatorUserId !== userFromSession.id && userFromSession.role !== 'admin') {
        return c.json({ error: 'Forbidden' }, 403)
    }

    // Perform cascading deletes manually to avoid foreign key errors
    await db.transaction(async (tx) => {
        await tx.delete(postDailyView).where(eq(postDailyView.postId, id))
        await tx.delete(postVote).where(eq(postVote.postId, id))
        await tx.delete(postComment).where(eq(postComment.postId, id))
        await tx.delete(notification).where(eq(notification.postId, id))
        await tx.delete(strike).where(eq(strike.postId, id))
        await tx.delete(tip).where(eq(tip.postId, id))
        await tx.delete(post).where(eq(post.id, id))
    })

    return c.json({ success: true })
})

// GET /api/posts/my — creator's own posts with stats
postsRoutes.get('/my', requireAuth, async (c) => {
    const creatorProfileId = c.req.query('creatorProfileId')
    const userFromSession = c.get('user')

    if (!creatorProfileId) {
        return c.json({ error: 'creatorProfileId required' }, 400)
    }

    const creatorUser = await db.query.creatorProfile.findFirst({
        where: eq(creatorProfile.id, creatorProfileId),
        columns: { userId: true }
    })
    const currentUserId = creatorUser?.userId

    if (currentUserId !== userFromSession.id) {
        return c.json({ error: 'Forbidden' }, 403)
    }

    const myPosts = await Promise.all((await db
        .select({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            isFree: post.isFree,
            allowTips: post.allowTips,
            isPinned: post.isPinned,
            isPublished: post.isPublished,
            moderationStatus: post.moderationStatus,
            createdAt: post.createdAt,
            verticalName: vertical.name,
            verticalSlug: vertical.slug,
        })
        .from(post)
        .leftJoin(vertical, eq(post.verticalId, vertical.id))
        .where(eq(post.creatorId, creatorProfileId))
        .orderBy(desc(post.isPinned), desc(post.createdAt))
    ).map(async (p) => {
        const likesResult = await db
            .select({ value: sum(postVote.value) })
            .from(postVote)
            .where(eq(postVote.postId, p.id))
            .then(res => res[0].value)

        const likes = likesResult ? Number(likesResult) : 0

        const comments = await db
            .select({ count: count() })
            .from(postComment)
            .where(eq(postComment.postId, p.id))
            .then(res => res[0].count)

        let userVote = 0
        if (currentUserId) {
            const vote = await db.query.postVote.findFirst({
                where: and(eq(postVote.postId, p.id), eq(postVote.userId, currentUserId))
            })
            if (vote) userVote = vote.value
        }

        return { ...p, likes, comments, userVote }
    }))

    return c.json(myPosts)
})

// GET /api/posts/stats — aggregate stats for a creator
postsRoutes.get('/stats', async (c) => {
    const creatorProfileId = c.req.query('creatorProfileId')
    if (!creatorProfileId) {
        return c.json({ error: 'creatorProfileId required' }, 400)
    }

    const [{ count: totalPosts }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(post)
        .where(eq(post.creatorId, creatorProfileId))

    const [{ count: totalSubscribers }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(subscription)
        .where(eq(subscription.creatorProfileId, creatorProfileId))

    const [{ totalViews }] = await db
        .select({ totalViews: sql<number>`coalesce(sum(${postDailyView.viewCount}), 0)` })
        .from(postDailyView)
        .innerJoin(post, eq(postDailyView.postId, post.id))
        .where(eq(post.creatorId, creatorProfileId))

    return c.json({
        totalPosts,
        totalSubscribers,
        totalViews,
        totalEarnings: 0,    // placeholder — add payment tracking later
    })
})

// GET /api/posts/:id — get a single post with stats
postsRoutes.get('/:id', optionalAuth, async (c) => {
    const id = c.req.param('id')
    const userFromSession = c.get('user')
    const userId = userFromSession?.id || c.req.query('userId')

    const [postData] = await db
        .select({
            id: post.id,
            title: post.title,
            content: post.content, // Full content for detail view
            excerpt: post.excerpt,
            disclosure: post.disclosure,
            imageUrl: post.imageUrl,
            isFree: post.isFree,
            allowTips: post.allowTips,
            createdAt: post.createdAt,
            creatorId: post.creatorId,
            creatorPseudonym: creatorProfile.pseudonym,
            creatorUserId: user.id,
            creatorImage: user.image, // helpful for UI
            creatorUsername: user.username, // helpful for linking
            verticalId: post.verticalId,
            verticalName: vertical.name,
            verticalSlug: vertical.slug,
        })
        .from(post)
        .innerJoin(creatorProfile, eq(post.creatorId, creatorProfile.id))
        .innerJoin(user, eq(creatorProfile.userId, user.id))
        .leftJoin(vertical, eq(post.verticalId, vertical.id))
        .where(eq(post.id, id))

    if (!postData) {
        return c.json({ error: 'Post not found' }, 404)
    }

    // Security check: if post is not free, only send full content to subscribers or the creator
    let canViewFullContent = postData.isFree === true

    if (!canViewFullContent && userId) {
        // Check if user is the creator
        const creatorUser = await db.query.creatorProfile.findFirst({
            where: eq(creatorProfile.id, postData.creatorId),
            columns: { userId: true }
        })

        if (creatorUser?.userId === userId) {
            canViewFullContent = true
        } else {
            // Check if subscribed
            const sub = await db.query.subscription.findFirst({
                where: and(
                    eq(subscription.subscriberUserId, userId),
                    eq(subscription.creatorProfileId, postData.creatorId)
                )
            })
            if (sub) {
                canViewFullContent = true
            }
        }
    }

    if (!canViewFullContent) {
        // Completely scrub content to prevent browser-level leaks
        postData.content = ""
    }

    // Get stats
    const likesResult = await db
        .select({ value: sum(postVote.value) })
        .from(postVote)
        .where(eq(postVote.postId, id))
        .then(res => res[0].value)

    const likes = likesResult ? Number(likesResult) : 0

    const commentsCount = await db
        .select({ count: count() })
        .from(postComment)
        .where(eq(postComment.postId, id))
        .then(res => res[0].count)

    let userVote = 0
    if (userId) {
        const vote = await db.query.postVote.findFirst({
            where: and(eq(postVote.postId, id), eq(postVote.userId, userId))
        })
        if (vote) userVote = vote.value
    }

    return c.json({
        ...postData,
        likes,
        comments: commentsCount,
        userVote,
        hasAccess: canViewFullContent
    })
})

// POST /api/posts/:id/view
postsRoutes.post('/:id/view', async (c) => {
    const id = c.req.param('id')

    const existingPost = await db.query.post.findFirst({
        where: and(eq(post.id, id), eq(post.isPublished, true)),
        columns: { id: true },
    })

    if (!existingPost) {
        return c.json({ error: 'Post not found' }, 404)
    }

    await trackPostView(id)

    return c.json({ success: true })
})



// POST /api/posts/:id/comments
postsRoutes.post('/:id/comments', requireAuth, zValidator('json', z.object({
    content: z.string().min(1),
})), async (c) => {
    const id = c.req.param('id')
    const { content } = c.req.valid('json')
    const userFromSession = c.get('user')
    const userId = userFromSession.id

    const [comment] = await db.insert(postComment).values({
        postId: id,
        userId,
        content
    }).returning()

    // Notify analysis creator
    const postRecord = await db.query.post.findFirst({
        where: eq(post.id, id)
    })

    if (postRecord) {
        const creator = await db.query.creatorProfile.findFirst({
            where: eq(creatorProfile.id, postRecord.creatorId),
            columns: { userId: true }
        })

        if (creator && creator.userId !== userId) {
            await db.insert(notification).values({
                userId: creator.userId,
                type: 'post_reply',
                title: 'New Comment',
                body: `@${userFromSession.username || userFromSession.name} commented on your analysis.`,
                postId: id
            })
        }
    }

    return c.json(comment)
})

// GET /api/posts/:id/comments
postsRoutes.get('/:id/comments', async (c) => {
    const id = c.req.param('id')

    const comments = await db
        .select({
            id: postComment.id,
            content: postComment.content,
            createdAt: postComment.createdAt,
            userId: postComment.userId,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                image: user.image,
                role: user.role,
                pseudonym: creatorProfile.pseudonym,
            }
        })
        .from(postComment)
        .leftJoin(user, eq(postComment.userId, user.id))
        .leftJoin(creatorProfile, eq(user.id, creatorProfile.userId))
        .where(eq(postComment.postId, id))
        .orderBy(desc(postComment.createdAt))

    const formattedComments = comments.map(c => ({
        ...c,
        user: {
            ...c.user,
            displayName: c.user?.pseudonym || c.user?.username || c.user?.name,
            isCreator: !!c.user?.pseudonym
        }
    }))

    return c.json(formattedComments)
})

// POST /api/posts/:id/vote
postsRoutes.post('/:id/vote', requireAuth, zValidator('json', z.object({
    value: z.number().int().min(-1).max(1)
})), async (c) => {
    const id = c.req.param('id')
    const { value } = c.req.valid('json')
    const userFromSession = c.get('user')
    const userId = userFromSession.id

    if (value === 0) {
        // Remove vote
        await db.delete(postVote).where(
            and(eq(postVote.postId, id), eq(postVote.userId, userId))
        )
    } else {
        // Upsert vote
        await db.insert(postVote).values({
            postId: id,
            userId,
            value
        }).onConflictDoUpdate({
            target: [postVote.postId, postVote.userId],
            set: { value }
        })
    }

    return c.json({ success: true })
})

// POST /api/posts/:id/pin — pin a post to the top of the creator's profile
postsRoutes.post('/:id/pin', requireAuth, zValidator('json', z.object({
    creatorId: z.string().uuid(),
    isPinned: z.boolean()
})), async (c) => {
    const id = c.req.param('id')
    const { creatorId, isPinned } = c.req.valid('json')
    const userFromSession = c.get('user')

    const creatorUser = await db.query.creatorProfile.findFirst({
        where: eq(creatorProfile.id, creatorId),
        columns: { userId: true }
    })

    if (creatorUser?.userId !== userFromSession.id) {
        return c.json({ error: 'Forbidden' }, 403)
    }

    try {
        await db.transaction(async (tx) => {
            // If we are pinning this post, unpin all other posts for this creator
            if (isPinned) {
                await tx.update(post)
                    .set({ isPinned: false })
                    .where(eq(post.creatorId, creatorId))
            }

            // Update the target post
            await tx.update(post)
                .set({ isPinned: isPinned })
                .where(eq(post.id, id))
        })
        return c.json({ success: true, isPinned })
    } catch (e: any) {
        return c.json({ error: e.message || 'Failed to update pin status' }, 500)
    }
})

export default postsRoutes
