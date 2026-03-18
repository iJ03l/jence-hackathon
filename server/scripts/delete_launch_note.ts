import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import 'dotenv/config'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

async function main() {
    const id = '79c37890-b0e3-4b2d-9feb-9b27ecf50796'
    console.log(`Starting deletion for launch note ${id}...`)

    await db.execute(`DELETE FROM "launch_note_upvote" WHERE launch_note_id = '${id}'`)
    await db.execute(`DELETE FROM "launch_note_daily_view" WHERE launch_note_id = '${id}'`)
    await db.execute(`DELETE FROM "tip" WHERE launch_note_id = '${id}'`)
    const res = await db.execute(`DELETE FROM "launch_note" WHERE id = '${id}'`)
    
    console.log("Deletion complete. Affected rows for launch_note:", res.count)
    await client.end()
}

main().catch(async (e) => {
    console.error(e)
    await client.end()
    process.exit(1)
})
