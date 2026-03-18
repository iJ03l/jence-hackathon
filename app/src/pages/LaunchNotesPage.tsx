import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    CheckCircle2, Shield, ArrowRight, Rocket, Clock,
    Send, Loader2, X, AlertCircle, Trash2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import SEO from '../components/SEO'

export default function LaunchNotesPage() {
    const { user } = useAuth()
    const [launches, setLaunches] = useState<any[]>([])
    const [myLaunches, setMyLaunches] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showMySubmissions, setShowMySubmissions] = useState(false)

    // Form state
    const [name, setName] = useState('')
    const [company, setCompany] = useState('')
    const [summary, setSummary] = useState('')
    const [tagsInput, setTagsInput] = useState('')
    const [disclosure, setDisclosure] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [submitSuccess, setSubmitSuccess] = useState(false)

    // Admin review state
    const [reviewing, setReviewing] = useState<string | null>(null)

    useEffect(() => {
        loadLaunches()
    }, [user])

    const loadLaunches = async () => {
        setLoading(true)
        try {
            const data = await api.getLaunches(user?.role === 'admin' ? undefined : undefined)
            setLaunches(data)
            if (user) {
                try {
                    const my = await api.getMyLaunches()
                    setMyLaunches(my)
                } catch { /* not logged in */ }
            }
        } catch (err) {
            console.error('Failed to load launches', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError('')
        setSubmitting(true)

        try {
            const tags = tagsInput
                .split(',')
                .map(t => t.trim())
                .filter(Boolean)
                .slice(0, 5)

            await api.submitLaunch({
                name,
                company,
                summary,
                tags: tags.length > 0 ? tags : undefined,
                disclosure: disclosure.trim() || undefined,
            })

            setSubmitSuccess(true)
            setName('')
            setCompany('')
            setSummary('')
            setTagsInput('')
            setDisclosure('')
            setTimeout(() => {
                setSubmitSuccess(false)
                setShowForm(false)
            }, 3000)
            loadLaunches()
        } catch (err: any) {
            setSubmitError(err.message || 'Failed to submit')
        } finally {
            setSubmitting(false)
        }
    }

    const handleReview = async (id: string, status: 'approved' | 'rejected') => {
        setReviewing(id)
        try {
            await api.reviewLaunch(id, status)
            loadLaunches()
        } catch (err: any) {
            console.error('Review failed', err)
        } finally {
            setReviewing(null)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this launch submission?')) return
        try {
            await api.deleteLaunch(id)
            loadLaunches()
        } catch (err: any) {
            console.error('Delete failed', err)
        }
    }

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            approved: 'bg-jence-green/10 text-jence-green',
            pending: 'bg-yellow-500/10 text-yellow-500',
            rejected: 'bg-red-500/10 text-red-400',
        }
        const icons: Record<string, React.ReactNode> = {
            approved: <CheckCircle2 size={12} />,
            pending: <Clock size={12} />,
            rejected: <AlertCircle size={12} />,
        }
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${styles[status] || styles.pending}`}>
                {icons[status]}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        )
    }

    return (
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
            <SEO
                title="Launch Notes"
                url="/launches"
                description="Curated product launches for robotics and hardware. Every submission is reviewed and approved before publication."
            />
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <span className="label-mono mb-2 block">Launch Notes</span>
                    <h1 className="heading-lg text-foreground mb-4">
                        Curated product launches for robotics and hardware
                    </h1>
                    <p className="body-md max-w-2xl mx-auto">
                        Submit your product launch for editorial review. Approved launches are published for the community.
                    </p>
                </div>

                {/* Editorial notice + Submit CTA */}
                <div className="card-plug p-5 sm:p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <Shield size={18} className="text-jence-gold mt-0.5" />
                            <div>
                                <h2 className="font-semibold text-foreground">Editorial approval required</h2>
                                <p className="text-sm text-muted-foreground">
                                    We verify claims, disclosures, and safety notes before any launch goes live.
                                </p>
                            </div>
                        </div>
                        {user ? (
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="btn-primary text-sm inline-flex items-center gap-2 shrink-0 active:scale-[0.97]"
                            >
                                {showForm ? 'Cancel' : 'Submit a launch'}
                                {showForm ? <X size={16} /> : <ArrowRight size={16} />}
                            </button>
                        ) : (
                            <Link
                                to="/register"
                                className="btn-primary text-sm inline-flex items-center gap-2 shrink-0"
                            >
                                Sign up to submit
                                <ArrowRight size={16} />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Submission Form */}
                {showForm && (
                    <div className="card-plug p-5 sm:p-6 mb-8 border-jence-gold/20">
                        {submitSuccess ? (
                            <div className="text-center py-6">
                                <CheckCircle2 size={32} className="text-jence-green mx-auto mb-3" />
                                <h3 className="font-semibold text-foreground mb-1">Submitted!</h3>
                                <p className="text-sm text-muted-foreground">
                                    Your launch is pending editorial review. You'll see its status in "My Submissions."
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <h3 className="font-semibold text-foreground mb-2">Submit a launch</h3>

                                {submitError && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {submitError}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Product name *</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="input-field"
                                            placeholder="e.g. OpenSense v2 Camera Stack"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Company *</label>
                                        <input
                                            type="text"
                                            value={company}
                                            onChange={e => setCompany(e.target.value)}
                                            className="input-field"
                                            placeholder="e.g. OpenSense Labs"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Summary *</label>
                                    <textarea
                                        value={summary}
                                        onChange={e => setSummary(e.target.value)}
                                        className="input-field min-h-[100px] resize-y"
                                        placeholder="What does this product do? Include specs, safety limits, and any benchmarks."
                                        required
                                        minLength={10}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Tags (comma-separated, max 5)</label>
                                    <input
                                        type="text"
                                        value={tagsInput}
                                        onChange={e => setTagsInput(e.target.value)}
                                        className="input-field"
                                        placeholder="e.g. Sensors, Perception, ROS2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Disclosure (optional)</label>
                                    <textarea
                                        value={disclosure}
                                        onChange={e => setDisclosure(e.target.value)}
                                        className="input-field min-h-[60px] resize-y"
                                        placeholder="Any conflicts of interest, funding, or vendor ties."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-primary w-full sm:w-auto justify-center active:scale-[0.97] disabled:opacity-60"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Submit for review
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* My Submissions (for logged-in users) */}
                {user && myLaunches.length > 0 && (
                    <div className="mb-8">
                        <button
                            onClick={() => setShowMySubmissions(!showMySubmissions)}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 flex items-center gap-1"
                        >
                            My submissions ({myLaunches.length})
                            <ArrowRight size={12} className={`transition-transform ${showMySubmissions ? 'rotate-90' : ''}`} />
                        </button>

                        {showMySubmissions && (
                            <div className="space-y-2">
                                {myLaunches.map(launch => (
                                    <div key={launch.id} className="card-plug p-4 flex items-center justify-between">
                                        <div className="min-w-0 mr-3">
                                            <h4 className="text-sm font-medium text-foreground truncate">{launch.name}</h4>
                                            <p className="text-xs text-muted-foreground">{launch.company}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {statusBadge(launch.status)}
                                            {launch.status === 'pending' && (
                                                <button
                                                    onClick={() => handleDelete(launch.id)}
                                                    className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Approved Launches */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card-plug p-5 animate-pulse">
                                <div className="h-3 bg-muted rounded w-32 mb-2" />
                                <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                                <div className="h-3 bg-muted rounded w-full" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {launches.map((launch) => (
                            <article key={launch.id} className="card-plug p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(launch.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="text-xs text-muted-foreground">·</span>
                                            <span className="text-xs text-muted-foreground">{launch.company}</span>
                                            {(launch.authorUsername || launch.authorPseudonym) && (
                                                <>
                                                    <span className="text-xs text-muted-foreground">·</span>
                                                    <Link
                                                        to={`/${launch.authorPseudonym || launch.authorUsername}`}
                                                        className="text-xs text-jence-gold hover:underline"
                                                    >
                                                        @{launch.authorPseudonym || launch.authorUsername}
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground mb-1">
                                            {launch.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {launch.summary}
                                        </p>
                                    </div>
                                    {statusBadge(launch.status)}
                                </div>
                                {launch.tags && launch.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {launch.tags.map((tag: string) => (
                                            <span
                                                key={tag}
                                                className="text-xs px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Admin review buttons */}
                                {user?.role === 'admin' && launch.status === 'pending' && (
                                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                                        <button
                                            onClick={() => handleReview(launch.id, 'approved')}
                                            disabled={reviewing === launch.id}
                                            className="btn-primary text-xs py-1.5 px-4 active:scale-[0.97] disabled:opacity-50"
                                        >
                                            {reviewing === launch.id ? 'Processing...' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => handleReview(launch.id, 'rejected')}
                                            disabled={reviewing === launch.id}
                                            className="btn-outline text-xs py-1.5 px-4 text-red-400 border-red-400/30 hover:bg-red-400/5 active:scale-[0.97] disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </article>
                        ))}

                        {launches.length === 0 && !loading && (
                            <div className="card-plug p-12 text-center">
                                <Rocket size={28} className="text-jence-gold mx-auto mb-3" />
                                <h3 className="font-semibold text-foreground mb-2">No launches yet</h3>
                                <p className="text-sm text-muted-foreground">
                                    Be the first to submit a product launch for editorial review.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Submission requirements */}
                <div className="mt-10 p-6 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-start gap-3">
                        <Shield size={18} className="text-jence-gold mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-foreground">Submission requirements</h3>
                            <ul className="text-sm text-muted-foreground mt-2 list-disc pl-5">
                                <li>Provide a conflict-of-interest disclosure and funding/sponsor ties.</li>
                                <li>Include safety limits, test conditions, and any known failure modes.</li>
                                <li>Share verifiable specs, datasets, or benchmarks where possible.</li>
                                <li>No export-controlled or weaponization content.</li>
                            </ul>
                            <p className="text-xs text-muted-foreground mt-4">
                                See the full policy in <Link to="/guidelines" className="text-jence-gold hover:underline">Community Guidelines</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
