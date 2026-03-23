import { Hono } from 'hono'
import { db } from '../db/index.js'
import { creatorProfile, launchNote, post, communityPost, user, vertical } from '../db/schema.js'
import { eq, or, ilike, and } from 'drizzle-orm'

const searchRoutes = new Hono()

// GET /api/search?q=query&type=all|authors|launches|posts|community
searchRoutes.get('/', async (c) => {
    const q = c.req.query('q') || ''
    const type = c.req.query('type') || 'all'

    if (!q || q.length < 2) {
        return c.json({ authors: [], launches: [], posts: [], community: [] })
    }

    if (q.length > 100) {
        return c.json({ error: 'Search query too long' }, 400)
    }

    const queryPattern = `%${q}%`
    
    let authors: any[] = []
    let launches: any[] = []
    let posts: any[] = []
    let community: any[] = []

    try {
        if (type === 'all' || type === 'authors') {
            authors = await db
                .select({
                    id: creatorProfile.id,
                    pseudonym: creatorProfile.pseudonym,
                    bio: creatorProfile.bio,
                    username: user.username,
                    image: user.image,
                    isOg: user.isOg,
                    verticalName: vertical.name
                })
                .from(creatorProfile)
                .innerJoin(user, eq(creatorProfile.userId, user.id))
                .leftJoin(vertical, eq(creatorProfile.verticalId, vertical.id))
                .where(
                    and(
                        eq(creatorProfile.isBanned, false),
                        or(
                            ilike(creatorProfile.pseudonym, queryPattern),
                            ilike(user.username, queryPattern),
                            ilike(creatorProfile.bio, queryPattern)
                        )
                    )
                )
                .limit(5)
        }

        if (type === 'all' || type === 'launches') {
            launches = await db
                .select({
                    id: launchNote.id,
                    name: launchNote.name,
                    company: launchNote.company,
                    summary: launchNote.summary,
                    status: launchNote.status,
                })
                .from(launchNote)
                .where(
                    and(
                        eq(launchNote.status, 'approved'),
                        or(
                            ilike(launchNote.name, queryPattern),
                            ilike(launchNote.company, queryPattern),
                            ilike(launchNote.summary, queryPattern)
                        )
                    )
                )
                .limit(5)
        }

        if (type === 'all' || type === 'posts') {
            posts = await db
                .select({
                    id: post.id,
                    title: post.title,
                    excerpt: post.excerpt,
                    isFree: post.isFree,
                    verticalSlug: vertical.slug,
                    verticalName: vertical.name,
                    creatorPseudonym: creatorProfile.pseudonym
                })
                .from(post)
                .innerJoin(vertical, eq(post.verticalId, vertical.id))
                .innerJoin(creatorProfile, eq(post.creatorId, creatorProfile.id))
                .where(
                    and(
                        eq(post.isPublished, true),
                        or(
                            ilike(post.title, queryPattern),
                            ilike(post.excerpt, queryPattern)
                        )
                    )
                )
                .limit(5)
        }

        if (type === 'all' || type === 'community') {
            community = await db
                .select({
                    id: communityPost.id,
                    content: communityPost.content,
                    username: user.username,
                    userImage: user.image,
                    createdAt: communityPost.createdAt
                })
                .from(communityPost)
                .innerJoin(user, eq(communityPost.userId, user.id))
                .where(ilike(communityPost.content, queryPattern))
                .limit(5)
        }

        return c.json({
            authors,
            launches,
            posts,
            community
        })

    } catch (error: any) {
        console.error('Search error:', error)
        return c.json({ error: 'An error occurred while searching' }, 500)
    }
})

export default searchRoutes
