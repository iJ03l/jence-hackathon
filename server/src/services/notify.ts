import { Resend } from 'resend'
import { db } from '../db/index.js'
import { notification, subscription, user, creatorProfile, vertical } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { getFrontendUrl, renderPlainTextEmail, renderPremiumEmail } from '../lib/email.js'

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
    verticalId: string | null
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
        const [vert] = postData.verticalId 
            ? await db
                .select({ name: vertical.name })
                .from(vertical)
                .where(eq(vertical.id, postData.verticalId))
            : [null]

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
                    const postUrl = getFrontendUrl(`/post/${postData.id}`)
                    const intro = subscriber.name
                        ? `${subscriber.name}, ${creator.pseudonym} just published a new article for readers following their work on Jence.`
                        : `${creator.pseudonym} just published a new article for readers following their work on Jence.`
                    const footer = `You are receiving this update because you subscribed to ${creator.pseudonym} on Jence.\n\nYou can manage your subscriptions from your dashboard at any time.`

                    await resend.emails.send({
                        from: FROM_EMAIL,
                        to: subscriber.email,
                        subject: `New from ${creator.pseudonym}: ${postData.title}`,
                        html: renderPremiumEmail({
                            preheader: `${creator.pseudonym} published a new article on Jence.`,
                            eyebrow: vert?.name || 'New Article',
                            title: postData.title,
                            intro,
                            sections: [
                                {
                                    label: 'Author',
                                    value: creator.pseudonym,
                                },
                                ...(postData.excerpt ? [{
                                    label: 'Excerpt',
                                    value: postData.excerpt,
                                }] : []),
                            ],
                            cta: {
                                label: 'Read Article',
                                url: postUrl,
                            },
                            secondaryCta: {
                                label: 'Open Dashboard',
                                url: getFrontendUrl('/dashboard'),
                            },
                            footer,
                        }),
                        text: renderPlainTextEmail({
                            title: postData.title,
                            intro,
                            sections: [
                                {
                                    label: 'Author',
                                    value: creator.pseudonym,
                                },
                                ...(postData.excerpt ? [{
                                    label: 'Excerpt',
                                    value: postData.excerpt,
                                }] : []),
                            ],
                            cta: {
                                label: 'Read Article',
                                url: postUrl,
                            },
                            secondaryCta: {
                                label: 'Open Dashboard',
                                url: getFrontendUrl('/dashboard'),
                            },
                            footer,
                        }),
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
