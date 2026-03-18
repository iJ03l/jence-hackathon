import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from './index.js'

const currentDir = path.dirname(fileURLToPath(import.meta.url))

function resolveMigrationsFolder() {
    const candidates = [
        path.resolve(currentDir, '../drizzle'),
        path.resolve(currentDir, '../../drizzle'),
    ]

    for (const candidate of candidates) {
        if (fs.existsSync(path.join(candidate, 'meta', '_journal.json'))) {
            return candidate
        }
    }

    throw new Error(
        `Can't find Drizzle migrations folder. Checked: ${candidates.join(', ')}`
    )
}

export async function runDatabaseMigrations() {
    await migrate(db, { migrationsFolder: resolveMigrationsFolder() })
}
