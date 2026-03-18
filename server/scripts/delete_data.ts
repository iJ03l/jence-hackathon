import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import 'dotenv/config'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

async function main() {
    console.log("Starting deletion...")

    // Delete community post dependencies
    await db.execute('DELETE FROM "community_post_daily_view"')
    await db.execute('DELETE FROM "community_post_like"')
    await db.execute('DELETE FROM "community_post_comment"')
    await db.execute('DELETE FROM "community_post_tag"')
    await db.execute('DELETE FROM "community_post"')
    console.log("Deleted all community posts.")

    // Delete post dependencies
    await db.execute('DELETE FROM "post_daily_view"')
    await db.execute('DELETE FROM "post_vote"')
    await db.execute('DELETE FROM "post_comment"')
    await db.execute('DELETE FROM "strike"')
    await db.execute('DELETE FROM "notification"')
    await db.execute('DELETE FROM "tip"')
    await db.execute('DELETE FROM "subscription"')
    await db.execute('DELETE FROM "post"')
    console.log("Deleted all posts (articles).")

    const testEmails = [
        'testcr@test.com',
        'test1234@jence.io',
        'test4567@jence.io'
    ]
    
    // Find these users
    const users = await db.execute('SELECT id FROM "user" WHERE email IN (\'' + testEmails.join('\',\'') + '\')')
    const userIds = users.map((u: any) => u.id)
    
    if (userIds.length > 0) {
        const idListStr = userIds.map((id: string) => `'${id}'`).join(',')
        
        // Delete creator dependencies
        await db.execute(`DELETE FROM "creator_rating" WHERE user_id IN (${idListStr})`)
        const creatorProfiles = await db.execute(`SELECT id FROM "creator_profile" WHERE user_id IN (${idListStr})`)
        const creatorIds = creatorProfiles.map((cp: any) => cp.id)
        if (creatorIds.length > 0) {
            const cpIdListStr = creatorIds.map((id: string) => `'${id}'`).join(',')
            await db.execute(`DELETE FROM "creator_rating" WHERE creator_profile_id IN (${cpIdListStr})`)
        }
        
        await db.execute(`DELETE FROM "wallet" WHERE user_id IN (${idListStr})`)
        await db.execute(`DELETE FROM "creator_profile" WHERE user_id IN (${idListStr})`)
        await db.execute(`DELETE FROM "session" WHERE user_id IN (${idListStr})`)
        await db.execute(`DELETE FROM "account" WHERE user_id IN (${idListStr})`)
        
        await db.execute(`DELETE FROM "user" WHERE id IN (${idListStr})`)
        console.log(`Deleted test users: ${testEmails.join(', ')}`)
    } else {
        console.log("No test users found to delete.")
    }

    await client.end()
    console.log("Done.")
}

main().catch(async (e) => {
    console.error(e)
    await client.end()
    process.exit(1)
})
