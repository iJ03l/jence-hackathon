import { Hono } from 'hono'
import { auth } from '../auth.js'
import { db } from '../db/index.js'
import { wallet } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { generateAndEncryptWallet, decryptPrivateKey } from '../lib/kms.js'
import { getUsdcBalance } from '../lib/usdc.js'

type Variables = {
    user: {
        id: string
        name: string
        email: string
    }
}

const walletRoutes = new Hono<{ Variables: Variables }>()

// Require Better Auth for all wallet routes
walletRoutes.use('/*', async (c, next) => {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers
    })

    if (!session || !session.user) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    c.set('user', session.user as any)
    await next()
})

// GET /api/wallet/me - Get the user's managed wallet address
walletRoutes.get('/me', async (c) => {
    const user = c.get('user')

    const userWallet = await db.query.wallet.findFirst({
        where: eq(wallet.userId, user.id)
    })

    if (!userWallet) {
        return c.json({ address: null, usdcBalance: 0 })
    }

    const usdcBalance = await getUsdcBalance(userWallet.publicKey)

    return c.json({ address: userWallet.publicKey, usdcBalance })
})

// POST /api/wallet/create - Create a new managed wallet for the user
walletRoutes.post('/create', async (c) => {
    const user = c.get('user')

    const existingWallet = await db.query.wallet.findFirst({
        where: eq(wallet.userId, user.id)
    })

    if (existingWallet) {
        return c.json({ address: existingWallet.publicKey })
    }

    const { publicKey, encryptedPrivateKey, iv, authTag } = generateAndEncryptWallet()

    await db.insert(wallet).values({
        userId: user.id,
        publicKey,
        encryptedPrivateKey,
        iv,
        authTag
    })

    return c.json({ address: publicKey }, 201)
})

// GET /api/wallet/export - Export the user's private key
walletRoutes.get('/export', async (c) => {
    const user = c.get('user')

    const userWallet = await db.query.wallet.findFirst({
        where: eq(wallet.userId, user.id)
    })

    if (!userWallet) {
        return c.json({ error: 'Wallet not found' }, 404)
    }

    try {
        const privateKeyHex = decryptPrivateKey(
            userWallet.encryptedPrivateKey,
            userWallet.iv,
            userWallet.authTag
        )
        return c.json({ privateKey: privateKeyHex })
    } catch (error) {
        console.error('Failed to export wallet:', error)
        return c.json({ error: 'Failed to decrypt wallet' }, 500)
    }
})

export default walletRoutes
