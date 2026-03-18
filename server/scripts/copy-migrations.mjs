import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(currentDir, '..')
const sourceDir = path.join(rootDir, 'drizzle')
const targetDir = path.join(rootDir, 'dist', 'drizzle')

if (!fs.existsSync(sourceDir)) {
    console.warn(`Skipping migration copy because ${sourceDir} does not exist`)
    process.exit(0)
}

fs.rmSync(targetDir, { recursive: true, force: true })
fs.mkdirSync(path.dirname(targetDir), { recursive: true })
fs.cpSync(sourceDir, targetDir, { recursive: true })

console.log(`Copied Drizzle migrations to ${targetDir}`)
