import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import 'dotenv/config'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

async function main() {
    const users = await db.execute('SELECT id, email, name FROM "user"')
    console.log("Users:", users)
    
    const posts = await db.execute('SELECT id, title FROM "post"')
    console.log("Posts:", posts)
    
    const communityPosts = await db.execute('SELECT id, content FROM "community_post"')
    console.log("Community Posts:", communityPosts)
    
    await client.end()
}

main().catch(console.error)
