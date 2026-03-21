import { Hono } from 'hono'
import { db } from '../db/index.js'
import { communityPost, tag, communityPostTag, user, communityPostLike, communityPostComment, creatorProfile, notification, communityPostDailyView } from '../db/schema.js'
import { eq, desc, sql, and, count, sum } from 'drizzle-orm'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth, optionalAuth } from '../middleware/auth.js'

type Variables = {
    user: any
    authSession: any
}

const communityRoutes = new Hono<{ Variables: Variables }>()

const communityPostTodayViews = db
    .select({
        postId: communityPostDailyView.postId,
        todayViews: communityPostDailyView.viewCount,
    })
    .from(communityPostDailyView)
    .where(sql`${communityPostDailyView.viewDate} = CURRENT_DATE`)
    .as('community_post_today_views')

const communityPostScores = db
    .select({
        postId: communityPostLike.postId,
        score: sql<number>`coalesce(sum(${communityPostLike.value}), 0)`.as('score'),
    })
    .from(communityPostLike)
    .groupBy(communityPostLike.postId)
    .as('community_post_scores')

const communityTodayViewsOrder = sql<number>`coalesce(${communityPostTodayViews.todayViews}, 0)`
const communityScoreOrder = sql<number>`coalesce(${communityPostScores.score}, 0)`

async function trackCommunityPostView(postId: string) {
    await db.insert(communityPostDailyView)
        .values({ postId })
        .onConflictDoUpdate({
            target: [communityPostDailyView.postId, communityPostDailyView.viewDate],
            set: {
                viewCount: sql`${communityPostDailyView.viewCount} + 1`,
                updatedAt: sql`now()`,
            },
        })
}

// Helper to get formatted post data
const getPostData = async (post: any, currentUserId?: string) => {
    // Get User and Potential Creator Profile
    const author = await db
        .select({
            id: user.id,
            name: user.name,
            username: user.username,
            image: user.image,
            role: user.role,
            isOg: user.isOg,
            pseudonym: creatorProfile.pseudonym,
        })
        .from(user)
        .leftJoin(creatorProfile, eq(user.id, creatorProfile.userId))
        .where(eq(user.id, post.userId))
        .then(res => res[0])

    const tags = await db
        .select({ name: tag.name, color: tag.color })
        .from(tag)
        .innerJoin(communityPostTag, eq(tag.id, communityPostTag.tagId))
        .where(eq(communityPostTag.postId, post.id))

    const likesResult = await db
        .select({ value: sum(communityPostLike.value) })
        .from(communityPostLike)
        .where(eq(communityPostLike.postId, post.id))
        .then(res => res[0].value)

    const likes = likesResult ? Number(likesResult) : 0

    const comments = await db
        .select({ count: count() })
        .from(communityPostComment)
        .where(eq(communityPostComment.postId, post.id))
        .then(res => res[0].count)

    let userVote = 0
    if (currentUserId) {
        const checkLike = await db.query.communityPostLike.findFirst({
            where: and(
                eq(communityPostLike.postId, post.id),
                eq(communityPostLike.userId, currentUserId)
            )
        })
        if (checkLike) userVote = checkLike.value
    }

    return {
        ...post,
        likes, // This is now the score (sum of votes)
        comments,
        userVote,
        hasLiked: userVote === 1, // Backward compatibility if needed, but UI should use userVote
        tags,
        author: {
            ...author,
            displayName: author.pseudonym || author.username || author.name,
            isCreator: !!author.pseudonym // Simple check if they have a creator profile
        }
    }
}

