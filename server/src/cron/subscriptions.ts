import { db } from '../db/index.js'
import { subscription, wallet, creatorProfile } from '../db/schema.js'
import { eq, and, lte } from 'drizzle-orm'
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

export async function processDueSubscriptions() {
    console.log('[CRON] Checking for due subscriptions...')
    const now = new Date()

    const dueSubscriptions = await db
        .select({
            sub: subscription,
            subscriberWallet: wallet,
            creator: creatorProfile,
        })
        .from(subscription)
        .innerJoin(wallet, eq(subscription.subscriberUserId, wallet.userId))
        .innerJoin(creatorProfile, eq(subscription.creatorProfileId, creatorProfile.id))
        .where(
            and(
                eq(subscription.status, 'active'),
                lte(subscription.nextBillingDate, now)
            )
        )

    console.log(`[CRON] Found ${dueSubscriptions.length} due subscriptions.`)

    const connection = getRpcConnection()
    const relayer = getRelayerKeypair()
    const platformWalletStr = process.env.VITE_PLATFORM_WALLET

    for (const { sub, subscriberWallet, creator } of dueSubscriptions) {
        try {
            console.log(`[CRON] Processing subscription ${sub.id} (User: ${subscriberWallet.userId} -> Creator: ${creator.id})`)
            const priceUsdc = parseFloat(sub.amountUsdc || '0')
            if (priceUsdc <= 0) {
                // Free subscriptions just get their date bumped
                await bumpSubscriptionDate(sub.id)
                continue
            }

            let finalCreatorPayoutAddress = creator.payoutAddress
            if (!finalCreatorPayoutAddress) {
                const [creatorWallet] = await db.select().from(wallet).where(eq(wallet.userId, creator.userId))
                if (creatorWallet) {
                    finalCreatorPayoutAddress = creatorWallet.publicKey
                } else {
                    console.warn(`[CRON] Creator ${creator.id} has no payout address, skipping.`)
                    continue
                }
            }

            // --- Construct USDC Transfer ---
            const subscriberKeypair = decryptWallet(
                subscriberWallet.encryptedPrivateKey,
                subscriberWallet.iv,
                subscriberWallet.authTag
            )
            const payerPubkey = subscriberKeypair.publicKey
            const creatorPubkey = new PublicKey(finalCreatorPayoutAddress)

            const totalAmount = Math.round(priceUsdc * 10 ** USDC_DECIMALS)
            const creatorAmount = Math.round(totalAmount * (CREATOR_SHARE_PERCENT / 100))
            const platformAmount = totalAmount - creatorAmount

            const transaction = new Transaction()

            // ATAs
            const payerAta = getAssociatedTokenAddressSync(USDC_MINT, payerPubkey)
            const creatorAta = getAssociatedTokenAddressSync(USDC_MINT, creatorPubkey)

            // Check creator ATA
            const creatorAtaInfo = await connection.getAccountInfo(creatorAta)
            if (!creatorAtaInfo) {
                transaction.add(
                    createAssociatedTokenAccountInstruction(
                        relayer.publicKey, // Relayer pays for ATA creation
                        creatorAta,
                        creatorPubkey,
                        USDC_MINT
                    )
                )
            }

            // Transfer to creator (must use payer proxy)
            if (creatorAmount > 0) {
                transaction.add(
                    createTransferInstruction(
                        payerAta,
                        creatorAta,
                        payerPubkey,
                        creatorAmount
                    )
                )
            }

            // Transfer to platform
            if (platformAmount > 0 && platformWalletStr) {
                const platformPubkey = new PublicKey(platformWalletStr)
                const platformAta = getAssociatedTokenAddressSync(USDC_MINT, platformPubkey)

                const platformAtaInfo = await connection.getAccountInfo(platformAta)
                if (!platformAtaInfo) {
                    transaction.add(
                        createAssociatedTokenAccountInstruction(
                            relayer.publicKey, // Relayer pays for ATA creation
                            platformAta,
                            platformPubkey,
                            USDC_MINT
                        )
                    )
                }

                transaction.add(
                    createTransferInstruction(
                        payerAta,
                        platformAta,
                        payerPubkey,
                        platformAmount
                    )
                )
            }

            // Sign and Send
            const { blockhash } = await connection.getLatestBlockhash()
            transaction.recentBlockhash = blockhash
            transaction.feePayer = relayer.publicKey

            transaction.sign(subscriberKeypair, relayer)

            const signature = await connection.sendRawTransaction(transaction.serialize(), {
                skipPreflight: false,
                maxRetries: 3
            })

            console.log(`[CRON] Processed subscription ${sub.id}: ${signature}`)

            // Update next billing date
            await bumpSubscriptionDate(sub.id, signature)

        } catch (error) {
            console.error(`[CRON] Error processing subscription ${sub.id}:`, error)
            // Optionally update status to 'failed' or similar logic here
        }
    }
}

async function bumpSubscriptionDate(subscriptionId: string, txSignature?: string) {
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + 30) // Bump by 30 days

    await db.update(subscription)
        .set({
            nextBillingDate: nextDate,
            ...(txSignature ? { txSignature } : {})
        })
        .where(eq(subscription.id, subscriptionId))
}

export function startSubscriptionCron() {
    // Run once on startup, then every 24 hours
    processDueSubscriptions().catch(console.error)
    setInterval(() => processDueSubscriptions().catch(console.error), 24 * 60 * 60 * 1000)
}
