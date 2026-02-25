import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, Users, FileText, AlertTriangle, Loader2, ArrowBigUp, MessageCircle, Star, X, Pin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import SEO from '../components/SEO'

export default function CreatorProfilePage() {
    const { username } = useParams<{ username: string }>()
    const { user } = useAuth()
    const [data, setData] = useState<{ creator: any; posts: any[]; feedback?: any[] } | null>(null)
    const [loading, setLoading] = useState(true)
    const [subscribing, setSubscribing] = useState(false)
    const [subscribed, setSubscribed] = useState(false)
    const [paymentError, setPaymentError] = useState('')

    // Rating state
    const [ratingValue, setRatingValue] = useState(0)
    const [feedbackText, setFeedbackText] = useState('')
    const [submittingRating, setSubmittingRating] = useState(false)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
    const [togglingBan, setTogglingBan] = useState(false)

    useEffect(() => {
        if (!username) return
        // We now pass user.id (if available) to check subscription status
        api.getCreatorByUsername(username, user?.id)
            .then((data) => {
                setData(data)
                // If the API returns isSubscribed, update local state
                if (data?.creator?.isSubscribed) {
                    setSubscribed(true)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [username, user?.id])

    const handleSubscribe = async () => {
        if (!user?.id || !data?.creator?.id) return
        setSubscribing(true)
        setPaymentError('')

        try {
            // Note: The backend POST /api/subscriptions route now handles 
            // the actual USDC transaction using the user's managed wallet.
            await api.subscribe(user.id, data.creator.id)
            setSubscribed(true)
        } catch (err: any) {
            console.error('Subscription failed:', err)
            setPaymentError(err?.message || 'Payment failed. Please try again.')
        } finally {
            setSubscribing(false)
        }
    }

    const handleRate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !data?.creator?.id) return
        setSubmittingRating(true)
        try {
            await api.rateCreator(data.creator.id, user.id, ratingValue, feedbackText)
            // Refresh data
            const res = await api.getCreatorByUsername(username!)
            setData(res)
            setFeedbackText('')
        } catch (err: any) {
            console.error('Failed to rate:', err)
            alert(err.message || 'Failed to submit rating.')
        } finally {
            setSubmittingRating(false)
        }
    }

    const handleVote = async (e: React.MouseEvent, post: any) => {
        e.preventDefault()
        e.stopPropagation()
        if (!user) return

        const previousVote = post.userVote || 0
        const previousScore = post.likes || 0

        let newVote = 1
        let newScore = previousScore

        if (previousVote === 1) {
            newVote = 0
            newScore -= 1
        } else {
            newVote = 1
            newScore += 1 - previousVote
        }

        // Optimistic update
        if (data) {
            setData({
                ...data,
                posts: data.posts.map(p => p.id === post.id ? { ...p, userVote: newVote, likes: newScore } : p)
            })
        }

        try {
            await api.votePost(post.id, user.id, newVote)
        } catch (error) {
            console.error(error)
            // Revert
            if (data) {
                setData({
                    ...data,
                    posts: data.posts.map(p => p.id === post.id ? { ...p, userVote: previousVote, likes: previousScore } : p)
                })
            }
        }
    }

    const handleToggleBan = async () => {
        if (!user || user.role !== 'admin' || !data?.creator?.userId) return
        if (!confirm(`Are you sure you want to ${data.creator.isBanned ? 'unban' : 'ban'} this user?`)) return

        setTogglingBan(true)
        try {
            await api.toggleUserBan(data.creator.userId, !data.creator.isBanned)
            // Local optimistic update
            setData({
                ...data,
                creator: {
                    ...data.creator,
                    isBanned: !data.creator.isBanned
                }
            })
        } catch (err: any) {
            console.error('Failed to toggle ban:', err)
            alert(err.message || 'Failed to toggle ban status.')
        } finally {
            setTogglingBan(false)
        }
    }

    if (loading) {
        return (
            <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12 animate-pulse">
                <div className="max-w-4xl mx-auto">
                    <div className="card-plug overflow-hidden mb-8">
                        <div className="h-32 bg-muted/50 w-full relative"></div>
                        <div className="px-6 pb-6 relative">
                            <div className="w-24 h-24 rounded-2xl bg-muted border-4 border-background absolute -top-12"></div>
                            <div className="mt-16 sm:mt-4 sm:ml-32 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div>
                                    <div className="h-8 w-48 bg-muted rounded-lg mb-2"></div>
                                    <div className="h-4 w-32 bg-muted rounded-lg"></div>
                                </div>
                                <div className="h-10 w-32 bg-muted rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card-plug p-5 animate-pulse bg-muted/20 border-border/10">
                                <div className="h-3 bg-muted rounded w-32 mb-3" />
                                <div className="h-5 bg-muted rounded w-2/3 mb-2" />
                                <div className="h-3 bg-muted rounded w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (!data) {
        return (
            <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Creator not found</h1>
                    <Link to="/explore" className="text-jence-gold hover:underline">
                        ← Back to explore
                    </Link>
                </div>
            </section>
        )
    }

    const { creator, posts } = data

    return (
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
            <SEO
                title={`${creator.pseudonym || creator.user?.name || username} — Expert Analysis`}
                description={`Subscribe to ${creator.pseudonym || username}'s premium analysis on Jence. ${creator.bio || 'Anonymous expert insights from a verified industry insider.'}`}
                url={`/${username}`}
                image={creator.user?.image || undefined}
                type="profile"
            />
            <div className="max-w-3xl mx-auto">
                {/* Profile Header */}
                <div className="card-plug p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-jence-gold/30 to-jence-gold/5 flex items-center justify-center text-2xl font-bold text-jence-gold shrink-0">
                                {creator.image ? (
                                    <img src={creator.image} className="w-full h-full object-cover" />
                                ) : (
                                    creator.pseudonym?.[0] || '?'
                                )}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">{creator.pseudonym}</h1>
                                {creator.verticalName && (
                                    <Link
                                        to={`/verticals/${creator.verticalSlug}`}
                                        className="text-sm text-muted-foreground hover:text-jence-gold transition-colors"
                                    >
                                        {creator.verticalName}
                                    </Link>
                                )}
                                {creator.isBanned && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                        BANNED
                                    </span>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                                    <span className="flex items-center gap-1">
                                        <Star size={12} className={creator.averageRating > 0 ? "text-jence-gold fill-jence-gold" : ""} />
                                        {creator.averageRating > 0 ? creator.averageRating : 'No ratings'} ({creator.ratingCount || 0})
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users size={12} />
                                        {creator.subscriberCount || 0} subscribers
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FileText size={12} />
                                        {posts.length} posts
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        Joined {new Date(creator.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full sm:w-auto mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
                            {user?.role === 'admin' && (
                                <button
                                    onClick={handleToggleBan}
                                    disabled={togglingBan}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${creator.isBanned
                                            ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                                            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                                        }`}
                                >
                                    {togglingBan ? 'Processing...' : (creator.isBanned ? 'Unban Account' : 'Ban Account')}
                                </button>
                            )}
                            {user && !subscribed ? (
                                <button
                                    onClick={handleSubscribe}
                                    disabled={subscribing}
                                    className="btn-primary w-full sm:w-auto text-sm disabled:opacity-60 active:scale-[0.97] transition-all"
                                >
                                    {subscribing ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin inline mr-2" />
                                            {parseFloat(data?.creator?.subscriptionPrice || '0') > 0 ? 'Processing payment...' : 'Subscribing...'}
                                        </>
                                    ) : (
                                        parseFloat(data?.creator?.subscriptionPrice || '0') > 0
                                            ? `Subscribe · $${data?.creator?.subscriptionPrice} USDC`
                                            : 'Subscribe · Free'
                                    )}
                                </button>
                            ) : subscribed ? (
                                <span className="flex items-center justify-center w-full sm:w-auto px-4 py-2 rounded-lg bg-jence-green/10 text-jence-green text-sm font-medium">
                                    ✓ Subscribed
                                </span>
                            ) : (
                                <Link to="/login" className="btn-primary w-full sm:w-auto text-center block text-sm active:scale-[0.97] transition-all">
                                    Sign in to subscribe
                                </Link>
                            )}
                        </div>
                    </div>

                    {paymentError && (
                        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in">
                            {paymentError}
                        </div>
                    )}

                    {creator.bio && (
                        <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                            {creator.bio}
                        </p>
                    )}
                </div>


                {/* Posts */}
                <h2 className="font-semibold text-foreground mb-4">Published Analysis</h2>

                {posts.length > 0 ? (
                    <div className="space-y-4">
                        {posts.map((post: any) => (
                            <article key={post.id} className="card-plug p-5 hover:border-jence-gold/20 transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                    {post.isFree && (
                                        <span className="px-2 py-0.5 rounded-full bg-jence-green/10 text-jence-green text-xs">
                                            Free
                                        </span>
                                    )}
                                    {!post.isFree && (
                                        <span className="px-2 py-0.5 rounded-full bg-jence-gold/10 text-jence-gold text-xs flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-jence-gold" />
                                            Paid
                                        </span>
                                    )}
                                    {post.isPinned && (
                                        <span className="px-2 py-0.5 rounded-full bg-jence-gold/10 text-jence-gold text-xs flex items-center gap-1">
                                            <Pin size={10} className="fill-current" />
                                            Pinned
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <Link to={`/post/${post.id}`} className="block group">
                                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-jence-gold transition-colors">{post.title}</h3>
                                        <p className={`text-sm text-muted-foreground line-clamp-2 ${!post.isFree && !subscribed && user?.id !== creator.userId ? 'blur-sm select-none' : ''
                                            }`}>
                                            {(post.excerpt || post.content || '').length > 258
                                                ? `${(post.excerpt || post.content || '').substring(0, 258)}...`
                                                : (post.excerpt || post.content || '').substring(0, 200)}
                                        </p>
                                    </Link>

                                    {!post.isFree && !subscribed && user?.id !== creator.userId && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border shadow-sm pointer-events-auto">
                                                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                                    🔒 Subscribe to read
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => handleVote(e, post)}
                                            className={`flex items-center gap-1 text-xs transition-colors hover:bg-muted/50 p-1.5 rounded-md ${post.userVote === 1 ? 'text-jence-gold' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            <ArrowBigUp size={18} fill={post.userVote === 1 ? "currentColor" : "none"} />
                                            <span className="font-medium">{post.likes || 0}</span>
                                        </button>
                                    </div>
                                    <Link
                                        to={`/post/${post.id}`}
                                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50 p-1.5 rounded-md"
                                    >
                                        <MessageCircle size={16} />
                                        <span>{post.comments || 0}</span>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="card-plug p-8 text-center">
                        <p className="text-muted-foreground">No posts published yet.</p>
                    </div>
                )}

                {/* Reviews & Ratings Floating Button */}
                <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="fixed right-0 sm:right-4 top-1/2 -translate-y-1/2 bg-card border border-border shadow-lg px-1.5 sm:px-2 py-3 sm:py-4 rounded-l-xl hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2 sm:gap-3 z-40 group"
                >
                    <div className="flex flex-col items-center gap-1">
                        <Star size={12} className="text-jence-gold fill-jence-gold group-hover:scale-110 transition-transform sm:w-[14px] sm:h-[14px]" />
                        <span
                            className="text-[9px] sm:text-[10px] font-bold text-foreground tracking-widest uppercase mt-1 sm:mt-2"
                            style={{ writingMode: 'vertical-rl' }}
                        >
                            Reviews
                        </span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold bg-muted px-1 sm:px-1.5 py-0.5 rounded text-muted-foreground mt-0.5 sm:mt-1">
                        {data.feedback?.length || 0}
                    </span>
                </button>

                {/* Reviews Side Modal */}
                {isReviewModalOpen && (
                    <div className="fixed inset-0 z-50 flex justify-end bg-background/40 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4">
                        {/* Overlay click to close */}
                        <div className="absolute inset-0" onClick={() => setIsReviewModalOpen(false)} />

                        <div className="relative w-full max-w-sm h-full sm:h-auto sm:max-h-full bg-card border-x sm:border border-border sm:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 z-10 overflow-hidden">
                            <div className="flex items-center justify-between p-5 border-b border-border/50 shrink-0 bg-muted/10">
                                <h2 className="font-semibold text-foreground flex items-center gap-2">
                                    <Star size={16} className="text-jence-gold fill-jence-gold" />
                                    Reviews & Ratings
                                </h2>
                                <button onClick={() => setIsReviewModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
                                {user && user.id !== creator.userId && (
                                    subscribed ? (
                                        <div className="card-plug p-4 mb-6 bg-background">
                                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Leave a Review</h3>
                                            <form onSubmit={handleRate} className="space-y-3">
                                                <div>
                                                    <div className="flex items-center gap-1 mb-2">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setRatingValue(star)}
                                                                className={`p-1 hover:scale-110 transition-transform ${star <= ratingValue ? 'text-jence-gold' : 'text-muted-foreground hover:text-jence-gold/50'}`}
                                                            >
                                                                <Star size={18} className={star <= ratingValue ? 'fill-jence-gold' : ''} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <textarea
                                                        value={feedbackText}
                                                        onChange={(e) => setFeedbackText(e.target.value)}
                                                        placeholder="Share your experience with this creator..."
                                                        className="input-field min-h-[80px] text-sm resize-none"
                                                    />
                                                </div>
                                                <div className="flex justify-end">
                                                    <button
                                                        type="submit"
                                                        disabled={submittingRating}
                                                        className="btn-primary text-xs py-1.5 px-3"
                                                    >
                                                        {submittingRating ? 'Submitting...' : 'Submit'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="card-plug p-4 mb-6 bg-background text-center border-dashed">
                                            <p className="text-xs text-muted-foreground">Subscribe to leave a review.</p>
                                        </div>
                                    )
                                )}

                                <div className="space-y-3">
                                    {data.feedback && data.feedback.filter((r: any) => r.feedback).length > 0 ? (
                                        data.feedback.filter((r: any) => r.feedback).map((review: any) => (
                                            <div key={review.id} className="card-plug p-4 bg-background">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground overflow-hidden">
                                                            {review.user?.image ? (
                                                                <img src={review.user.image} alt="User avatar" className="w-full h-full object-cover" />
                                                            ) : (
                                                                review.user?.username?.[0]?.toUpperCase() || '?'
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-foreground">{review.user?.name || review.user?.username || 'Anonymous'}</p>
                                                            <p className="text-[10px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-0.5 text-jence-gold">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={10} className={i < review.rating ? 'fill-jence-gold' : 'text-muted-foreground/30'} />
                                                        ))}
                                                    </div>
                                                </div>
                                                {
                                                    review.feedback && (
                                                        <p className="text-xs text-foreground/90 mt-2 leading-relaxed">{review.feedback}</p>
                                                    )
                                                }
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center border border-dashed border-border/50 rounded-xl bg-muted/10">
                                            <p className="text-xs text-muted-foreground">No reviews yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Disclaimer */}
                <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-start gap-2">
                        <AlertTriangle size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                            Content is for informational purposes only. Jence does not verify the accuracy of creator content.
                            Past analysis does not guarantee future outcomes.
                        </p>
                    </div>
                </div>
            </div>
        </section >
    )
}
