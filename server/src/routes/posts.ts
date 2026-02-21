import { Hono } from 'hono'
import { db } from '../db/index.js'
import { post, creatorProfile, subscription, postVote, postComment, user, vertical, strike, notification } from '../db/schema.js'
import { eq, inArray, desc, sql, and, count, sum } from 'drizzle-orm'
import { notifySubscribersOfNewPost } from '../services/notify.js'

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
postsRoutes.delete('/:id', async (c) => {
    const id = c.req.param('id')

    const postRecord = await db.query.post.findFirst({
        where: eq(post.id, id)
    })

    if (!postRecord) return c.json({ error: 'Post not found' }, 404)

    // Perform cascading deletes manually to avoid foreign key errors
    await db.transaction(async (tx) => {
        await tx.delete(postVote).where(eq(postVote.postId, id))
        await tx.delete(postComment).where(eq(postComment.postId, id))
        await tx.delete(notification).where(eq(notification.postId, id))
        await tx.delete(strike).where(eq(strike.postId, id))
        await tx.delete(post).where(eq(post.id, id))
    })

    return c.json({ success: true })
})

// GET /api/posts/my — creator's own posts with stats
postsRoutes.get('/my', async (c) => {
    const creatorProfileId = c.req.query('creatorProfileId')
    if (!creatorProfileId) {
        return c.json({ error: 'creatorProfileId required' }, 400)
    }

    // Get the user ID for this creator owner
    const creatorUser = await db.query.creatorProfile.findFirst({
        where: eq(creatorProfile.id, creatorProfileId),
        columns: { userId: true }
    })
    const currentUserId = creatorUser?.userId

    const myPosts = await Promise.all((await db
        .select({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            isFree: post.isFree,
            isPinned: post.isPinned,
            isPublished: post.isPublished,
            moderationStatus: post.moderationStatus,
            createdAt: post.createdAt,
        })
        .from(post)
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

    return c.json({
        totalPosts,
        totalSubscribers,
        totalViews: 0,       // placeholder — add view tracking later
        totalEarnings: 0,    // placeholder — add payment tracking later
    })
})

// GET /api/posts/:id — get a single post with stats
postsRoutes.get('/:id', async (c) => {
    const id = c.req.param('id')
    const userId = c.req.query('userId')

    const [postData] = await db
        .select({
            id: post.id,
            title: post.title,
            content: post.content, // Full content for detail view
            excerpt: post.excerpt,
            isFree: post.isFree,
            createdAt: post.createdAt,
            creatorId: post.creatorId,
            creatorPseudonym: creatorProfile.pseudonym,
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
        userVote
    })
})



// POST /api/posts/:id/comments
postsRoutes.post('/:id/comments', async (c) => {
    const id = c.req.param('id')
    const { userId, content } = await c.req.json()

    if (!userId || !content) return c.json({ error: 'Missing fields' }, 400)

    const [comment] = await db.insert(postComment).values({
        postId: id,
        userId,
        content
    }).returning()

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
postsRoutes.post('/:id/vote', async (c) => {
    const id = c.req.param('id')
    const { userId, value } = await c.req.json() // 1 or -1

    if (!userId || !value) return c.json({ error: 'Missing fields' }, 400)

    // Upsert vote
    await db.insert(postVote).values({
        postId: id,
        userId,
        value
    }).onConflictDoUpdate({
        target: [postVote.postId, postVote.userId],
        set: { value }
    })

    return c.json({ success: true })
})

// POST /api/posts/:id/pin — pin a post to the top of the creator's profile
postsRoutes.post('/:id/pin', async (c) => {
    const id = c.req.param('id')
    const { creatorId, isPinned } = await c.req.json()

    if (!creatorId) return c.json({ error: 'creatorId is required' }, 400)

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
