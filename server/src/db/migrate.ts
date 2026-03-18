import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { sql } from 'drizzle-orm'
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

    return null
}

async function ensureSchemaCompatibility() {
    // Fallback for environments where the tracked Drizzle migration folder
    // was not packaged into the runtime image.
    await db.execute(sql.raw(`
        ALTER TABLE IF EXISTS "post"
        ADD COLUMN IF NOT EXISTS "allow_tips" boolean DEFAULT false NOT NULL
    `))

    await db.execute(sql.raw(`
        ALTER TABLE IF EXISTS "launch_note"
        ADD COLUMN IF NOT EXISTS "allow_tips" boolean DEFAULT false NOT NULL
    `))

    await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS "tip" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
            "tipper_user_id" text NOT NULL REFERENCES "public"."user"("id"),
            "recipient_user_id" text NOT NULL REFERENCES "public"."user"("id"),
            "target_type" text NOT NULL,
            "creator_profile_id" uuid REFERENCES "public"."creator_profile"("id"),
            "post_id" uuid REFERENCES "public"."post"("id"),
            "launch_note_id" uuid REFERENCES "public"."launch_note"("id"),
            "amount_usdc" text NOT NULL,
            "tx_signature" text,
            "created_at" timestamp DEFAULT now() NOT NULL
        )
    `))
}

export async function runDatabaseMigrations() {
    const migrationsFolder = resolveMigrationsFolder()

    if (migrationsFolder) {
        await migrate(db, { migrationsFolder })
        return
    }

    console.warn('Drizzle migrations folder not found. Applying schema compatibility fallback.')
    await ensureSchemaCompatibility()
}
