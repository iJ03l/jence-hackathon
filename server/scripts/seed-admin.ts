import 'dotenv/config'
import { auth } from '../src/auth.js'
import { db } from '../src/db/index.js'
import { user } from '../src/db/schema.js'
import { eq } from 'drizzle-orm'

async function seedAdmin() {
    const adminEmail = 'yorxsm@gmail.com'
    const adminPassword = 'intellijence'
    const adminUsername = 'yakoob'
    const adminName = 'Yakoob (Admin)'

    try {
        console.log(`Checking if admin user ${adminUsername} exists...`)
        
        // 1. Check if user already exists
        const [existing] = await db
            .select()
            .from(user)
            .where(eq(user.username, adminUsername))
            .limit(1)

        let userId: string

        if (existing) {
            console.log(`Admin user already exists. Updating role to admin.`)
            userId = existing.id
            
            // Just ensure role is 'admin', email is correct, and not banned
            await db.update(user)
                .set({ role: 'admin', isBanned: false, email: adminEmail })
                .where(eq(user.id, userId))
        } else {
            console.log(`Admin user not found. Creating via Better Auth...`)
            
            // 2. Create the user using Better Auth API
            const result = await auth.api.signUpEmail({
                body: {
                    email: adminEmail,
                    password: adminPassword,
                    name: adminName,
                }
            })

            userId = result.user.id
            console.log(`Created admin user with ID: ${userId}`)

            // 3. Update the Better Auth record with Jence attributes
            await db.update(user)
                .set({ 
                    username: adminUsername, 
                    role: 'admin', 
                    isBanned: false 
                })
                .where(eq(user.id, userId))
            
            console.log(`Updated custom Jence fields (role, username) for admin.`)
        }

        console.log('✅ Admin account seeded successfully.')
        console.log(`Username: ${adminUsername}`)
        console.log(`Email: ${adminEmail} (Used under hood for auth logic)`)
        process.exit(0)
    } catch (err) {
        console.error('❌ Error seeding admin:', err)
        process.exit(1)
    }
}

seedAdmin()
