import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, CalendarDays, HandCoins, ShieldCheck, UserRound } from 'lucide-react'
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

    useEffect(() => {
        if (!id) return

        let cancelled = false

        const loadLaunch = async () => {
            setLoading(true)
            try {
                const data = await api.getLaunch(id)
                if (!cancelled) setLaunch(data)
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
    }, [id])

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

                        <p className="mt-8 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                            {launch.summary}
                        </p>

                        {launch.allowTips && (
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                {!tipsLive ? (
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
                                )}
                            </div>
                        )}
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
