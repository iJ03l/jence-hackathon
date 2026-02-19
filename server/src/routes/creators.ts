import { Hono } from 'hono'
import { db } from '../db/index.js'
import { creatorProfile, post, subscription, vertical } from '../db/schema.js'
import { eq, sql } from 'drizzle-orm'

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

// POST /api/creators/onboard — creator onboarding
creatorsRoutes.post('/onboard', async (c) => {
    const body = await c.req.json()
    const { userId, pseudonym, verticalId, kycDocumentType, selfCertificationSigned } = body

    if (!userId || !pseudonym || !verticalId || !kycDocumentType || !selfCertificationSigned) {
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

export default creatorsRoutes
