import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Loader2, Hash, MessageCircle, Send, ArrowBigUp, ArrowBigDown, MoreVertical } from 'lucide-react'
import { DeleteModal } from '../components/DeleteModal'

// Skeleton Component
const PostSkeleton = () => (
    <div className="card-plug p-5 space-y-4 animate-pulse">
        <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-muted/50 shrink-0" />
            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-24 bg-muted/50 rounded" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-full bg-muted/30 rounded" />
                    <div className="h-4 w-3/4 bg-muted/30 rounded" />
                </div>
                <div className="flex gap-2 pt-2">
                    <div className="h-6 w-16 bg-muted/30 rounded-full" />
                    <div className="h-6 w-16 bg-muted/30 rounded-full" />
                </div>
            </div>
        </div>
    </div>
)

export default function CommunityPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const activeTag = searchParams.get('tag')

    // State
    const [posts, setPosts] = useState<any[]>([])
    const [trendingTags, setTrendingTags] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newPostContent, setNewPostContent] = useState('')
    const [posting, setPosting] = useState(false)
    const [activePostMenu, setActivePostMenu] = useState<string | null>(null)
    const [postToDelete, setPostToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showSignInPrompt, setShowSignInPrompt] = useState(false)

    // Load Data
    useEffect(() => {
        loadData()
    }, [activeTag])

    const loadData = async () => {
        setLoading(true)
        try {
            const [postsRes, tagsRes] = await Promise.all([
                api.getCommunityPosts(activeTag || undefined, user?.id),
                api.getTrendingTags()
            ])
            setPosts(postsRes)
            setTrendingTags(tagsRes)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handlePost = async () => {
        if (!user || !newPostContent.trim()) return
        setPosting(true)
        try {
            await api.createCommunityPost({
                content: newPostContent,
                userId: user.id
            })
            setNewPostContent('')
            await loadData() // Refresh feed
        } catch (e) {
            console.error(e)
        } finally {
            setPosting(false)
        }
    }

    const handleVote = async (e: any, post: any, value: number) => {
        e.preventDefault()
        if (!user) {
            setShowSignInPrompt(true)
            return
        }

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
        setPosts(posts.map(p => p.id === post.id ? { ...p, userVote: newVote, likes: newScore } : p))

        try {
            if (newVote === 0) {
                await api.unvoteCommunityPost(post.id, user.id)
            } else {
                await api.voteCommunityPost(post.id, user.id, newVote)
            }
        } catch (error) {
            console.error(error)
            // Revert on error
            setPosts(posts.map(p => p.id === post.id ? { ...p, userVote: previousVote, likes: previousScore } : p))
        }
    }

    const handleDeletePost = async () => {
        if (!postToDelete || !user) return;
        setIsDeleting(true);
        try {
            await api.deleteCommunityPost(postToDelete, user.id);
            setPosts(posts.filter(p => p.id !== postToDelete));
            setActivePostMenu(null);
            setPostToDelete(null);
        } catch (error) {
            console.error('Failed to delete community post:', error);
            alert('Failed to delete post');
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12 bg-background min-h-screen">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Main Feed */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            {activeTag ? (
                                <>
                                    <span className="text-jence-gold">#{activeTag}</span>
                                    <span className="text-xl text-muted-foreground font-normal">posts</span>
                                </>
                            ) : (
                                'Community Discussion'
                            )}
                        </h1>
                        {activeTag && (
                            <Link to="/community" className="text-sm text-muted-foreground hover:text-foreground">
                                Clear filter
                            </Link>
                        )}
                    </div>

                    {/* Create Post */}
                    {user ? (
                        <div className="card-plug p-4">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                                    {user.image ? (
                                        <img src={user.image} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                                            {user.username?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <textarea
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        placeholder="Start a discussion... use #hashtags to categorize"
                                        className="w-full bg-transparent border-none focus:ring-0 text-foreground resize-none h-20 placeholder:text-muted-foreground/50"
                                    />
                                    <div className="flex justify-end pt-2 border-t border-border/50">
                                        <button
                                            onClick={handlePost}
                                            disabled={posting || !newPostContent.trim()}
                                            className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {posting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card-plug p-6 text-center">
                            <p className="text-muted-foreground mb-4">Log in to join the discussion</p>
                            <Link to="/login" className="btn-primary inline-flex">Log In</Link>
                        </div>
                    )}

                    {/* Feed */}
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <PostSkeleton key={i} />
                            ))}
                        </div>
                    ) : posts.length > 0 ? (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <div key={post.id} className="card-plug p-5 hover:border-jence-gold/20 transition-colors">
                                    <div className="flex gap-4">
                                        {post.author?.isCreator ? (
                                            <Link to={`/${post.author?.username}`} className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 hover:opacity-80 transition-opacity">
                                                {post.author?.image ? (
                                                    <img src={post.author.image} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                                                        {(post.author?.displayName || '?')[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </Link>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                                                {post.author?.image ? (
                                                    <img src={post.author.image} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                                                        {(post.author?.displayName || '?')[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    {post.author?.isCreator ? (
                                                        <Link to={`/${post.author?.username}`} className="font-semibold text-foreground hover:underline">
                                                            {post.author?.displayName}
                                                        </Link>
                                                    ) : (
                                                        <span className="font-semibold text-foreground">
                                                            {post.author?.displayName}
                                                        </span>
                                                    )}
                                                    {post.author?.isCreator && (
                                                        <span className="bg-jence-gold/10 text-jence-gold text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                                            Creator
                                                        </span>
                                                    )}
                                                    <span className="text-muted-foreground text-xs">@{post.author?.username}</span>
                                                    <span className="text-muted-foreground text-xs">•</span>
                                                    <span className="text-muted-foreground text-xs">{new Date(post.createdAt).toLocaleDateString()}</span>
                                                </div>

                                                {/* Only show menu if user owns the post */}
                                                {user && user.id === post.userId && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setActivePostMenu(activePostMenu === post.id ? null : post.id)
                                                        }}
                                                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                )}
                                            </div>

                                            <Link to={`/community/post/${post.id}`} className="block group">
                                                <p className="text-foreground/90 whitespace-pre-wrap mb-3 group-hover:text-jence-gold transition-colors">
                                                    {(() => {
                                                        const cleanContent = post.content.replace(/#[\w]+/gi, '').trim();
                                                        return cleanContent.length > 258 ? `${cleanContent.substring(0, 258)}...` : cleanContent;
                                                    })()}
                                                </p>
                                            </Link>

                                            {/* Tags */}
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {post.tags.map((tag: any) => (
                                                        <Link
                                                            key={tag.name}
                                                            to={`/community?tag=${tag.name}`}
                                                            className="text-xs px-2 py-1 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors"
                                                            style={{ color: tag.color }}
                                                        >
                                                            #{tag.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Interactions */}
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
                                                    <button
                                                        onClick={(e) => handleVote(e, post, 1)}
                                                        className={`p-1 rounded hover:bg-muted transition-colors ${post.userVote === 1 ? 'text-orange-500' : 'text-muted-foreground'}`}
                                                    >
                                                        <ArrowBigUp size={20} fill={post.userVote === 1 ? "currentColor" : "none"} />
                                                    </button>
                                                    <span className={`text-sm font-bold min-w-[1.5em] text-center ${post.userVote === 1 ? 'text-orange-500' : post.userVote === -1 ? 'text-blue-500' : 'text-muted-foreground'}`}>
                                                        {post.likes || 0}
                                                    </span>
                                                    <button
                                                        onClick={(e) => handleVote(e, post, -1)}
                                                        className={`p-1 rounded hover:bg-muted transition-colors ${post.userVote === -1 ? 'text-blue-500' : 'text-muted-foreground'}`}
                                                    >
                                                        <ArrowBigDown size={20} fill={post.userVote === -1 ? "currentColor" : "none"} />
                                                    </button>
                                                </div>
                                                <Link
                                                    to={`/community/post/${post.id}`}
                                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    <MessageCircle size={14} />
                                                    <span>{post.comments || 0}</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No posts found. Be the first to post!
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card-plug p-5 sticky top-24">
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-jence-gold" />
                            Trending Topics
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {trendingTags.map((tag) => (
                                <Link
                                    key={tag.id}
                                    to={`/community?tag=${tag.name}`}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${activeTag === tag.name
                                        ? 'bg-jence-gold/10 border-jence-gold text-jence-gold'
                                        : 'bg-muted/30 border-transparent hover:border-border text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <span style={{ color: activeTag === tag.name ? undefined : tag.color }}>#</span>
                                    {tag.name}
                                    <span className="ml-1.5 text-xs opacity-50">{tag.usageCount}</span>
                                </Link>
                            ))}
                        </div>
                        {trendingTags.length === 0 && (
                            <p className="text-sm text-muted-foreground">No trending topics yet.</p>
                        )}
                    </div>

                    <div className="p-5 rounded-xl bg-gradient-to-br from-jence-gold/10 to-transparent border border-jence-gold/20">
                        <h3 className="font-semibold text-foreground mb-2">Community Guidelines</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Keep discussions respectful and on-topic. Use hashtags to help others find your content.
                        </p>
                        <Link to="/guidelines" className="text-xs text-jence-gold hover:underline">Read full guidelines</Link>
                    </div>
                </div>

            </div>

            {/* Sign In Prompt Overlay */}
            {showSignInPrompt && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    onClick={() => setShowSignInPrompt(false)}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div
                        className="relative z-10 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-jence-gold/10 flex items-center justify-center mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-jence-gold"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Sign in to vote</h3>
                                <p className="text-sm text-muted-foreground mt-1">Join the community to upvote and downvote posts.</p>
                            </div>
                            <div className="flex flex-col gap-2 pt-2">
                                <button
                                    onClick={() => {
                                        setShowSignInPrompt(false)
                                        navigate('/login')
                                    }}
                                    className="btn-primary w-full py-2.5 text-sm font-medium"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => setShowSignInPrompt(false)}
                                    className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Post Actions Overlay */}
            {activePostMenu && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    onClick={() => setActivePostMenu(null)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Action Menu */}
                    <div
                        className="relative z-10 w-72 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-5 py-4 border-b border-border/50">
                            <h3 className="text-sm font-semibold text-foreground">Post Actions</h3>
                        </div>
                        <div className="p-2">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setPostToDelete(activePostMenu);
                                    setActivePostMenu(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-3"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                Delete Post
                            </button>
                        </div>
                        <div className="p-2 border-t border-border/50">
                            <button
                                onClick={() => setActivePostMenu(null)}
                                className="w-full text-center px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            <DeleteModal
                isOpen={!!postToDelete}
                onClose={() => setPostToDelete(null)}
                onConfirm={handleDeletePost}
                isDeleting={isDeleting}
            />
        </section>
    )
}
