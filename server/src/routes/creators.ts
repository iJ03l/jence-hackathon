import { Hono } from 'hono'
import { db } from '../db/index.js'
import { creatorProfile, post, subscription, vertical, user, creatorRating } from '../db/schema.js'
import { eq, sql, and, desc, avg, count } from 'drizzle-orm'

const creatorsRoutes = new Hono()

// GET /api/creators — list all creators
creatorsRoutes.get('/', async (c) => {
    const creators = await db
        .select({
            id: creatorProfile.id,
            pseudonym: creatorProfile.pseudonym,
            bio: creatorProfile.bio,
            kycStatus: creatorProfile.kycStatus,
            verticalName: vertical.name,
            verticalSlug: vertical.slug,
            createdAt: creatorProfile.createdAt,
        })
        .from(creatorProfile)
        .leftJoin(vertical, eq(creatorProfile.verticalId, vertical.id))
        .where(eq(creatorProfile.isBanned, false))

    return c.json(creators)
})

// GET /api/creators/:id — get creator profile with posts
creatorsRoutes.get('/:id', async (c) => {
    const id = c.req.param('id')

    const [creator] = await db
        .select({
            id: creatorProfile.id,
            pseudonym: creatorProfile.pseudonym,
            bio: creatorProfile.bio,
            kycStatus: creatorProfile.kycStatus,
            verticalId: creatorProfile.verticalId,
            verticalName: vertical.name,
            verticalSlug: vertical.slug,
            subscriptionPrice: creatorProfile.subscriptionPrice,
            createdAt: creatorProfile.createdAt,
        })
        .from(creatorProfile)
        .leftJoin(vertical, eq(creatorProfile.verticalId, vertical.id))
        .where(eq(creatorProfile.id, id))

    if (!creator) {
        return c.json({ error: 'Creator not found' }, 404)
    }

    // Get subscriber count
    const [{ count: subscriberCount }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(subscription)
        .where(
            and(
                eq(subscription.creatorProfileId, id),
                eq(subscription.status, 'active')
            )
        )

    // Get rating stats
    const [ratingStats] = await db
        .select({
            averageRating: avg(creatorRating.rating),
            ratingCount: count(creatorRating.id),
        })
        .from(creatorRating)
        .where(eq(creatorRating.creatorProfileId, id))

    // Get feedback list
    const feedbackList = await db
        .select({
            id: creatorRating.id,
            rating: creatorRating.rating,
            feedback: creatorRating.feedback,
            createdAt: creatorRating.createdAt,
            user: {
                username: user.username,
                name: user.name,
                image: user.image,
            }
        })
        .from(creatorRating)
        .innerJoin(user, eq(creatorRating.userId, user.id))
        .where(eq(creatorRating.creatorProfileId, id))
        .orderBy(desc(creatorRating.createdAt))
        .limit(10)

    // Get creator's posts
    const creatorPosts = await db
        .select()
        .from(post)
        .where(eq(post.creatorId, id))
        .limit(20)

    return c.json({
        creator: {
            ...creator,
            subscriberCount,
            averageRating: ratingStats?.averageRating ? parseFloat(Number(ratingStats.averageRating).toFixed(1)) : 0,
            ratingCount: ratingStats?.ratingCount || 0,
        },
        posts: creatorPosts,
        feedback: feedbackList,
    })
})

// GET /api/creators/u/:username — get creator profile by username
creatorsRoutes.get('/u/:username', async (c) => {
    const username = c.req.param('username')
    const viewerUserId = c.req.query('viewerUserId')

    const [creator] = await db
        .select({
            id: creatorProfile.id,
            pseudonym: creatorProfile.pseudonym,
            bio: creatorProfile.bio,
            kycStatus: creatorProfile.kycStatus,
            verticalId: creatorProfile.verticalId,
            verticalName: vertical.name,
            verticalSlug: vertical.slug,
            subscriptionPrice: creatorProfile.subscriptionPrice,
            payoutAddress: creatorProfile.payoutAddress,
            createdAt: creatorProfile.createdAt,
            // We can also return user data if needed
            username: user.username,
            image: user.image,
            userId: creatorProfile.userId,
        })
        .from(creatorProfile)
        .leftJoin(vertical, eq(creatorProfile.verticalId, vertical.id))
        .innerJoin(user, eq(creatorProfile.userId, user.id))
        .where(eq(user.username, username))

    if (!creator) {
        return c.json({ error: 'Creator not found' }, 404)
    }

    // Check if viewer is subscribed
    let isSubscribed = false
    if (viewerUserId) {
        const [sub] = await db
            .select()
            .from(subscription)
            .where(
                and(
                    eq(subscription.subscriberUserId, viewerUserId),
                    eq(subscription.creatorProfileId, creator.id),
                    eq(subscription.status, 'active')
                )
            )
        if (sub) isSubscribed = true
    }

    // Get subscriber count
    const [{ count: subscriberCount }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(subscription)
        .where(
            and(
                eq(subscription.creatorProfileId, creator.id),
                eq(subscription.status, 'active')
            )
        )

    // Get rating stats
    const [ratingStats] = await db
        .select({
            averageRating: avg(creatorRating.rating),
            ratingCount: count(creatorRating.id),
        })
        .from(creatorRating)
        .where(eq(creatorRating.creatorProfileId, creator.id))

    // Get feedback list
    const feedbackList = await db
        .select({
            id: creatorRating.id,
            rating: creatorRating.rating,
            feedback: creatorRating.feedback,
            createdAt: creatorRating.createdAt,
            user: {
                username: user.username,
                name: user.name,
                image: user.image,
            }
        })
        .from(creatorRating)
        .innerJoin(user, eq(creatorRating.userId, user.id))
        .where(eq(creatorRating.creatorProfileId, creator.id))
        .orderBy(desc(creatorRating.createdAt))
        .limit(10)

    // Get creator's posts
    const creatorPosts = await db
        .select()
        .from(post)
        .where(eq(post.creatorId, creator.id))
        .orderBy(desc(post.isPinned), desc(post.createdAt)) // Ensure pinned post first, then recent
        .limit(20)

    return c.json({
        creator: {
            ...creator,
            subscriberCount,
            isSubscribed,
            averageRating: ratingStats?.averageRating ? parseFloat(Number(ratingStats.averageRating).toFixed(1)) : 0,
            ratingCount: ratingStats?.ratingCount || 0,
        },
        posts: creatorPosts,
        feedback: feedbackList,
    })
})

// GET /api/creators/user/:userId — get creator profile by userId
creatorsRoutes.get('/user/:userId', async (c) => {
    const userId = c.req.param('userId')
    const viewerUserId = c.req.query('viewerUserId')

    const [creator] = await db
        .select({
            id: creatorProfile.id,
            pseudonym: creatorProfile.pseudonym,
            bio: creatorProfile.bio,
            kycStatus: creatorProfile.kycStatus,
            verticalId: creatorProfile.verticalId,
            verticalName: vertical.name,
            verticalSlug: vertical.slug,
            subscriptionPrice: creatorProfile.subscriptionPrice,
            payoutAddress: creatorProfile.payoutAddress,
            createdAt: creatorProfile.createdAt,
            username: user.username,
            image: user.image,
            userId: creatorProfile.userId,
        })
        .from(creatorProfile)
        .leftJoin(vertical, eq(creatorProfile.verticalId, vertical.id))
        .innerJoin(user, eq(creatorProfile.userId, user.id))
        .where(eq(creatorProfile.userId, userId))

    if (!creator) {
        return c.json({ error: 'Creator not found' }, 404)
    }

    // Check if viewer is subscribed
    let isSubscribed = false
    if (viewerUserId) {
        const [sub] = await db
            .select()
            .from(subscription)
            .where(
                and(
                    eq(subscription.subscriberUserId, viewerUserId),
                    eq(subscription.creatorProfileId, creator.id),
                    eq(subscription.status, 'active')
                )
            )
        if (sub) isSubscribed = true
    }

    // Get subscriber count
    const [{ count: subscriberCount }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(subscription)
        .where(
            and(
                eq(subscription.creatorProfileId, creator.id),
                eq(subscription.status, 'active')
            )
        )

    // Get rating stats
    const [ratingStats] = await db
        .select({
            averageRating: avg(creatorRating.rating),
            ratingCount: count(creatorRating.id),
        })
        .from(creatorRating)
        .where(eq(creatorRating.creatorProfileId, creator.id))

    // Get feedback list
    const feedbackList = await db
        .select({
            id: creatorRating.id,
            rating: creatorRating.rating,
            feedback: creatorRating.feedback,
            createdAt: creatorRating.createdAt,
            user: {
                username: user.username,
                name: user.name,
                image: user.image,
            }
        })
        .from(creatorRating)
        .innerJoin(user, eq(creatorRating.userId, user.id))
        .where(eq(creatorRating.creatorProfileId, creator.id))
        .orderBy(desc(creatorRating.createdAt))
        .limit(10)

    // Get creator's posts
    const creatorPosts = await db
        .select()
        .from(post)
        .where(eq(post.creatorId, creator.id))
        .orderBy(desc(post.isPinned), desc(post.createdAt))
        .limit(20)

    return c.json({
        creator: {
            ...creator,
            subscriberCount,
            isSubscribed,
            averageRating: ratingStats?.averageRating ? parseFloat(Number(ratingStats.averageRating).toFixed(1)) : 0,
            ratingCount: ratingStats?.ratingCount || 0,
        },
        posts: creatorPosts,
        feedback: feedbackList,
    })
})

// POST /api/creators/onboard — creator onboarding
creatorsRoutes.post('/onboard', async (c) => {
    const body = await c.req.json()
    const { userId, pseudonym, verticalId, kycDocumentType, selfCertificationSigned } = body

    if (!userId || !pseudonym || !verticalId || !selfCertificationSigned) {
        return c.json({ error: 'Missing required fields' }, 400)
    }

    const [profile] = await db.insert(creatorProfile).values({
        userId,
        pseudonym,
        verticalId,
        kycDocumentType,
        selfCertificationSigned,
        selfCertificationDate: new Date(),
        kycStatus: 'pending',
    }).returning()

    return c.json(profile, 201)
})

// PUT /api/creators/:id — update creator profile (bio, payout info)
creatorsRoutes.put('/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { bio, pseudonym, payoutAddress, payoutMethod, subscriptionPrice } = body

    if (!bio && pseudonym === undefined && !payoutAddress && !payoutMethod && subscriptionPrice === undefined) {
        return c.json({ error: 'Nothing to update' }, 400)
    }

    const [updatedCreator] = await db
        .update(creatorProfile)
        .set({
            ...(bio && { bio }),
            ...(pseudonym !== undefined && { pseudonym }),
            ...(payoutAddress && { payoutAddress }),
            ...(payoutMethod && { payoutMethod }),
            ...(subscriptionPrice !== undefined && { subscriptionPrice: String(subscriptionPrice) }),
            updatedAt: new Date(),
        })
        .where(eq(creatorProfile.id, id))
        .returning()

    if (!updatedCreator) {
        return c.json({ error: 'Creator not found' }, 404)
    }

    return c.json(updatedCreator)
})

// POST /api/creators/:id/rate — rate a creator
creatorsRoutes.post('/:id/rate', async (c) => {
    const creatorProfileId = c.req.param('id')
    const body = await c.req.json()
    const { userId, rating, feedback } = body

    if (!userId || !rating || rating < 1 || rating > 5) {
        return c.json({ error: 'Valid userId and rating (1-5) are required' }, 400)
    }

    // Must be an active subscriber to rate
    const [sub] = await db
        .select()
        .from(subscription)
        .where(
            and(
                eq(subscription.subscriberUserId, userId),
                eq(subscription.creatorProfileId, creatorProfileId),
                eq(subscription.status, 'active')
            )
        )

    if (!sub) {
        return c.json({ error: 'You must be an active subscriber to leave a review.' }, 403)
    }

    try {
        const [upserted] = await db.insert(creatorRating)
            .values({
                creatorProfileId,
                userId,
                rating,
                feedback: feedback || null,
            })
            .onConflictDoUpdate({
                target: [creatorRating.creatorProfileId, creatorRating.userId],
                set: {
                    rating,
                    feedback: feedback || null,
                }
            })
            .returning()

        return c.json(upserted, 201)
    } catch (e: any) {
        return c.json({ error: 'Failed to rate creator: ' + e.message }, 500)
    }
})

export default creatorsRoutes
