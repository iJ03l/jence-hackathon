import { Link } from 'react-router-dom'
import { ArrowBigUp, ArrowRight, Building2, CalendarDays, HandCoins, ShieldCheck, UserRound } from 'lucide-react'

type LaunchPreviewCardProps = {
    launch: any
    to: string
    authorTo?: string
    actions?: React.ReactNode
    className?: string
    hideSummary?: boolean
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

export default function LaunchPreviewCard({ launch, to, authorTo, actions, className, hideSummary = false }: LaunchPreviewCardProps) {
    const author = launch.authorPseudonym || launch.authorUsername || launch.authorName || 'Jence author'
    const statusMeta = getLaunchStatusMeta(launch.status)
    const companyMark = getMonogram(launch.company || launch.name || 'JN')
    const upvotes = Number(launch.upvotes || 0)

    return (
        <article
            className={joinClassNames(
                'group rounded-[26px] border border-border/70 bg-background/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-jence-gold/25 hover:shadow-[0_20px_54px_rgba(15,23,42,0.08)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.24)] sm:p-6',
                className,
            )}
        >
            <div className="flex h-full flex-col">
                <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-border/80 bg-muted/20 text-xs font-black tracking-[0.18em] text-foreground sm:h-16 sm:w-16">
                        {launch.logoUrl ? (
                            <img
                                src={launch.logoUrl}
                                alt={`${launch.company || launch.name} logo`}
                                className="h-full w-full bg-white object-contain p-2.5"
                            />
                        ) : (
                            companyMark
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full border border-jence-gold/20 bg-jence-gold/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-jence-gold">
                                <ShieldCheck size={12} />
                                Launch Note
                            </span>
                            <span className={joinClassNames('rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]', statusMeta.className)}>
                                {statusMeta.label}
                            </span>
                        </div>

                        <Link to={to} className="mt-3 block">
                            <h3 className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-jence-gold sm:text-[1.7rem]">
                                {launch.name}
                            </h3>
                        </Link>

                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <Building2 size={14} />
                                {launch.company}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={14} />
                                {new Date(launch.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
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
                </div>                {!hideSummary && (
                    <p className="mt-5 line-clamp-4 text-sm leading-7 text-muted-foreground sm:text-[15px]">
                        {launch.summary}
                    </p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${launch.userHasUpvoted ? 'border-jence-gold/20 bg-jence-gold/5 text-jence-gold' : 'border-border/60 bg-background text-muted-foreground'}`}>
                        <ArrowBigUp size={12} className={launch.userHasUpvoted ? 'fill-current' : ''} />
                        {upvotes} upvote{upvotes === 1 ? '' : 's'}
                    </span>
                    {(launch.tags || []).slice(0, 3).map((tag: string) => (
                        <span
                            key={tag}
                            className="rounded-full border border-border/60 bg-background px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                        >
                            {tag}
                        </span>
                    ))}
                    {launch.tags?.length > 3 && (
                        <span className="rounded-full border border-border/60 bg-background px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                            +{launch.tags.length - 3}
                        </span>
                    )}
                    {launch.disclosure && (
                        <span className="rounded-full border border-jence-gold/20 bg-jence-gold/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-jence-gold">
                            Credit included
                        </span>
                    )}
                    {launch.allowTips && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-300">
                            <HandCoins size={12} />
                            Tips
                        </span>
                    )}
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        to={to}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-jence-gold"
                    >
                        Read launch note
                        <ArrowRight size={16} />
                    </Link>

                    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
                </div>
            </div>
        </article>
    )
}
