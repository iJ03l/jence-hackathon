import { betterAuth } from 'better-auth'
import { Resend } from 'resend'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db/index.js'
import * as schema from './db/schema.js'
import { renderPlainTextEmail, renderPremiumEmail } from './lib/email.js'

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:8080/api/auth',
    trustedOrigins: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'https://jence.xyz',
        'https://www.jence.xyz'
    ],
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        },
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        },
    },
    emailAndPassword: {
        enabled: true,
        async sendResetPassword(data, request) {
            const { user, url } = data
            console.log('📧 sendResetPassword called for:', user.email)
            console.log('📧 Reset URL:', url)
            const resend = new Resend(process.env.RESEND_API_KEY)

            try {
                const html = renderPremiumEmail({
                    eyebrow: 'Password Reset',
                    title: 'Reset your password',
                    intro: 'A password reset was requested for your Jence account. Use the secure link below to choose a new password. This link expires in 1 hour.',
                    cta: {
                        label: 'Reset Password',
                        url,
                    },
                    secondaryCta: {
                        label: 'Open Jence',
                        url: process.env.FRONTEND_URL || 'http://localhost:5173',
                    },
                    footer: `If you did not request this reset, you can safely ignore this email.\n\nFor security, do not forward this link.`,
                })
                const text = renderPlainTextEmail({
                    title: 'Reset your password',
                    intro: 'A password reset was requested for your Jence account. This link expires in 1 hour.',
                    cta: {
                        label: 'Reset Password',
                        url,
                    },
                    footer: `If you did not request this reset, you can safely ignore this email.\nFor security, do not forward this link.`,
                })

                const result = await resend.emails.send({
                    from: process.env.FROM_EMAIL || 'Jence <auth@jence.xyz>',
                    to: user.email,
                    subject: 'Reset your Jence password',
                    html,
                    text,
                })
                console.log('📧 Resend result:', JSON.stringify(result))
            } catch (error) {
                console.error('❌ Failed to send reset password email:', error)
            }
        },
    },
    user: {
        additionalFields: {
            role: {
                type: 'string',
                required: false,
                defaultValue: 'subscriber',
                input: true,
            },
            isBanned: {
                type: 'boolean',
                required: false,
                defaultValue: false,
            },
            username: {
                type: 'string',
                required: false,
                input: true,
            },
            isOg: {
                type: 'boolean',
                required: false,
                defaultValue: process.env.ENABLE_OG_STATUS === 'true',
            },
        },
    },
})
