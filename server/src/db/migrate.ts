import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from './index.js'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const migrationsFolder = path.resolve(currentDir, '../../drizzle')

export async function runDatabaseMigrations() {
    await migrate(db, { migrationsFolder })
}
