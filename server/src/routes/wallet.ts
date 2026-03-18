import { Hono } from 'hono'
import { auth } from '../auth.js'
import { db } from '../db/index.js'
import { wallet } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { generateAndEncryptWallet, decryptWallet } from '../lib/kms.js'
import { getRpcConnection, signWithRelayer } from '../lib/relayer.js'
import { getUsdcBalance } from '../lib/usdc.js'
import { VersionedTransaction } from '@solana/web3.js'
import bs58 from 'bs58'

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
        const userKeypair = decryptWallet(
            userWallet.encryptedPrivateKey,
            userWallet.iv,
            userWallet.authTag
        )
        const secretKeyBase58 = bs58.encode(userKeypair.secretKey)
        return c.json({ privateKey: secretKeyBase58 })
    } catch (error) {
        console.error('Failed to export wallet:', error)
        return c.json({ error: 'Failed to decrypt wallet' }, 500)
    }
})

// POST /api/wallet/sign - Sign and relay a transaction
walletRoutes.post('/sign', async (c) => {
    const user = c.get('user')

    try {
        const body = await c.req.json()
        const { transactionBase64 } = body

        if (!transactionBase64) {
            return c.json({ error: 'transactionBase64 is required' }, 400)
        }

        const userWallet = await db.query.wallet.findFirst({
            where: eq(wallet.userId, user.id)
        })

        if (!userWallet) {
            return c.json({ error: 'User wallet not found. Call /api/wallet/create first.' }, 404)
        }

        const userKeypair = decryptWallet(
            userWallet.encryptedPrivateKey,
            userWallet.iv,
            userWallet.authTag
        )

        // Deserialize transaction
        const txBytes = Buffer.from(transactionBase64, 'base64')
        const transaction = VersionedTransaction.deserialize(txBytes)

        // Sign as the user
        transaction.sign([userKeypair])

        // Sign as the relayer (fee payer)
        signWithRelayer(transaction)

        // Broadcast to RPC
        const connection = getRpcConnection()
        const signature = await connection.sendRawTransaction(transaction.serialize(), {
            skipPreflight: false,
            maxRetries: 3
        })

        // Wait for confirmation implicitly or just return signature
        // It's usually better to just return the signature and let frontend/background confirm
        return c.json({ signature })
    } catch (error: any) {
        console.error('Failed to sign and relay transaction:', error)
        return c.json({ error: error.message || 'Transaction failed' }, 500)
    }
})

export default walletRoutes
