import path from 'node:path'
import os from 'node:os'
import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { resolveSpaStaticRoot, resolveSpaTemplatePath } from '../src/lib/spa.js'

const originalCwd = process.cwd()

afterEach(() => {
    process.chdir(originalCwd)
    delete process.env.SPA_DIST_ROOT
    delete process.env.SPA_TEMPLATE_PATH
})

describe.sequential('SPA path resolution', () => {
    it('finds the frontend build from the repo root layout', async () => {
        const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'jence-spa-root-'))

        try {
            await mkdir(path.join(tempRoot, 'app', 'dist'), { recursive: true })
            await writeFile(path.join(tempRoot, 'app', 'dist', 'index.html'), '<!doctype html>')

            process.chdir(tempRoot)

            expect(resolveSpaStaticRoot()).toBe('app/dist')
            expect(resolveSpaTemplatePath()).toBe(path.join(tempRoot, 'app', 'dist', 'index.html'))
        } finally {
            await rm(tempRoot, { recursive: true, force: true })
        }
    })

    it('finds the frontend build from the server working directory layout', async () => {
        const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'jence-spa-server-'))

        try {
            await mkdir(path.join(tempRoot, 'app', 'dist'), { recursive: true })
            await mkdir(path.join(tempRoot, 'server'), { recursive: true })
            await writeFile(path.join(tempRoot, 'app', 'dist', 'index.html'), '<!doctype html>')

            process.chdir(path.join(tempRoot, 'server'))

            expect(resolveSpaStaticRoot()).toBe('../app/dist')
            expect(resolveSpaTemplatePath()).toBe(path.join(tempRoot, 'app', 'dist', 'index.html'))
        } finally {
            await rm(tempRoot, { recursive: true, force: true })
        }
    })
})
