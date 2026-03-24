import { db } from '../db/index.js'
import { subscription, wallet, creatorProfile } from '../db/schema.js'
import { eq, and, lte } from 'drizzle-orm'
import { decryptPrivateKey } from '../lib/kms.js'
import { sendUsdcWithSplit } from '../lib/flow-tx.js'

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

    const platformWalletAddr = process.env.FLOW_PLATFORM_WALLET

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

            // Decrypt subscriber key and send USDC via Flow
            const subscriberPrivateKey = decryptPrivateKey(
                subscriberWallet.encryptedPrivateKey,
                subscriberWallet.iv,
                subscriberWallet.authTag
            )

            const txId = await sendUsdcWithSplit({
                senderAddress: subscriberWallet.publicKey,
                senderPrivateKey: subscriberPrivateKey,
                senderKeyIndex: 0,
                creatorAddress: finalCreatorPayoutAddress,
                platformAddress: platformWalletAddr,
                totalUsdc: priceUsdc,
                creatorSharePercent: CREATOR_SHARE_PERCENT,
            })

            console.log(`[CRON] Processed subscription ${sub.id}: ${txId}`)

            // Update next billing date
            await bumpSubscriptionDate(sub.id, txId)

        } catch (error) {
            console.error(`[CRON] Error processing subscription ${sub.id}:`, error)
            // Optionally update status to 'failed' or similar logic here
        }
    }
}

async function bumpSubscriptionDate(subscriptionId: string, txId?: string) {
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + 30) // Bump by 30 days

    await db.update(subscription)
        .set({
            nextBillingDate: nextDate,
            ...(txId ? { txSignature: txId } : {})
        })
        .where(eq(subscription.id, subscriptionId))
}

export function startSubscriptionCron() {
    // Run once on startup, then every 24 hours
    processDueSubscriptions().catch(console.error)
    setInterval(() => processDueSubscriptions().catch(console.error), 24 * 60 * 60 * 1000)
}
