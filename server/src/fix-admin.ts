import 'dotenv/config'
import { db } from './db/index.js'
import { user, account } from './db/schema.js'
import { eq } from 'drizzle-orm'
import { auth } from './auth.js'

async function fixAdmin() {
    console.log('Fetching Yakoob user...')
    const yakoob = await db.query.user.findFirst({
        where: eq(user.email, 'yorxsm@gmail.com')
    })

    if (!yakoob) {
        console.error('Yakoob not found!')
        process.exit(1)
    }

    console.log('Setting Yakoob to admin...')
    await db.update(user).set({ role: 'admin' }).where(eq(user.email, 'yorxsm@gmail.com'))
    
    // Check if temp exists and delete it
    const tempUser = await db.query.user.findFirst({ where: eq(user.email, 'temp_admin@jence.xyz') })
    if (tempUser) {
        await db.delete(account).where(eq(account.userId, tempUser.id))
        await db.delete(user).where(eq(user.id, tempUser.id))
    }

    console.log('Creating temp admin to get hash for 0x000...')
    // We mock the Request object to satisfy better-auth's API which expects a request
    const mockRequest = new Request('http://localhost:8080/api/auth/sign-up/email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'temp_admin@jence.xyz',
            password: '0x000',
            name: 'Temp Admin'
        })
    })

    const res = await auth.handler(mockRequest)
    if (!res.ok) {
        const body = await res.text()
        console.error('Failed to create temp admin:', body)
        process.exit(1)
    }

    const newTemp = await db.query.user.findFirst({ where: eq(user.email, 'temp_admin@jence.xyz') })
    if (!newTemp) {
        console.error('Temp user not found in DB after creation')
        process.exit(1)
    }

    const tempAccount = await db.query.account.findFirst({ where: eq(account.userId, newTemp.id) })
    if (!tempAccount || !tempAccount.password) {
        console.error('Temp account/password not found')
        process.exit(1)
    }

    console.log('Copying hash to Yakoob...')
    const yakoobAccount = await db.query.account.findFirst({ where: eq(account.userId, yakoob.id) })
    if (yakoobAccount) {
        await db.update(account).set({ password: tempAccount.password }).where(eq(account.id, yakoobAccount.id))
    } else {
        console.log('Yakoob does not have an account record, creating one...')
        await db.insert(account).values({
            id: crypto.randomUUID(),
            accountId: yakoob.id,
            providerId: 'credential',
            userId: yakoob.id,
            password: tempAccount.password
        })
    }

    console.log('Cleaning up temp user...')
    await db.delete(account).where(eq(account.userId, newTemp.id))
    await db.delete(user).where(eq(user.id, newTemp.id))

    console.log('Done! Yakoob is now admin with password 0x000')
    process.exit(0)
}

fixAdmin().catch(console.error)
