import { Hono } from 'hono'
import { db } from '../db/index.js'
import { creatorProfile, post, subscription, vertical, user } from '../db/schema.js'
import { eq, sql, and, desc } from 'drizzle-orm'

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
            verticalName: vertical.name,
            verticalSlug: vertical.slug,
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
        .where(eq(subscription.creatorProfileId, id))

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
        },
        posts: creatorPosts,
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
            verticalName: vertical.name,
            verticalSlug: vertical.slug,
            createdAt: creatorProfile.createdAt,
            // We can also return user data if needed
            username: user.username,
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
        .where(eq(subscription.creatorProfileId, creator.id))

    // Get creator's posts
    const creatorPosts = await db
        .select()
        .from(post)
        .where(eq(post.creatorId, creator.id))
        .orderBy(desc(post.createdAt)) // Ensure recent posts first
        .limit(20)

    return c.json({
        creator: {
            ...creator,
            subscriberCount,
            isSubscribed,
        },
        posts: creatorPosts,
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
    const { bio, payoutAddress, payoutMethod } = body

    if (!bio && !payoutAddress && !payoutMethod) {
        return c.json({ error: 'Nothing to update' }, 400)
    }

    const [updatedCreator] = await db
        .update(creatorProfile)
        .set({
            ...(bio && { bio }),
            ...(payoutAddress && { payoutAddress }),
            ...(payoutMethod && { payoutMethod }),
            updatedAt: new Date(),
        })
        .where(eq(creatorProfile.id, id))
        .returning()

    if (!updatedCreator) {
        return c.json({ error: 'Creator not found' }, 404)
    }

    return c.json(updatedCreator)
})

export default creatorsRoutes
