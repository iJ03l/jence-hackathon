import { Hono } from 'hono'
import { db } from '../db/index.js'
import { launchNote, user } from '../db/schema.js'
import { eq, desc, and } from 'drizzle-orm'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { requireAuth, optionalAuth } from '../middleware/auth.js'

type Variables = {
    user: any
    authSession: any
}

const launchRoutes = new Hono<{ Variables: Variables }>()

// GET /api/launches — public list (only approved), or all for admin
launchRoutes.get('/', optionalAuth, async (c) => {
    const userFromSession = c.get('user')
    const status = c.req.query('status') // admin can filter by status

    // Admin sees all (with optional status filter)
    if (userFromSession?.role === 'admin') {
        const filter = status ? eq(launchNote.status, status) : undefined
        const launches = await db
            .select({
                id: launchNote.id,
                name: launchNote.name,
                company: launchNote.company,
                summary: launchNote.summary,
                tags: launchNote.tags,
                disclosure: launchNote.disclosure,
                status: launchNote.status,
                reviewNote: launchNote.reviewNote,
                createdAt: launchNote.createdAt,
                userId: launchNote.userId,
                authorName: user.name,
                authorUsername: user.username,
            })
            .from(launchNote)
            .leftJoin(user, eq(launchNote.userId, user.id))
            .where(filter)
            .orderBy(desc(launchNote.createdAt))
            .limit(50)

        return c.json(launches.map(l => ({ ...l, tags: JSON.parse(l.tags) })))
    }

    // Public: only approved launches
    const launches = await db
        .select({
            id: launchNote.id,
            name: launchNote.name,
            company: launchNote.company,
            summary: launchNote.summary,
            tags: launchNote.tags,
            status: launchNote.status,
            createdAt: launchNote.createdAt,
            authorName: user.name,
            authorUsername: user.username,
        })
        .from(launchNote)
        .leftJoin(user, eq(launchNote.userId, user.id))
        .where(eq(launchNote.status, 'approved'))
        .orderBy(desc(launchNote.createdAt))
        .limit(50)

    return c.json(launches.map(l => ({ ...l, tags: JSON.parse(l.tags) })))
})

// GET /api/launches/my — user's own submissions
launchRoutes.get('/my', requireAuth, async (c) => {
    const userFromSession = c.get('user')

    const myLaunches = await db
        .select()
        .from(launchNote)
        .where(eq(launchNote.userId, userFromSession.id))
        .orderBy(desc(launchNote.createdAt))

    return c.json(myLaunches.map(l => ({ ...l, tags: JSON.parse(l.tags) })))
})

// POST /api/launches — submit a new launch (any logged-in user)
const createLaunchSchema = z.object({
    name: z.string().min(1).max(200),
    company: z.string().min(1).max(200),
    summary: z.string().min(10).max(2000),
    tags: z.array(z.string().max(50)).max(5).optional(),
    disclosure: z.string().max(2000).optional(),
})

launchRoutes.post('/', requireAuth, zValidator('json', createLaunchSchema), async (c) => {
    const userFromSession = c.get('user')
    const { name, company, summary, tags, disclosure } = c.req.valid('json')

    const [newLaunch] = await db.insert(launchNote).values({
        userId: userFromSession.id,
        name,
        company,
        summary,
        tags: JSON.stringify(tags || []),
        disclosure: disclosure?.trim() || null,
        status: 'pending', // always pending until admin approves
    }).returning()

    return c.json({ success: true, launch: { ...newLaunch, tags: JSON.parse(newLaunch.tags) } }, 201)
})

// PUT /api/launches/:id/review — admin approve/reject
const reviewSchema = z.object({
    status: z.enum(['approved', 'rejected']),
    reviewNote: z.string().max(1000).optional(),
})

launchRoutes.put('/:id/review', requireAuth, zValidator('json', reviewSchema), async (c) => {
    const userFromSession = c.get('user')

    if (userFromSession.role !== 'admin') {
        return c.json({ error: 'Admin access required' }, 403)
    }

    const id = c.req.param('id')
    const { status, reviewNote } = c.req.valid('json')

    const existing = await db.query.launchNote.findFirst({
        where: eq(launchNote.id, id)
    })

    if (!existing) return c.json({ error: 'Launch not found' }, 404)

    const [updated] = await db.update(launchNote)
        .set({
            status,
            reviewedBy: userFromSession.id,
            reviewNote: reviewNote?.trim() || null,
            updatedAt: new Date(),
        })
        .where(eq(launchNote.id, id))
        .returning()

    return c.json({ success: true, launch: { ...updated, tags: JSON.parse(updated.tags) } })
})

// DELETE /api/launches/:id — delete own submission (or admin)
launchRoutes.delete('/:id', requireAuth, async (c) => {
    const id = c.req.param('id')
    const userFromSession = c.get('user')

    const existing = await db.query.launchNote.findFirst({
        where: eq(launchNote.id, id)
    })

    if (!existing) return c.json({ error: 'Launch not found' }, 404)

    if (existing.userId !== userFromSession.id && userFromSession.role !== 'admin') {
        return c.json({ error: 'Unauthorized' }, 403)
    }

    await db.delete(launchNote).where(eq(launchNote.id, id))
    return c.json({ success: true })
})

export default launchRoutes
