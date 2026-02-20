import { betterAuth } from 'better-auth'
import { Resend } from 'resend'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db/index.js'
import * as schema from './db/schema.js'

export const auth = betterAuth({
    trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:5173', 'https://jence.io'],
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
                const result = await resend.emails.send({
                    from: process.env.FROM_EMAIL || 'Jence <auth@jence.io>',
                    to: user.email,
                    subject: 'Reset your Jence password',
                    html: `
                        <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #333;">Reset Password</h2>
                            <p style="color: #555; font-size: 16px;">Click the button below to reset your password. This link expires in 1 hour.</p>
                            <a href="${url}" style="display: inline-block; background: #D4AF37; color: #1a1a1a; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">
                                Reset Password
                            </a>
                            <p style="color: #999; font-size: 14px; margin-top: 32px;">If you didn't request this, you can safely ignore this email.</p>
                        </div>
                    `,
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
            username: {
                type: 'string',
                required: true,
                input: true,
            },
        },
    },
})
