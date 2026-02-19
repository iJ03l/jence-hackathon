import { Resend } from 'resend'
import { db } from '../db/index.js'
import { notification, subscription, user, creatorProfile, vertical } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.FROM_EMAIL || 'Jence <notifications@jence.io>'

/**
 * Called after a new post is created.
 * 1. Finds all subscribers of the creator
 * 2. Creates in-app notification for each
 * 3. Sends email via Resend to each subscriber
 */
export async function notifySubscribersOfNewPost(postData: {
    id: string
    title: string
    excerpt: string | null
    creatorId: string
    verticalId: string
}) {
    try {
        // Get creator info
        const [creator] = await db
            .select({
                pseudonym: creatorProfile.pseudonym,
                verticalId: creatorProfile.verticalId,
            })
            .from(creatorProfile)
            .where(eq(creatorProfile.id, postData.creatorId))

        if (!creator) return

        // Get vertical name
        const [vert] = await db
            .select({ name: vertical.name })
            .from(vertical)
            .where(eq(vertical.id, postData.verticalId))

        // Get all active subscribers
        const subs = await db
            .select({
                userId: subscription.subscriberUserId,
            })
            .from(subscription)
            .where(eq(subscription.creatorProfileId, postData.creatorId))

        if (subs.length === 0) return

        // Get subscriber emails
        const subscriberIds = subs.map(s => s.userId)

        for (const subId of subscriberIds) {
            const [subscriber] = await db
                .select({ email: user.email, name: user.name })
                .from(user)
                .where(eq(user.id, subId))

            if (!subscriber) continue

            // Create in-app notification
            await db.insert(notification).values({
                userId: subId,
                type: 'new_post',
                title: `New post from ${creator.pseudonym}`,
                body: postData.title,
                postId: postData.id,
                creatorPseudonym: creator.pseudonym,
            })

            // Send email via Resend
            if (process.env.RESEND_API_KEY) {
                try {
                    await resend.emails.send({
                        from: FROM_EMAIL,
                        to: subscriber.email,
                        subject: `📝 ${creator.pseudonym} published: "${postData.title}"`,
                        html: `
                            <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px;">
                                <div style="text-align: center; margin-bottom: 24px;">
                                    <div style="display: inline-block; background: #D4AF37; border-radius: 8px; padding: 6px 10px;">
                                        <span style="color: #1a1a1a; font-weight: bold; font-size: 14px;">⚡ Jence</span>
                                    </div>
                                </div>
                                <p style="color: #888; font-size: 13px; margin-bottom: 4px;">${vert?.name || 'Expert Analysis'}</p>
                                <h2 style="color: #fff; font-size: 18px; margin: 0 0 8px;">${postData.title}</h2>
                                <p style="color: #aaa; font-size: 14px; line-height: 1.5; margin-bottom: 4px;">
                                    by <strong style="color: #D4AF37;">${creator.pseudonym}</strong>
                                </p>
                                ${postData.excerpt ? `<p style="color: #888; font-size: 13px; line-height: 1.5; margin-top: 12px; padding: 12px; background: #222; border-radius: 8px;">${postData.excerpt}</p>` : ''}
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                                   style="display: inline-block; margin-top: 20px; background: #D4AF37; color: #1a1a1a; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                                    Read on Jence →
                                </a>
                                <p style="color: #555; font-size: 11px; margin-top: 32px; border-top: 1px solid #333; padding-top: 16px;">
                                    You're receiving this because you subscribed to ${creator.pseudonym} on Jence.
                                </p>
                            </div>
                        `,
                    })
                } catch (emailErr) {
                    console.error(`Failed to send email to ${subscriber.email}:`, emailErr)
                }
            }
        }

        console.log(`✉️ Notified ${subs.length} subscribers of new post by ${creator.pseudonym}`)
    } catch (err) {
        console.error('Failed to notify subscribers:', err)
    }
}
