import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    CheckCircle2, Shield, ArrowRight, Rocket, Clock,
    Send, Loader2, X, AlertCircle, Trash2, HandCoins, Upload, ArrowBigUp
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import SEO from '../components/SEO'
import { Switch } from '../components/ui/switch'
import { TipModal } from '../components/TipModal'
import LaunchPreviewCard from '../components/LaunchPreviewCard'

export default function LaunchNotesPage() {
    const { user, walletAddress, walletBalance } = useAuth()
    const [launches, setLaunches] = useState<any[]>([])
    const [myLaunches, setMyLaunches] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showMySubmissions, setShowMySubmissions] = useState(false)

    // Form state
    const [name, setName] = useState('')
    const [company, setCompany] = useState('')
    const [logoUrl, setLogoUrl] = useState('')
    const [videoUrl, setVideoUrl] = useState('')
    const [imageAssets, setImageAssets] = useState<string[]>([])
    const [uploadingImages, setUploadingImages] = useState(false)
    const [summary, setSummary] = useState('')
    const [tagsInput, setTagsInput] = useState('')
    const [disclosure, setDisclosure] = useState('')
    const [allowTips, setAllowTips] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [tipTarget, setTipTarget] = useState<{ launchId: string; title: string; description: string } | null>(null)
    const [tipping, setTipping] = useState(false)
    const [tipError, setTipError] = useState('')
    const [votingLaunchId, setVotingLaunchId] = useState<string | null>(null)

    // Admin review state
    const [reviewing, setReviewing] = useState<string | null>(null)
    const ownLaunchIds = new Set(myLaunches.map((launch) => launch.id))
    const getLaunchStackClass = (index: number) => {
        if (index % 3 === 1) return 'w-full sm:max-w-[88%] sm:self-end'
        if (index % 3 === 2) return 'w-full sm:max-w-[95%] sm:ml-5 lg:ml-10'
        return 'w-full sm:max-w-[92%]'
    }

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
                logoUrl: logoUrl || undefined,
                videoUrl: videoUrl || undefined,
                imageAssets: imageAssets.length > 0 ? imageAssets : undefined,
                summary,
                tags: tags.length > 0 ? tags : undefined,
                disclosure: disclosure.trim() || undefined,
                allowTips,
            })

            setSubmitSuccess(true)
            setName('')
            setCompany('')
            setLogoUrl('')
            setVideoUrl('')
            setImageAssets([])
            setSummary('')
            setTagsInput('')
            setDisclosure('')
            setAllowTips(false)
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

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const supportedMimeTypes = new Set([
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/avif',
            'image/avif-sequence',
            'image/heic',
            'image/heif',
            'image/heic-sequence',
            'image/heif-sequence',
        ])
        const supportedImage = supportedMimeTypes.has(file.type.toLowerCase()) || /\.(jpe?g|png|gif|webp|avif|avifs|heic|heif|heics|heifs)$/i.test(file.name)
        if (!supportedImage) {
            alert('Jence only accepts JPG, PNG, GIF, WebP, AVIF, or HEIC logos.')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Logo size must be less than 5MB')
            return
        }

        setUploadingLogo(true)
        try {
            const data = await api.uploadImage(file)
            if (data?.url) {
                setLogoUrl(data.url)
            } else {
                throw new Error('Upload failed')
            }
        } catch (err: any) {
            console.error('Logo upload failed:', err)
            alert(err?.message || 'Jence could not upload that logo. Please try again.')
        } finally {
            setUploadingLogo(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return

        if (imageAssets.length + files.length > 5) {
            alert('You can only upload up to 5 images.')
            return
        }

        const validFiles = files.filter(file => {
            const isSupported = /\.(jpe?g|png|gif|webp|avif|heic)$/i.test(file.name)
            if (!isSupported) alert(`Unsupported file type: ${file.name}`)
            const isSmallEnough = file.size <= 5 * 1024 * 1024
            if (!isSmallEnough) alert(`File too large (max 5MB): ${file.name}`)
            return isSupported && isSmallEnough
        })

        if (!validFiles.length) return

        setUploadingImages(true)
        try {
            const urls = await Promise.all(validFiles.map(async file => {
                const data = await api.uploadImage(file)
                if (data?.url) return data.url
                throw new Error('Upload failed')
            }))
            setImageAssets(prev => [...prev, ...urls.filter(Boolean) as string[]])
        } catch (err: any) {
            console.error('Image upload failed:', err)
            alert(err?.message || 'Failed to upload one or more images.')
        } finally {
            setUploadingImages(false)
        }
    }

    const handleRemoveImage = (index: number) => {
        setImageAssets(prev => prev.filter((_, i) => i !== index))
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

    const handleTip = async (amountUsdc: number) => {
        if (!tipTarget) return

        setTipping(true)
        setTipError('')

        try {
            await api.tip({
                amountUsdc,
                launchNoteId: tipTarget.launchId,
            })
            setTipTarget(null)
        } catch (err: any) {
            console.error('Tip failed', err)
            setTipError(err?.message || 'Tip failed. Please try again.')
        } finally {
            setTipping(false)
        }
    }

    const handleLaunchUpvote = async (launchId: string) => {
        if (!user) return

        const targetLaunch = launches.find((launch) => launch.id === launchId)
        if (!targetLaunch) return

        const previousUpvoted = !!targetLaunch.userHasUpvoted
        const previousUpvotes = Number(targetLaunch.upvotes || 0)
        const nextUpvoted = !previousUpvoted

        setVotingLaunchId(launchId)
        setLaunches((current) =>
            current.map((launch) =>
                launch.id === launchId
                    ? {
                        ...launch,
                        userHasUpvoted: nextUpvoted,
                        upvotes: previousUpvotes + (nextUpvoted ? 1 : -1),
                    }
                    : launch
            )
        )

        try {
            if (nextUpvoted) {
                await api.upvoteLaunch(launchId)
            } else {
                await api.removeLaunchUpvote(launchId)
            }
        } catch (error) {
            console.error('Failed to update launch upvote', error)
            setLaunches((current) =>
                current.map((launch) =>
                    launch.id === launchId
                        ? {
                            ...launch,
                            userHasUpvoted: previousUpvoted,
                            upvotes: previousUpvotes,
                        }
                        : launch
                )
            )
        } finally {
            setVotingLaunchId(null)
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
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <span className="label-mono mb-2 block">Launch Notes</span>
                    <h1 className="heading-lg text-foreground mb-4">
                        Curated product launches for robotics and hardware
                    </h1>
                    <p className="body-md max-w-2xl mx-auto">
                        Submit a launch note for editorial review, then publish the full release context, disclosures, and community support path in one place.
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
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h3 className="font-semibold text-foreground mb-2">Submit a launch</h3>

                                {submitError && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {submitError}
                                    </div>
                                )}

                                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,360px)]">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                                className="input-field min-h-[140px] resize-y"
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
                                            <label className="block text-sm font-medium text-foreground mb-1">Video Link (optional)</label>
                                            <input
                                                type="url"
                                                value={videoUrl}
                                                onChange={e => setVideoUrl(e.target.value)}
                                                className="input-field"
                                                placeholder="e.g. YouTube, Vimeo, or MP4 URL"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1">Disclosure (optional)</label>
                                            <textarea
                                                value={disclosure}
                                                onChange={e => setDisclosure(e.target.value)}
                                                className="input-field min-h-[96px] resize-y"
                                                placeholder="Any conflicts of interest, funding, or vendor ties."
                                            />
                                        </div>

                                        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/10 p-4">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Allow tips</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Let readers send one-time tips to this launch after approval.
                                                </p>
                                            </div>
                                            <Switch checked={allowTips} onCheckedChange={setAllowTips} />
                                        </div>

                                        <div className="rounded-[24px] border border-border/70 bg-background/70 p-4 sm:p-5">
                                            <div className="flex justify-between items-center mb-3">
                                                <p className="label-mono block">Image Assets ({imageAssets.length}/5)</p>
                                            </div>
                                            {imageAssets.length > 0 && (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                                                    {imageAssets.map((url, i) => (
                                                        <div key={i} className="relative group rounded-xl overflow-hidden border border-border/70 aspect-video bg-muted/30">
                                                            <img src={url} alt={`Asset ${i + 1}`} className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveImage(i)}
                                                                className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {imageAssets.length < 5 && (
                                                <label className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-border px-6 text-center transition-colors hover:border-jence-gold/50 hover:bg-muted/30 ${uploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.webp,.avif,.heic,.heif"
                                                        multiple
                                                        onChange={handleImageUpload}
                                                        disabled={uploadingImages}
                                                        className="sr-only"
                                                    />
                                                    {uploadingImages ? (
                                                        <>
                                                            <Loader2 size={24} className="mb-2 animate-spin text-jence-gold" />
                                                            <p className="text-sm font-medium text-foreground">Uploading...</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload size={24} className="mb-2 text-muted-foreground" />
                                                            <p className="text-sm font-medium text-foreground">Upload images</p>
                                                        </>
                                                    )}
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <aside className="space-y-4">
                                        <div className="rounded-[24px] border border-border/70 bg-background/70 p-4 sm:p-5">
                                            <p className="label-mono mb-3 block">Brand Mark</p>
                                            {logoUrl ? (
                                                <div className="space-y-3">
                                                    <div className="flex h-40 items-center justify-center overflow-hidden rounded-[22px] border border-border/70 bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                                                        <img src={logoUrl} alt="Launch logo preview" className="h-full w-full object-contain" />
                                                    </div>
                                                    <div className="flex flex-col gap-2 sm:flex-row">
                                                        <label className={`flex-1 rounded-xl border border-dashed border-border px-4 py-3 text-center text-sm font-medium text-foreground transition-colors hover:border-jence-gold/50 hover:bg-muted/30 ${uploadingLogo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                                            <input
                                                                type="file"
                                                                accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.webp,.avif,.heic,.heif"
                                                                onChange={handleLogoUpload}
                                                                disabled={uploadingLogo}
                                                                className="sr-only"
                                                            />
                                                            Replace logo
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setLogoUrl('')}
                                                            className="rounded-xl border border-red-400/20 px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-400/5"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[22px] border-2 border-dashed border-border px-6 text-center transition-colors hover:border-jence-gold/50 hover:bg-muted/30 ${uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.webp,.avif,.heic,.heif"
                                                        onChange={handleLogoUpload}
                                                        disabled={uploadingLogo}
                                                        className="sr-only"
                                                    />
                                                    {uploadingLogo ? (
                                                        <>
                                                            <Loader2 size={30} className="mb-3 animate-spin text-jence-gold" />
                                                            <p className="text-sm font-medium text-foreground">Uploading logo...</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload size={30} className="mb-3 text-muted-foreground" />
                                                            <p className="text-sm font-medium text-foreground">Upload a logo</p>
                                                            <p className="mt-2 max-w-[16rem] text-xs leading-6 text-muted-foreground">
                                                                Use a square or transparent image if possible. JPG, PNG, GIF, WebP, AVIF, or HEIC up to 5MB.
                                                            </p>
                                                        </>
                                                    )}
                                                </label>
                                            )}
                                        </div>

                                        <div className="rounded-[24px] border border-border/70 bg-gradient-to-br from-background via-card to-muted/20 p-4 sm:p-5">
                                            <p className="label-mono mb-3 block">Live Preview</p>
                                            <div className="overflow-hidden rounded-[22px] border border-border/70 bg-background/80 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-jence-gold/20 bg-gradient-to-br from-jence-gold/20 via-jence-gold/10 to-transparent text-sm font-black tracking-[0.18em] text-jence-gold">
                                                        {logoUrl ? (
                                                            <img src={logoUrl} alt="Logo preview" className="h-full w-full bg-white object-contain p-3" />
                                                        ) : (
                                                            (company || name || 'JN')
                                                                .split(/\s+/)
                                                                .filter(Boolean)
                                                                .slice(0, 2)
                                                                .map((part) => part[0]?.toUpperCase() || '')
                                                                .join('')
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                                            Launch Note
                                                        </p>
                                                        <h4 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                                                            {name || 'Product name preview'}
                                                        </h4>
                                                        <p className="mt-2 text-sm text-muted-foreground">
                                                            {company || 'Company name'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 rounded-[18px] border border-border/70 bg-muted/20 p-4">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                                        Release Brief
                                                    </p>
                                                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                                        {summary || 'Your public summary will appear here with a stronger editorial presentation once the launch note is approved.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </aside>
                                </div>

                                <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs leading-6 text-muted-foreground">
                                        Launch cards stay responsive from mobile to wide desktop and now support dedicated brand logos.
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn-primary w-full justify-center sm:w-auto active:scale-[0.97] disabled:opacity-60"
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
                                </div>
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
                                        <div className="mr-3 flex min-w-0 items-center gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-jence-gold/20 bg-gradient-to-br from-jence-gold/20 via-jence-gold/10 to-transparent text-[11px] font-black tracking-[0.16em] text-jence-gold">
                                                {launch.logoUrl ? (
                                                    <img src={launch.logoUrl} alt={`${launch.company || launch.name} logo`} className="h-full w-full bg-white object-contain p-2" />
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
                                                <Link to={`/launches/${launch.id}`} className="text-sm font-medium text-foreground transition-colors hover:text-jence-gold">
                                                    {launch.name}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">{launch.company}</p>
                                            </div>
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
                    <div className="flex flex-col gap-5">
                        {launches.map((launch, index) => {
                            const actions: React.ReactNode[] = []

                            if (launch.status === 'approved') {
                                if (!user) {
                                    actions.push(
                                        <Link
                                            key="login-upvote"
                                            to="/login"
                                            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-jence-gold/30 hover:text-jence-gold"
                                        >
                                            <ArrowBigUp size={12} />
                                            Upvote
                                        </Link>
                                    )
                                } else if (!ownLaunchIds.has(launch.id)) {
                                    actions.push(
                                        <button
                                            key="launch-upvote"
                                            onClick={() => handleLaunchUpvote(launch.id)}
                                            disabled={votingLaunchId === launch.id}
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${launch.userHasUpvoted ? 'border-jence-gold/20 bg-jence-gold/5 text-jence-gold hover:bg-jence-gold/10' : 'border-border/60 bg-background/80 text-foreground hover:border-jence-gold/30 hover:text-jence-gold'}`}
                                        >
                                            {votingLaunchId === launch.id ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                <ArrowBigUp size={12} className={launch.userHasUpvoted ? 'fill-current' : ''} />
                                            )}
                                            {launch.userHasUpvoted ? 'Upvoted' : 'Upvote'}
                                        </button>
                                    )
                                }
                            }

                            if (launch.allowTips && launch.status === 'approved') {
                                if (!user) {
                                    actions.push(
                                        <Link
                                            key="login-tip"
                                            to="/login"
                                            className="inline-flex items-center gap-1.5 rounded-full border border-jence-gold/20 bg-jence-gold/5 px-3 py-1.5 text-xs font-medium text-jence-gold transition-colors hover:bg-jence-gold/10"
                                        >
                                            <HandCoins size={12} />
                                            Tip launch
                                        </Link>
                                    )
                                } else if (!ownLaunchIds.has(launch.id)) {
                                    actions.push(
                                        <button
                                            key="launch-tip"
                                            onClick={() => {
                                                setTipError('')
                                                setTipTarget({
                                                    launchId: launch.id,
                                                    title: launch.name,
                                                    description: `Send a one-time tip for "${launch.name}".`,
                                                })
                                            }}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-jence-gold/20 bg-jence-gold/5 px-3 py-1.5 text-xs font-medium text-jence-gold transition-colors hover:bg-jence-gold/10"
                                        >
                                            <HandCoins size={12} />
                                            Tip launch
                                        </button>
                                    )
                                }
                            }

                            if (user?.role === 'admin' && launch.status === 'pending') {
                                actions.push(
                                    <button
                                        key="approve"
                                        onClick={() => handleReview(launch.id, 'approved')}
                                        disabled={reviewing === launch.id}
                                        className="btn-primary px-4 py-2 text-xs active:scale-[0.97] disabled:opacity-50"
                                    >
                                        {reviewing === launch.id ? 'Processing...' : 'Approve'}
                                    </button>
                                )
                                actions.push(
                                    <button
                                        key="reject"
                                        onClick={() => handleReview(launch.id, 'rejected')}
                                        disabled={reviewing === launch.id}
                                        className="btn-outline border-red-400/30 px-4 py-2 text-xs text-red-400 hover:bg-red-400/5 active:scale-[0.97] disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                )
                            }

                            return (
                                <LaunchPreviewCard
                                    key={launch.id}
                                    launch={launch}
                                    to={`/launches/${launch.id}`}
                                    authorTo={launch.authorPseudonym || launch.authorUsername ? `/${launch.authorPseudonym || launch.authorUsername}` : undefined}
                                    actions={actions.length > 0 ? actions : undefined}
                                    className={getLaunchStackClass(index)}
                                    hideSummary={true}
                                />
                            )
                        })}

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

                <TipModal
                    isOpen={!!tipTarget}
                    onClose={() => {
                        setTipTarget(null)
                        setTipError('')
                    }}
                    onConfirm={handleTip}
                    isSubmitting={tipping}
                    title={tipTarget ? `Tip ${tipTarget.title}` : 'Tip launch'}
                    description={tipTarget?.description || 'Send a one-time tip from your embedded wallet.'}
                    balance={walletAddress ? walletBalance : undefined}
                    error={tipError}
                />

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
