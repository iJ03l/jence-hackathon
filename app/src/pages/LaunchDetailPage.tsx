import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowBigUp, Building2, CalendarDays, HandCoins, ShieldCheck, UserRound } from 'lucide-react'
import SEO from '../components/SEO'
import { TipModal } from '../components/TipModal'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { getLaunchStatusMeta } from '../components/LaunchPreviewCard'

export default function LaunchDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, walletAddress, walletBalance } = useAuth()

    const [launch, setLaunch] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [tipOpen, setTipOpen] = useState(false)
    const [tipping, setTipping] = useState(false)
    const [tipError, setTipError] = useState('')
    const trackedViewRef = useRef<string | null>(null)

    useEffect(() => {
        if (!id) return

        let cancelled = false

        const loadLaunch = async () => {
            setLoading(true)
            try {
                const data = await api.getLaunch(id)
                if (!cancelled) {
                    setLaunch(data)
                    if (trackedViewRef.current !== id) {
                        trackedViewRef.current = id
                        api.trackLaunchView(id).catch((viewError) => {
                            console.error('Failed to track launch view', viewError)
                        })
                    }
                }
            } catch (error) {
                console.error('Failed to load launch', error)
                if (!cancelled) setLaunch(null)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadLaunch()

        return () => {
            cancelled = true
        }
    }, [id, user?.id])

    const handleTip = async (amountUsdc: number) => {
        if (!launch) return

        setTipping(true)
        setTipError('')

        try {
            await api.tip({
                amountUsdc,
                launchNoteId: launch.id,
            })
            setTipOpen(false)
        } catch (err: any) {
            console.error('Tip failed:', err)
            setTipError(err?.message || 'Tip failed. Please try again.')
        } finally {
            setTipping(false)
        }
    }

    const handleUpvote = async () => {
        if (!launch) return

        if (!user) {
            navigate('/login')
            return
        }

        if (user.id === launch.userId) {
            return
        }

        const previousUpvoted = !!launch.userHasUpvoted
        const previousUpvotes = Number(launch.upvotes || 0)
        const nextUpvoted = !previousUpvoted

        setLaunch((prev: any) => ({
            ...prev,
            userHasUpvoted: nextUpvoted,
            upvotes: previousUpvotes + (nextUpvoted ? 1 : -1),
        }))

        try {
            if (nextUpvoted) {
                await api.upvoteLaunch(launch.id)
            } else {
                await api.removeLaunchUpvote(launch.id)
            }
        } catch (error) {
            console.error('Failed to update launch upvote', error)
            setLaunch((prev: any) => ({
                ...prev,
                userHasUpvoted: previousUpvoted,
                upvotes: previousUpvotes,
            }))
        }
    }

    if (loading) {
        return (
            <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="mx-auto max-w-5xl animate-pulse space-y-6">
                    <div className="h-6 w-24 rounded bg-muted" />
                    <div className="rounded-[32px] border border-border bg-card p-8">
                        <div className="mb-4 h-4 w-40 rounded bg-muted" />
                        <div className="mb-3 h-10 w-3/4 rounded bg-muted" />
                        <div className="h-4 w-full rounded bg-muted" />
                        <div className="mt-2 h-4 w-5/6 rounded bg-muted" />
                    </div>
                </div>
            </section>
        )
    }

    if (!launch) {
        return (
            <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="mx-auto max-w-3xl rounded-[28px] border border-border bg-card p-10 text-center">
                    <h1 className="text-2xl font-semibold text-foreground">Launch note not found</h1>
                    <p className="mt-3 text-sm text-muted-foreground">
                        This launch note is unavailable or still under review.
                    </p>
                    <Link to="/launches" className="btn-primary mt-6 inline-flex">
                        Back to Launch Notes
                    </Link>
                </div>
            </section>
        )
    }

    const author = launch.authorPseudonym || launch.authorUsername || launch.authorName || 'Jence author'
    const authorPath = launch.authorPseudonym || launch.authorUsername ? `/${launch.authorPseudonym || launch.authorUsername}` : ''
    const statusMeta = getLaunchStatusMeta(launch.status)
    const disclosureText = launch.disclosure?.trim() || 'No additional credit or disclosure was provided for this launch note.'
    const tipsLive = launch.allowTips && launch.status === 'approved'
    const canUpvote = launch.status === 'approved' && user?.id !== launch.userId

    return (
        <section className="bg-background px-4 pb-16 pt-20 sm:px-6 lg:px-8 xl:px-12 sm:pt-24">
            <SEO
                title={`${launch.name} Launch Note`}
                description={launch.summary}
                url={`/launches/${launch.id}`}
                type="article"
            />

            <div className="mx-auto max-w-5xl">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-gradient-to-br from-background via-card to-muted/15 p-6 shadow-[0_28px_100px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10 dark:shadow-[0_32px_100px_rgba(0,0,0,0.38)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.16),transparent_34%),linear-gradient(180deg,transparent,rgba(212,175,55,0.05))]" />
                    <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-14 -translate-y-14 rounded-full bg-jence-gold/10 blur-3xl" />

                    <div className="relative">
                        <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            <span className="inline-flex items-center gap-1 rounded-full border border-jence-gold/20 bg-jence-gold/5 px-3 py-1 font-semibold text-jence-gold">
                                <ShieldCheck size={12} />
                                Launch Note
                            </span>
                            <span className={`rounded-full border px-3 py-1 font-semibold ${statusMeta.className}`}>
                                {statusMeta.label}
                            </span>
                        </div>

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-jence-gold/20 bg-gradient-to-br from-jence-gold/20 via-jence-gold/10 to-transparent text-lg font-black tracking-[0.2em] text-jence-gold shadow-[0_22px_40px_rgba(212,175,55,0.12)] sm:h-24 sm:w-24">
                                {launch.logoUrl ? (
                                    <img
                                        src={launch.logoUrl}
                                        alt={`${launch.company || launch.name} logo`}
                                        className="h-full w-full bg-white/90 object-contain p-4"
                                    />
                                ) : (
                                    (launch.company || launch.name || 'JN')
                                        .split(/\s+/)
                                        .filter(Boolean)
                                        .slice(0, 2)
                                        .map((part: string) => part[0]?.toUpperCase() || '')
                                        .join('')
                                )}
                            </div>
                            <div className="min-w-0">
                                <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                    {launch.name}
                                </h1>

                                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Building2 size={15} />
                                        {launch.company}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <CalendarDays size={15} />
                                        {new Date(launch.createdAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                    {authorPath ? (
                                        <Link to={authorPath} className="inline-flex items-center gap-1.5 text-jence-gold transition-colors hover:text-jence-gold/80">
                                            <UserRound size={15} />
                                            {author}
                                        </Link>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5">
                                            <UserRound size={15} />
                                            {author}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <p className="mt-8 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                            {launch.summary}
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            {launch.status === 'approved' && (
                                <>
                                    <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${launch.userHasUpvoted ? 'border-jence-gold/30 bg-jence-gold/10 text-jence-gold' : 'border-border bg-background/80 text-muted-foreground'}`}>
                                        <ArrowBigUp size={16} className={launch.userHasUpvoted ? 'fill-current' : ''} />
                                        {Number(launch.upvotes || 0)} upvote{Number(launch.upvotes || 0) === 1 ? '' : 's'}
                                    </span>

                                    {!user ? (
                                        <Link to="/login" className="inline-flex items-center gap-2 rounded-full border border-jence-gold/20 bg-jence-gold/5 px-4 py-2 text-sm font-medium text-jence-gold transition-colors hover:bg-jence-gold/10">
                                            <ArrowBigUp size={16} />
                                            Log in to upvote
                                        </Link>
                                    ) : canUpvote ? (
                                        <button
                                            onClick={handleUpvote}
                                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${launch.userHasUpvoted ? 'border-jence-gold/30 bg-jence-gold/10 text-jence-gold hover:bg-jence-gold/15' : 'border-border bg-background/80 text-foreground hover:border-jence-gold/30 hover:text-jence-gold'}`}
                                        >
                                            <ArrowBigUp size={16} className={launch.userHasUpvoted ? 'fill-current' : ''} />
                                            {launch.userHasUpvoted ? 'Upvoted' : 'Upvote launch'}
                                        </button>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted-foreground">
                                            <ArrowBigUp size={15} />
                                            Your launch note
                                        </span>
                                    )}
                                </>
                            )}

                            {launch.allowTips && (
                                !tipsLive ? (
                                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted-foreground">
                                        <HandCoins size={15} />
                                        Tips will unlock after approval
                                    </span>
                                ) : !user ? (
                                    <Link to="/login" className="btn-primary">
                                        Log in to tip
                                    </Link>
                                ) : user.id !== launch.userId ? (
                                    <button
                                        onClick={() => {
                                            setTipError('')
                                            setTipOpen(true)
                                        }}
                                        className="btn-primary"
                                    >
                                        <HandCoins size={16} />
                                        Tip this launch
                                    </button>
                                ) : (
                                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted-foreground">
                                        <HandCoins size={15} />
                                        Your launch is accepting community tips
                                    </span>
                                )
                            )}
                            </div>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                    <article className="card-plug p-6 sm:p-8">
                        <p className="label-mono mb-3 block">Launch Overview</p>
                        <div className="whitespace-pre-wrap text-sm leading-7 text-foreground/90 sm:text-[15px]">
                            {launch.summary}
                        </div>
                    </article>

                    <aside className="space-y-6">
                        <div className="card-plug p-6">
                            <p className="label-mono mb-3 block">Credit And Disclosure</p>
                            <p className="text-sm leading-7 text-muted-foreground">
                                {disclosureText}
                            </p>
                        </div>

                        <div className="card-plug p-6">
                            <p className="label-mono mb-3 block">Launch Signals</p>
                            <div className="flex flex-wrap gap-2">
                                {(launch.tags || []).map((tag: string) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {launch.allowTips && (
                                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-300">
                                        {tipsLive ? 'Tips enabled' : 'Tips requested'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {(launch.reviewNote || launch.status !== 'approved') && (
                            <div className="card-plug p-6">
                                <p className="label-mono mb-3 block">Review Status</p>
                                <p className="text-sm leading-7 text-muted-foreground">
                                    {launch.reviewNote?.trim() || 'This launch note is still in editorial review.'}
                                </p>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            <TipModal
                isOpen={tipOpen}
                onClose={() => {
                    setTipOpen(false)
                    setTipError('')
                }}
                onConfirm={handleTip}
                isSubmitting={tipping}
                title={`Tip ${launch.name}`}
                description={`Send a one-time tip for "${launch.name}" from your embedded wallet.`}
                balance={walletAddress ? walletBalance : undefined}
                error={tipError}
            />
        </section>
    )
}