// GET /api/community/posts
communityRoutes.get('/posts', optionalAuth, async (c) => {
    const tagFilter = c.req.query('tag')
    const userFromSession = c.get('user')
    const currentUserId = userFromSession?.id || c.req.query('userId')

    let posts
    if (tagFilter) {
        posts = await db
            .select({
                id: communityPost.id,
                userId: communityPost.userId,
                content: communityPost.content,
                createdAt: communityPost.createdAt,
                updatedAt: communityPost.updatedAt,
            })
            .from(communityPost)
            .innerJoin(communityPostTag, eq(communityPost.id, communityPostTag.postId))
            .innerJoin(tag, eq(communityPostTag.tagId, tag.id))
            .leftJoin(communityPostTodayViews, eq(communityPost.id, communityPostTodayViews.postId))
            .leftJoin(communityPostScores, eq(communityPost.id, communityPostScores.postId))
            .where(eq(tag.name, tagFilter.toLowerCase()))
            .orderBy(desc(communityTodayViewsOrder), desc(communityScoreOrder), desc(communityPost.createdAt))
            .limit(50)
    } else {
        posts = await db
            .select({
                id: communityPost.id,
                userId: communityPost.userId,
                content: communityPost.content,
                createdAt: communityPost.createdAt,
                updatedAt: communityPost.updatedAt,
            })
            .from(communityPost)
            .leftJoin(communityPostTodayViews, eq(communityPost.id, communityPostTodayViews.postId))
            .leftJoin(communityPostScores, eq(communityPost.id, communityPostScores.postId))
            .orderBy(desc(communityTodayViewsOrder), desc(communityScoreOrder), desc(communityPost.createdAt))
            .limit(50)
    }

    const formattedPosts = await Promise.all(posts.map(p => getPostData(p, currentUserId)))
    return c.json(formattedPosts)
})

// GET /api/community/posts/:id
communityRoutes.get('/posts/:id', optionalAuth, async (c) => {
    const id = c.req.param('id')
    const userFromSession = c.get('user')
    const currentUserId = userFromSession?.id || c.req.query('userId')

    const post = await db.query.communityPost.findFirst({
        where: eq(communityPost.id, id)
    })

    if (!post) return c.json({ error: 'Post not found' }, 404)

    const formattedPost = await getPostData(post, currentUserId)
    return c.json(formattedPost)
})

// POST /api/community/posts/:id/view
communityRoutes.post('/posts/:id/view', async (c) => {
    const id = c.req.param('id')

    const existingPost = await db.query.communityPost.findFirst({
        where: eq(communityPost.id, id),
        columns: { id: true },
    })

    if (!existingPost) {
        return c.json({ error: 'Post not found' }, 404)
    }

    await trackCommunityPostView(id)

    return c.json({ success: true })
})

// DELETE /api/community/posts/:id
communityRoutes.delete('/posts/:id', requireAuth, async (c) => {
    const id = c.req.param('id')
    const userFromSession = c.get('user')
    const userId = userFromSession.id

    const post = await db.query.communityPost.findFirst({
        where: eq(communityPost.id, id)
    })

    if (!post) return c.json({ error: 'Post not found' }, 404)
    if (post.userId !== userId) return c.json({ error: 'Unauthorized to delete this post' }, 403)

    // Manual cascade delete
    await db.transaction(async (tx) => {
        await tx.delete(communityPostDailyView).where(eq(communityPostDailyView.postId, id))
        await tx.delete(communityPostTag).where(eq(communityPostTag.postId, id))
        await tx.delete(communityPostLike).where(eq(communityPostLike.postId, id))
        await tx.delete(communityPostComment).where(eq(communityPostComment.postId, id))
        await tx.delete(communityPost).where(eq(communityPost.id, id))
    })

    return c.json({ success: true })
})

// POST /api/community/posts/:id/vote
communityRoutes.post('/posts/:id/vote', requireAuth, zValidator('json', z.object({
    value: z.number().int().min(-1).max(1)
})), async (c) => {
    const id = c.req.param('id')
    const { value } = c.req.valid('json')
    const userFromSession = c.get('user')
    const userId = userFromSession.id

    try {
        await db.insert(communityPostLike).values({
            postId: id,
            userId,
            value
        }).onConflictDoUpdate({
            target: [communityPostLike.postId, communityPostLike.userId],
            set: { value }
        })
    } catch (e) {
        console.error(e)
        return c.json({ error: 'Failed to vote' }, 500)
    }

    return c.json({ success: true })
})

