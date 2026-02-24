import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Loader2, ArrowLeft, MessageCircle, Send, Share2, ArrowBigUp, ArrowBigDown, Clock } from 'lucide-react'
import { linkifyText } from '../lib/linkify'

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
    const { user } = useAuth()

    const [post, setPost] = useState<any>(null)
    const [comments, setComments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newComment, setNewComment] = useState('')
    const [submittingComment, setSubmittingComment] = useState(false)

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

    return (
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-background min-h-screen">
            <div className="max-w-3xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                </button>

                {/* Main Post */}
                <div className="card-plug p-6 mb-8">
                    <div className="flex gap-4">
                        <Link to={`/${post.creatorUsername || '#'}`} className="w-12 h-12 rounded-full bg-muted overflow-hidden shrink-0 hover:opacity-80 transition-opacity flex items-center justify-center text-xl font-bold text-muted-foreground bg-gradient-to-br from-jence-gold/20 to-transparent">
                            {post.creatorPseudonym?.[0]}
                        </Link>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Link to={`/${post.creatorUsername || '#'}`} className="font-semibold text-foreground hover:underline">
                                    {post.creatorPseudonym}
                                </Link>
                                {post.verticalName && (
                                    <Link to={`/verticals/${post.verticalSlug}`} className="text-xs px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                                        {post.verticalName}
                                    </Link>
                                )}
                                <span className="text-muted-foreground text-xs flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </span>
                                {post.isFree ? (
                                    <span className="px-2 py-0.5 rounded-full bg-jence-green/10 text-jence-green text-xs">
                                        Free
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-jence-gold/10 text-jence-gold text-xs">
                                        Paid
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl font-bold text-foreground mb-4">{post.title}</h1>

                            <div className="prose prose-invert max-w-none mb-6">
                                <p className="text-foreground/90 whitespace-pre-wrap">{linkifyText(post.content)}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-6 pt-4 border-t border-border/50">
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
                                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

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
                                <Link to={`/${comment.user?.username}`} className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0 hover:opacity-80 transition-opacity flex items-center justify-center font-bold text-xs text-muted-foreground">
                                    {(comment.user?.displayName || '?')[0].toUpperCase()}
                                </Link>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Link to={`/${comment.user?.username}`} className="font-semibold text-sm text-foreground hover:underline">
                                            {comment.user?.displayName}
                                        </Link>
                                        {comment.user?.isCreator && (
                                            <span className="bg-jence-gold/10 text-jence-gold text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                                Creator
                                            </span>
                                        )}
                                        <span className="text-muted-foreground text-xs">@{comment.user?.username}</span>
                                        <span className="text-muted-foreground text-xs">•</span>
                                        <span className="text-muted-foreground text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-foreground/90 text-sm whitespace-pre-wrap">{linkifyText(comment.content)}</p>
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
