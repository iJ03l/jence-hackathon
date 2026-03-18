import { Link } from 'react-router-dom'
import { ArrowRight, Building2, CalendarDays, HandCoins, ShieldCheck, UserRound } from 'lucide-react'

type LaunchPreviewCardProps = {
    launch: any
    to: string
    authorTo?: string
    actions?: React.ReactNode
    className?: string
}

function joinClassNames(...values: Array<string | undefined | false>) {
    return values.filter(Boolean).join(' ')
}

function getMonogram(value: string) {
    const parts = value.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'JN'
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('')
}

export function getLaunchStatusMeta(status: string) {
    if (status === 'approved') {
        return {
            label: 'Editorially reviewed',
            className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
        }
    }

    if (status === 'rejected') {
        return {
            label: 'Needs revision',
            className: 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300',
        }
    }

    return {
        label: 'In review',
        className: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    }
}

export default function LaunchPreviewCard({ launch, to, authorTo, actions, className }: LaunchPreviewCardProps) {
    const author = launch.authorPseudonym || launch.authorUsername || launch.authorName || 'Jence author'
    const statusMeta = getLaunchStatusMeta(launch.status)
    const companyMark = getMonogram(launch.company || launch.name || 'JN')

    return (
        <article
            className={joinClassNames(
                'group relative overflow-hidden rounded-[28px] border border-border/60 bg-gradient-to-br from-background via-card to-muted/20 p-5 sm:p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-jence-gold/30 hover:shadow-[0_26px_90px_rgba(212,175,55,0.12)] dark:shadow-[0_28px_90px_rgba(0,0,0,0.35)]',
                className,
            )}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.12),transparent_32%),linear-gradient(180deg,transparent,rgba(212,175,55,0.06))]" />
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-jence-gold/8 blur-3xl" />

            <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-jence-gold/20 bg-gradient-to-br from-jence-gold/20 via-jence-gold/10 to-transparent text-sm font-black tracking-[0.2em] text-jence-gold">
                            {companyMark}
                        </div>
                        <div className="min-w-0">
                            <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                <span className="inline-flex items-center gap-1 rounded-full border border-jence-gold/20 bg-jence-gold/5 px-2.5 py-1 font-semibold text-jence-gold">
                                    <ShieldCheck size={12} />
                                    Launch Note
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <CalendarDays size={12} />
                                    {new Date(launch.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>

                            <Link to={to} className="block">
                                <h3 className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-jence-gold sm:text-2xl">
                                    {launch.name}
                                </h3>
                            </Link>

                            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                    <Building2 size={14} />
                                    {launch.company}
                                </span>
                                {authorTo ? (
                                    <Link to={authorTo} className="inline-flex items-center gap-1.5 text-jence-gold transition-colors hover:text-jence-gold/80">
                                        <UserRound size={14} />
                                        {author}
                                    </Link>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5">
                                        <UserRound size={14} />
                                        {author}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <span className={joinClassNames('shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]', statusMeta.className)}>
                        {statusMeta.label}
                    </span>
                </div>

                <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-[15px]">
                    {launch.summary}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                    {(launch.tags || []).map((tag: string) => (
                        <span
                            key={tag}
                            className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                        >
                            {tag}
                        </span>
                    ))}
                    {launch.disclosure && (
                        <span className="rounded-full border border-jence-gold/20 bg-jence-gold/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-jence-gold">
                            Disclosure included
                        </span>
                    )}
                    {launch.allowTips && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-300">
                            <HandCoins size={12} />
                            {launch.status === 'approved' ? 'Tips enabled' : 'Tips requested'}
                        </span>
                    )}
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        to={to}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-jence-gold"
                    >
                        Open launch note
                        <ArrowRight size={16} />
                    </Link>

                    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
                </div>
            </div>
        </article>
    )
}
