import { Hono } from 'hono'
import { db } from '../db/index.js'
import { subscription, creatorProfile, wallet } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { decryptWallet } from '../lib/kms.js'
import { getRpcConnection, signWithRelayer, getRelayerKeypair } from '../lib/relayer.js'
import { PublicKey, Transaction } from '@solana/web3.js'
import {
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
} from '@solana/spl-token'

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
const USDC_DECIMALS = 6
const CREATOR_SHARE_PERCENT = parseInt(process.env.VITE_CREATOR_PAYOUT_PERCENT || '80', 10)

const subscriptionsRoutes = new Hono()

// POST /api/subscriptions — subscribe to a creator
subscriptionsRoutes.post('/', async (c) => {
    const body = await c.req.json()
    const { subscriberUserId, creatorProfileId } = body

    if (!subscriberUserId || !creatorProfileId) {
        return c.json({ error: 'Missing required fields' }, 400)
    }

    // Check if already subscribed
    const [existing] = await db
        .select()
        .from(subscription)
        .where(
            and(
                eq(subscription.subscriberUserId, subscriberUserId),
                eq(subscription.creatorProfileId, creatorProfileId)
            )
        )

    if (existing) {
        return c.json({ error: 'Already subscribed' }, 409)
    }

    // Look up creator
    const [creator] = await db
        .select({ subscriptionPrice: creatorProfile.subscriptionPrice, payoutAddress: creatorProfile.payoutAddress, userId: creatorProfile.userId })
        .from(creatorProfile)
        .where(eq(creatorProfile.id, creatorProfileId))

    if (!creator) {
        return c.json({ error: 'Creator not found' }, 404)
    }

    const price = parseFloat(creator.subscriptionPrice || '0')
    let txSignature = null

    console.log(`[SUB] Subscriber ${subscriberUserId} -> Creator ${creatorProfileId} | Price: $${price} USDC`)

    // If price > 0, we must process the initial payment natively
    if (price > 0) {
        console.log(`[SUB] Paid subscription — building USDC transfer...`)
        let finalCreatorPayoutAddress = creator.payoutAddress

        if (!finalCreatorPayoutAddress) {
            const [creatorWallet] = await db.select().from(wallet).where(eq(wallet.userId, creator.userId))
            if (creatorWallet) {
                finalCreatorPayoutAddress = creatorWallet.publicKey
            } else {
                return c.json({ error: 'Creator has not set up a payout wallet yet.' }, 400)
            }
        }

        const [subscriberWallet] = await db.select().from(wallet).where(eq(wallet.userId, subscriberUserId))
        if (!subscriberWallet) {
            return c.json({ error: 'You do not have a wallet set up. Please go to Settings to create one.' }, 400)
        }

        try {
            const connection = getRpcConnection()
            const relayer = getRelayerKeypair()
            const platformWalletStr = process.env.VITE_PLATFORM_WALLET

            const subscriberKeypair = decryptWallet(
                subscriberWallet.encryptedPrivateKey,
                subscriberWallet.iv,
                subscriberWallet.authTag
            )
            const payerPubkey = subscriberKeypair.publicKey
            const creatorPubkey = new PublicKey(finalCreatorPayoutAddress)

            const totalAmount = Math.round(price * 10 ** USDC_DECIMALS)
            const creatorAmount = Math.round(totalAmount * (CREATOR_SHARE_PERCENT / 100))
            const platformAmount = totalAmount - creatorAmount

            const transaction = new Transaction()

            const payerAta = getAssociatedTokenAddressSync(USDC_MINT, payerPubkey)
            const creatorAta = getAssociatedTokenAddressSync(USDC_MINT, creatorPubkey)

            const creatorAtaInfo = await connection.getAccountInfo(creatorAta)
            if (!creatorAtaInfo) {
                transaction.add(createAssociatedTokenAccountInstruction(relayer.publicKey, creatorAta, creatorPubkey, USDC_MINT))
            }

            if (creatorAmount > 0) {
                transaction.add(createTransferInstruction(payerAta, creatorAta, payerPubkey, creatorAmount))
            }

            if (platformAmount > 0 && platformWalletStr) {
                const platformPubkey = new PublicKey(platformWalletStr)
                const platformAta = getAssociatedTokenAddressSync(USDC_MINT, platformPubkey)

                const platformAtaInfo = await connection.getAccountInfo(platformAta)
                if (!platformAtaInfo) {
                    transaction.add(createAssociatedTokenAccountInstruction(relayer.publicKey, platformAta, platformPubkey, USDC_MINT))
                }
                transaction.add(createTransferInstruction(payerAta, platformAta, payerPubkey, platformAmount))
            }

            const { blockhash } = await connection.getLatestBlockhash()
            transaction.recentBlockhash = blockhash
            transaction.feePayer = relayer.publicKey

            transaction.sign(subscriberKeypair, relayer)

            txSignature = await connection.sendRawTransaction(transaction.serialize(), {
                skipPreflight: true,
                maxRetries: 3
            })
            console.log(`[SUB] ✅ Payment broadcast! TX: ${txSignature}`)
            console.log(`[SUB]    Solscan: https://solscan.io/tx/${txSignature}`)
        } catch (error: any) {
            console.error('Subscription payment error:', error)
            return c.json({ error: 'Payment failed. Ensure your wallet has enough USDC.' }, 402)
        }
    } else {
        console.log(`[SUB] Free subscription — no USDC payment processed.`)
    }

    // Set next billing date to 30 days from now
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + 30)

    const [sub] = await db.insert(subscription).values({
        subscriberUserId,
        creatorProfileId,
        txSignature: txSignature,
        amountUsdc: price > 0 ? String(price) : null,
        nextBillingDate: nextDate,
        status: 'active'
    }).returning()

    console.log(`[SUB] ✅ Subscription ${sub.id} created | Next billing: ${nextDate.toISOString()} | TX: ${txSignature || 'N/A (free)'}`)

    return c.json(sub, 201)
})

// DELETE /api/subscriptions/:id — unsubscribe
subscriptionsRoutes.delete('/:id', async (c) => {
    const id = c.req.param('id')

    const [deleted] = await db
        .delete(subscription)
        .where(eq(subscription.id, id))
        .returning()

    if (!deleted) {
        return c.json({ error: 'Subscription not found' }, 404)
    }

    return c.json({ success: true })
})

export default subscriptionsRoutes
