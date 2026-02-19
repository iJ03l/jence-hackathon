import { Hono } from 'hono'
import { db } from '../db/index.js'
import { communityPost, tag, communityPostTag, user, communityPostLike, communityPostComment, creatorProfile } from '../db/schema.js'
import { eq, desc, sql, and, inArray, count, sum } from 'drizzle-orm'

const communityRoutes = new Hono()

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
communityRoutes.get('/posts', async (c) => {
    const tagFilter = c.req.query('tag')
    const currentUserId = c.req.query('userId')

    let posts
    if (tagFilter) {
        const tagRecord = await db.query.tag.findFirst({
            where: eq(tag.name, tagFilter.toLowerCase())
        })

        if (!tagRecord) return c.json([])

        const postTags = await db
            .select({ postId: communityPostTag.postId })
            .from(communityPostTag)
            .where(eq(communityPostTag.tagId, tagRecord.id))

        const postIds = postTags.map(pt => pt.postId)

        if (postIds.length === 0) return c.json([])

        posts = await db
            .select()
            .from(communityPost)
            .where(inArray(communityPost.id, postIds))
            .orderBy(desc(communityPost.createdAt))
            .limit(50)
    } else {
        posts = await db
            .select()
            .from(communityPost)
            .orderBy(desc(communityPost.createdAt))
            .limit(50)
    }

    const formattedPosts = await Promise.all(posts.map(p => getPostData(p, currentUserId)))
    return c.json(formattedPosts)
})

// GET /api/community/posts/:id
communityRoutes.get('/posts/:id', async (c) => {
    const id = c.req.param('id')
    const currentUserId = c.req.query('userId')

    const post = await db.query.communityPost.findFirst({
        where: eq(communityPost.id, id)
    })

    if (!post) return c.json({ error: 'Post not found' }, 404)

    const formattedPost = await getPostData(post, currentUserId)
    return c.json(formattedPost)
})

// POST /api/community/posts/:id/vote
communityRoutes.post('/posts/:id/vote', async (c) => {
    const id = c.req.param('id')
    const { userId, value } = await c.req.json() // 1 or -1

    if (!userId || !value) return c.json({ error: 'Missing userId or value' }, 400)

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
communityRoutes.delete('/posts/:id/like', async (c) => {
    const id = c.req.param('id')
    const userId = c.req.query('userId')

    if (!userId) return c.json({ error: 'Missing userId' }, 400)

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
communityRoutes.post('/posts/:id/comments', async (c) => {
    const id = c.req.param('id')
    const { userId, content } = await c.req.json()

    if (!userId || !content) return c.json({ error: 'Missing fields' }, 400)

    const [comment] = await db.insert(communityPostComment).values({
        postId: id,
        userId,
        content
    }).returning()

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

communityRoutes.post('/posts', async (c) => {
    const body = await c.req.json()
    const { content, userId } = body

    if (!content || !userId) return c.json({ error: 'Missing content or user' }, 400)

    const [newPost] = await db.insert(communityPost).values({
        content,
        userId,
    }).returning()

    const hashtagRegex = /#(\w+)/g
    const matches = content.match(hashtagRegex)
    const uniqueTags = matches ? [...new Set(matches.map((t: string) => t.substring(1).toLowerCase()))] : []

    for (const tagName of uniqueTags) {
        let tagId
        const existingTag = await db.query.tag.findFirst({ where: eq(tag.name, tagName) })

        if (existingTag) {
            tagId = existingTag.id
            await db.update(tag).set({ usageCount: sql`${tag.usageCount} + 1` }).where(eq(tag.id, tagId))
        } else {
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB']
            const randomColor = colors[Math.floor(Math.random() * colors.length)]
            const [newTag] = await db.insert(tag).values({ name: tagName, color: randomColor, usageCount: 1 }).returning()
            tagId = newTag.id
        }
        await db.insert(communityPostTag).values({ postId: newPost.id, tagId: tagId })
    }

    return c.json({ success: true, post: newPost })
})

export default communityRoutes
