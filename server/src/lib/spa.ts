import { existsSync } from 'node:fs'
import path from 'node:path'

const SPA_DIST_ROOT_CANDIDATES = ['../app/dist', 'app/dist'] as const

function resolveFromCwd(candidate: string) {
    return path.isAbsolute(candidate) ? candidate : path.resolve(process.cwd(), candidate)
}

function getExistingSpaDistRoot(candidates: readonly string[]) {
    return candidates.find((candidate) => existsSync(path.join(resolveFromCwd(candidate), 'index.html')))
}

export function resolveSpaStaticRoot() {
    const candidates = [
        ...(process.env.SPA_DIST_ROOT?.trim() ? [process.env.SPA_DIST_ROOT.trim()] : []),
        ...SPA_DIST_ROOT_CANDIDATES,
    ]

    return getExistingSpaDistRoot(candidates) || candidates[candidates.length - 1] || 'app/dist'
}

export function resolveSpaTemplatePath() {
    const templateOverride = process.env.SPA_TEMPLATE_PATH?.trim()

    if (templateOverride) {
        return resolveFromCwd(templateOverride)
    }

    const spaRoot = resolveSpaStaticRoot()
    return path.join(resolveFromCwd(spaRoot), 'index.html')
}
