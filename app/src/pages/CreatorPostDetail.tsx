import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Loader2, ArrowLeft, MessageCircle, Send, Share2, ArrowBigUp, ArrowBigDown, Clock, Check, HandCoins } from 'lucide-react'
import { linkifyText } from '../lib/linkify'
import SEO from '../components/SEO'
import { TipModal } from '../components/TipModal'
import { OGBadge } from '../components/OGBadge'
import { buildArticleShareUrl } from '../lib/public-url'

// Skeleton Component
const PostSkeleton = () => (
    <div className="card-plug p-6 space-y-4 animate-pulse">
        <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-muted/50 shrink-0" />
            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-32 bg-muted/50 rounded" />
                    <div className="h-3 w-20 bg-muted/30 rounded" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-full bg-muted/30 rounded" />
                    <div className="h-4 w-full bg-muted/30 rounded" />
                    <div className="h-4 w-3/4 bg-muted/30 rounded" />
                </div>
            </div>
        </div>
    </div>
)

export default function CreatorPostDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, walletAddress, walletBalance } = useAuth()

    const [post, setPost] = useState<any>(null)
    const [comments, setComments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newComment, setNewComment] = useState('')
    const [submittingComment, setSubmittingComment] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [tipOpen, setTipOpen] = useState(false)
    const [tipping, setTipping] = useState(false)
    const [tipError, setTipError] = useState('')
    const trackedViewRef = useRef<string | null>(null)

    useEffect(() => {
        if (id) loadData(id)
    }, [id, user?.id])

    const loadData = async (postId: string) => {
        setLoading(true)
        try {
            const [postRes, commentsRes] = await Promise.all([
                api.getPost(postId, user?.id),
                api.getPostComments(postId)
            ])
            setPost(postRes)
            setComments(commentsRes)
            if (trackedViewRef.current !== postId) {
                trackedViewRef.current = postId
                api.trackPostView(postId).catch((viewError) => {
                    console.error('Failed to track post view', viewError)
                })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleVote = async (value: number) => {
        if (!user || !post) return

        const previousVote = post.userVote || 0
        const previousScore = post.likes || 0

        let newVote = value
        let newScore = previousScore

        if (previousVote === value) {
            // Toggle off
            newVote = 0
            newScore -= value
        } else {
            // Change vote
            newVote = value
            newScore += value - previousVote
        }

        // Optimistic update
        setPost((prev: any) => ({ ...prev, userVote: newVote, likes: newScore }))

        try {
            await api.votePost(post.id, user.id, newVote)
        } catch (error) {
            console.error(error)
            // Revert on error
            setPost((prev: any) => ({ ...prev, userVote: previousVote, likes: previousScore }))
        }
    }

    const handleComment = async () => {
        if (!user || !newComment.trim() || !post) return
        setSubmittingComment(true)
        try {
            await api.createPostComment(post.id, user.id, newComment)
            setNewComment('')
            // Refresh comments
            const commentsRes = await api.getPostComments(post.id)
            setComments(commentsRes)
            // Update counts (if we tracked comment count in post object, we'd update it here)
        } catch (e) {
            console.error(e)
        } finally {
            setSubmittingComment(false)
        }
    }

    const handleTip = async (amountUsdc: number) => {
        if (!post) return

        setTipping(true)
        setTipError('')

        try {
            await api.tip({
                amountUsdc,
                postId: post.id,
            })
            setTipOpen(false)
        } catch (err: any) {
            console.error('Tip failed:', err)
            setTipError(err?.message || 'Tip failed. Please try again.')
        } finally {
            setTipping(false)
        }
    }

    const shareUrl = post ? buildArticleShareUrl(post.id) : ''

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <PostSkeleton />
                </div>
            </div>
        )
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-background pt-24 px-4 text-center">
                <p className="text-muted-foreground mb-4">Post not found</p>
                <Link to="/explore" className="btn-primary inline-flex">Back to Explore</Link>
            </div>
        )
    }

    const disclosureText = post.disclosure?.trim() || 'No article credit was provided for this article.'

    return (
        <section className="pt-20 sm:pt-24 pb-16 px-3 sm:px-6 lg:px-8 bg-background min-h-screen">
            <SEO 
                title={post.title}
                description={post.excerpt || post.content?.substring(0, 160) + (post.content?.length > 160 ? "..." : "")}
                image={post.imageUrl || post.creatorImage || undefined}
                url={`/post/${post.id}`}
                type="article"
            />
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                </button>

                {/* Main Post */}
                <div className="card-plug p-4 sm:p-6 lg:p-8 mb-8">
                    <div className="flex gap-3 sm:gap-4 items-start">
                        <Link
                            to={`/${post.creatorUsername || post.creatorPseudonym || '#'}`}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted overflow-hidden shrink-0 hover:opacity-80 transition-opacity flex items-center justify-center text-lg sm:text-xl font-bold text-muted-foreground bg-gradient-to-br from-jence-gold/20 to-transparent"
                        >
                            {post.creatorImage ? (
                                <img src={post.creatorImage} className="w-full h-full object-cover" />
                            ) : (
                                post.creatorPseudonym?.[0]
                            )}
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Link to={`/${post.creatorUsername || post.creatorPseudonym || '#'}`} className="font-semibold text-foreground hover:underline">
                                    {post.creatorPseudonym || post.creatorUsername}
                                </Link>
                                {post.creatorIsOg && <OGBadge />}
                                {post.verticalName && (
                                    <Link to={`/verticals/${post.verticalSlug}`} className="text-xs px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                                        {post.verticalName}
                                    </Link>
                                )}
                                <span className="text-muted-foreground text-xs flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                                {post.title}
                            </h1>
                        </div>
                    </div>

                    <div className="mt-5 sm:mt-6 space-y-5">
                        <div className="p-4 rounded-xl border border-border bg-muted/30">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Article credit</p>
                            <p className="text-sm text-muted-foreground">{disclosureText}</p>
                        </div>

                        {post.imageUrl && (
                            <div className="rounded-2xl overflow-hidden border border-border/50 bg-muted/20 aspect-[16/9]">
                                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="relative">
                            {post.isFree || post.hasAccess ? (
                                <div className="text-foreground/90 whitespace-pre-wrap break-words text-sm sm:text-[15px] leading-6 sm:leading-7">
                                    {linkifyText(post.content)}
                                </div>
                            ) : (
                                <>
                                    {/* Dummy blurred text to indicate content length without leaking actual analysis */}
                                    <div className="text-foreground/90 whitespace-pre-wrap blur-sm select-none opacity-50 break-words text-sm sm:text-[15px] leading-6 sm:leading-7">
                                        {linkifyText(post.excerpt || `This is a premium article prepared exclusively for subscribers. The article contains in-depth data, actionable insights, and field-tested takeaways.

To view the full content of this post, please subscribe to ${post.creatorPseudonym}'s channel. Your subscription helps the creator and gives you access to their complete library of premium insights.`)}
                                    </div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center pointer-events-none">
                                        <div className="bg-background/90 backdrop-blur-md px-5 py-6 sm:px-6 sm:py-4 w-full max-w-xs sm:max-w-sm rounded-xl border border-border/80 shadow-2xl pointer-events-auto flex flex-col items-center">
                                            <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-3 text-jence-gold">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                            </div>
                                            <h3 className="font-bold text-foreground mb-1">{post.creatorPseudonym || post.creatorUsername}</h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{post.creatorBio || 'Author on Jence'}</p>
                                            <div className="flex items-center gap-2 w-full mt-4 pt-4 border-t border-border/50">
                                                {user && user.id !== post.creatorUserId ? (
                                                    <Link to={`/${post.creatorUsername || post.creatorPseudonym || '#'}`} className="btn-primary flex-1 text-xs text-center">
                                                        Subscribe
                                                    </Link>
                                                ) : (
                                                    <Link to={`/${post.creatorUsername || post.creatorPseudonym || '#'}`} className="btn-primary w-full text-center">
                                                        View Profile
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
                                <button
                                    onClick={() => handleVote(1)}
                                    className={`p-1.5 rounded hover:bg-muted transition-colors ${post.userVote === 1 ? 'text-orange-500' : 'text-muted-foreground'}`}
                                >
                                    <ArrowBigUp size={24} fill={post.userVote === 1 ? "currentColor" : "none"} />
                                </button>
                                <span className={`text-base font-bold min-w-[1.5em] text-center ${post.userVote === 1 ? 'text-orange-500' : post.userVote === -1 ? 'text-blue-500' : 'text-muted-foreground'}`}>
                                    {post.likes || 0}
                                </span>
                                <button
                                    onClick={() => handleVote(-1)}
                                    className={`p-1.5 rounded hover:bg-muted transition-colors ${post.userVote === -1 ? 'text-blue-500' : 'text-muted-foreground'}`}
                                >
                                    <ArrowBigDown size={24} fill={post.userVote === -1 ? "currentColor" : "none"} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MessageCircle size={18} />
                                <span>{comments.length}</span>
                            </div>
                            {post.allowTips && !user && (
                                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-jence-gold hover:text-jence-gold/80 transition-colors">
                                    <HandCoins size={18} />
                                    Tip creator
                                </Link>
                            )}
                            {post.allowTips && user && user.id !== post.creatorUserId && (
                                <button
                                    onClick={() => {
                                        setTipError('')
                                        setTipOpen(true)
                                    }}
                                    className="inline-flex items-center gap-2 text-sm font-medium text-jence-gold hover:text-jence-gold/80 transition-colors"
                                >
                                    <HandCoins size={18} />
                                    Tip creator
                                </button>
                            )}
                            <button
                                onClick={async () => {
                                    const url = shareUrl
                                    if (navigator.share) {
                                        try {
                                            await navigator.share({
                                                title: post.title,
                                                text: post.excerpt || `Read ${post.title} on Jence.`,
                                                url
                                            })
                                        } catch (e) {
                                            console.error('Error sharing', e)
                                        }
                                    } else {
                                        navigator.clipboard.writeText(url)
                                        setIsCopied(true)
                                        setTimeout(() => setIsCopied(false), 2000)
                                    }
                                }}
                                className={`flex items-center gap-2 text-sm transition-colors ml-auto ${isCopied ? 'text-jence-green' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {isCopied ? <Check size={18} /> : <Share2 size={18} />}
                            </button>
                        </div>
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
                    title={`Tip ${post.creatorPseudonym || post.creatorUsername || 'creator'}`}
                    description={`Send a one-time tip for "${post.title}".`}
                    balance={walletAddress ? walletBalance : undefined}
                    error={tipError}
                />

                {/* Comment Form */}
                {user ? (
                    <div className="flex gap-4 mb-8">
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 flex items-center justify-center font-bold text-muted-foreground">
                            {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 relative">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Post your reply..."
                                className="w-full bg-muted/30 border border-border rounded-xl p-3 focus:border-jence-gold/50 focus:ring-1 focus:ring-jence-gold/20 outline-none text-foreground resize-none h-24 placeholder:text-muted-foreground/50 transition-all pr-12"
                            />
                            <button
                                onClick={handleComment}
                                disabled={submittingComment || !newComment.trim()}
                                className="absolute bottom-3 right-3 p-2 rounded-full bg-jence-gold text-jence-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-jence-gold/90 transition-colors"
                            >
                                {submittingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-6 bg-muted/20 rounded-xl mb-8">
                        <p className="text-muted-foreground mb-4">Log in to join the conversation</p>
                        <Link to="/login" className="btn-primary inline-flex">Log In</Link>
                    </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="p-4 rounded-xl border border-border/50 bg-background/50">
                            <div className="flex gap-3">
                                <Link to={`/${comment.user?.pseudonym || comment.user?.username || '#'}`} className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0 hover:opacity-80 transition-opacity flex items-center justify-center font-bold text-xs text-muted-foreground">
                                    {comment.user?.image ? (
                                        <img src={comment.user.image} className="w-full h-full object-cover" />
                                    ) : (
                                        (comment.user?.displayName || '?')[0].toUpperCase()
                                    )}
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <Link to={`/${comment.user?.pseudonym || comment.user?.username || '#'}`} className="font-semibold text-sm text-foreground hover:underline">
                                            {comment.user?.displayName}
                                        </Link>
                                        {comment.user?.isOg && <OGBadge />}
                                        {comment.user?.isCreator && (
                                            <span className="bg-jence-gold/10 text-jence-gold text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                                Creator
                                            </span>
                                        )}
                                        <span className="text-muted-foreground text-xs truncate">@{comment.user?.username}</span>
                                        <span className="text-muted-foreground text-xs">•</span>
                                        <span className="text-muted-foreground text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-foreground/90 text-sm whitespace-pre-wrap break-words">{linkifyText(comment.content)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to reply!</p>
                    )}
                </div>
            </div>
        </section>
    )
}