// DELETE /api/community/posts/:id/like
communityRoutes.delete('/posts/:id/like', requireAuth, async (c) => {
    const id = c.req.param('id')
    const userFromSession = c.get('user')
    const userId = userFromSession.id

    await db.delete(communityPostLike)
        .where(and(
            eq(communityPostLike.postId, id),
            eq(communityPostLike.userId, userId)
        ))

    return c.json({ success: true })
})

// GET /api/community/posts/:id/comments
communityRoutes.get('/posts/:id/comments', async (c) => {
    const id = c.req.param('id')

    const comments = await db
        .select({
            id: communityPostComment.id,
            content: communityPostComment.content,
            createdAt: communityPostComment.createdAt,
            userId: communityPostComment.userId,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                image: user.image,
                role: user.role,
                isOg: user.isOg,
                pseudonym: creatorProfile.pseudonym,
            }
        })
        .from(communityPostComment)
        .leftJoin(user, eq(communityPostComment.userId, user.id))
        .leftJoin(creatorProfile, eq(user.id, creatorProfile.userId))
        .where(eq(communityPostComment.postId, id))
        .orderBy(desc(communityPostComment.createdAt))

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

// POST /api/community/posts/:id/comments
communityRoutes.post('/posts/:id/comments', requireAuth, zValidator('json', z.object({
    content: z.string().min(1)
})), async (c) => {
    const id = c.req.param('id')
    const { content } = c.req.valid('json')
    const userFromSession = c.get('user')
    const userId = userFromSession.id

    const [comment] = await db.insert(communityPostComment).values({
        postId: id,
        userId,
        content
    }).returning()

    // Notify post owner
    const postOwner = await db.query.communityPost.findFirst({
        where: eq(communityPost.id, id),
        columns: { userId: true }
    })

    if (postOwner && postOwner.userId !== userId) {
        await db.insert(notification).values({
            userId: postOwner.userId,
            type: 'community_reply',
            title: 'New Reply',
            body: `@${userFromSession.username || userFromSession.name} replied to your community post.`,
        })
    }

    return c.json(comment)
})

// Tags and Post Creation (Reuse existing logic mostly)
communityRoutes.get('/tags', async (c) => {
    const tags = await db
        .select()
        .from(tag)
        .orderBy(desc(tag.usageCount))
        .limit(20)
    return c.json(tags)
})

communityRoutes.post('/posts', requireAuth, zValidator('json', z.object({
    content: z.string().min(1)
})), async (c) => {
    const { content } = c.req.valid('json')
    const userFromSession = c.get('user')
    const userId = userFromSession.id

    const [newPost] = await db.insert(communityPost).values({
        content,
        userId,
    }).returning()

    const hashtagRegex = /#(\w+)/g
    const matches = content.match(hashtagRegex)
    const uniqueTags: string[] = matches ? Array.from(new Set(matches.map((t: string) => t.substring(1).toLowerCase()))) : []

    for (const tagName of uniqueTags) {
        let tagId
        const existingTag = await db.query.tag.findFirst({ where: eq(tag.name, tagName) })

        if (existingTag) {
            tagId = existingTag.id
            await db.update(tag).set({ usageCount: sql`${tag.usageCount} + 1` }).where(eq(tag.id, tagId))
        } else {
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB']
            const randomColor = colors[Math.floor(Math.random() * colors.length)]
            const [newTag] = await db.insert(tag).values([{ name: tagName, color: randomColor, usageCount: 1 }]).returning()
            tagId = newTag.id
        }
        await db.insert(communityPostTag).values({ postId: newPost.id, tagId: tagId })
    }

    return c.json({ success: true, post: newPost })
})

export default communityRoutes
