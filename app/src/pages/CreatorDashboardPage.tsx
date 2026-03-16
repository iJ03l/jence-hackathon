import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Users, FileText, DollarSign,
    Plus, Clock, MoreVertical, Loader2, Eye, ArrowBigUp, MessageCircle, Pin, ExternalLink, X, Upload
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { DeleteModal } from '../components/DeleteModal'

export default function CreatorDashboardPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [creatorId, setCreatorId] = useState<string>('')
    const [verticalId, setVerticalId] = useState<string>('')

    const [stats, setStats] = useState({
        totalSubscribers: 0,
        totalViews: 0,
        totalPosts: 0,
        totalEarnings: 0
    })
    const [posts, setPosts] = useState<any[]>([])
    const [feedback, setFeedback] = useState<any[]>([])
    const [isPostModalOpen, setIsPostModalOpen] = useState(false)
    const [activePostMenu, setActivePostMenu] = useState<string | null>(null)
    const [postToDelete, setPostToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Close post menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (activePostMenu) {
                setActivePostMenu(null)
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [activePostMenu])

    useEffect(() => {
        if (!user?.id) return

        const fetchDashboardData = async () => {
            if (user?.id) {
                try {
                    setError(null)
                    const profileRes = await api.getCreatorByUserId(user.id).catch(err => {
                        if (err.message === 'Creator not found') {
                            return null;
                        }
                        throw err;
                    })

                    if (!profileRes?.creator?.id) {
                        // User is a creator role but has no profile, redirect to onboarding
                        navigate('/creator-onboarding')
                        return
                    }
                    const cId = profileRes.creator.id
                    setCreatorId(cId)
                    setVerticalId(profileRes.creator.verticalId)
                    setFeedback(profileRes.feedback || [])


                    // 2. Get Stats
                    const statsRes = await api.getCreatorStats(cId)
                    setStats(statsRes)

                    // 3. Get Posts
                    const postsRes = await api.getMyPosts(cId)
                    setPosts(postsRes)
                } catch (e: any) {
                    console.error("Failed to load dashboard data", e)
                    setError(e.message || 'Failed to load dashboard data')
                } finally {
                    setLoading(false)
                }
            }
        }

        fetchDashboardData()
    }, [user])

    const handleVote = async (e: any, post: any) => {
        e.preventDefault()
        if (!user) return

        // Toggle vote (only upvote supported for posts in this UI for now, or use same logic as community)
        // Request says "upvote button". Let's assume toggle upvote.

        const previousVote = post.userVote || 0
        const previousScore = post.likes || 0

        let newVote = 1
        let newScore = previousScore

        if (previousVote === 1) {
            // Toggle off
            newVote = 0
            newScore -= 1
        } else {
            newVote = 1
            newScore += 1 - previousVote
        }

        // Optimistic update
        setPosts(posts.map(p => p.id === post.id ? { ...p, userVote: newVote, likes: newScore } : p))

        try {
            await api.votePost(post.id, user.id, newVote)
        } catch (error) {
            console.error(error)
            // Revert
            setPosts(posts.map(p => p.id === post.id ? { ...p, userVote: previousVote, likes: previousScore } : p))
        }
    }

    const handleDeletePost = async () => {
        if (!postToDelete) return;
        setIsDeleting(true);
        try {
            await api.deletePost(postToDelete);
            setPosts(posts.filter(p => p.id !== postToDelete));
            setActivePostMenu(null);
            setPostToDelete(null);
        } catch (error) {
            console.error('Failed to delete post:', error);
            alert('Failed to delete post');
        } finally {
            setIsDeleting(false);
        }
    }

    const handlePinPost = async (e: any, post: any) => {
        e.preventDefault();
        e.stopPropagation();

        const isCurrentlyPinned = post.isPinned || false;

        try {
            await api.pinPost(post.id, creatorId, !isCurrentlyPinned);

            // Optimistically update the UI to sort pinned posts first
            setPosts(prevPosts => {
                const updated = prevPosts.map(p => {
                    if (p.id === post.id) return { ...p, isPinned: !isCurrentlyPinned };
                    // If we're pinning this post, unpin everything else
                    if (!isCurrentlyPinned) return { ...p, isPinned: false };
                    return p;
                });

                // Sort to keep pinned first, then by date
                return updated.sort((a, b) => {
                    if (a.isPinned && !b.isPinned) return -1;
                    if (!a.isPinned && b.isPinned) return 1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
            });
            setActivePostMenu(null);
        } catch (error) {
            console.error('Failed to pin post:', error);
            alert('Failed to pin post');
        }
    }

    if (loading) {
        return (
            <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <div className="h-8 w-64 bg-muted rounded-lg mb-2"></div>
                            <div className="h-4 w-40 bg-muted rounded-lg"></div>
                        </div>
                        <div className="h-10 w-32 bg-muted rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="card-plug p-5 h-24 bg-muted/50"></div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="card-plug p-5 h-32 bg-muted/50"></div>
                            ))}
                        </div>
                        <div className="space-y-6">
                            <div className="card-plug p-5 h-48 bg-muted/50"></div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="btn-primary"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Creator Dashboard</h1>
                        {user?.username && (
                            <Link to={`/${user.username}`} className="text-sm text-muted-foreground hover:text-jence-gold transition-colors flex items-center gap-1.5 mt-1">
                                <ExternalLink size={12} />
                                View Public Profile
                            </Link>
                        )}
                    </div>
                    <button
                        onClick={() => setIsPostModalOpen(true)}
                        className="btn-primary flex items-center gap-2 active:scale-[0.97] transition-all"
                    >
                        <Plus size={18} />
                        New Post
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        label="Total Subscribers"
                        value={stats.totalSubscribers.toLocaleString()}
                        icon={Users}
                    />
                    <StatCard
                        label="Total Views"
                        value={stats.totalViews.toLocaleString()}
                        icon={Eye}
                    />
                    <StatCard
                        label="Total Posts"
                        value={stats.totalPosts.toLocaleString()}
                        icon={FileText}
                    />
                    <StatCard
                        label="Earnings"
                        value={`$${stats.totalEarnings.toLocaleString()}`}
                        icon={DollarSign}
                    />
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main: Recent Posts */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-foreground">Recent Analysis</h2>
                            <Link to="#" className="text-sm text-jence-gold hover:underline">View all</Link>
                        </div>

                        {posts.length > 0 ? (
                            <div className="space-y-4">
                                {posts.map((post) => (
                                    <div key={post.id} className="card-plug p-5 flex items-start gap-4 hover:border-jence-gold/20 transition-colors group">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${post.isPublished ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                                    }`}>
                                                    {post.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </span>
                                                {!post.isFree && !post.isPinned && (
                                                    <span className="text-xs text-jence-gold flex items-center gap-0.5">
                                                        <DollarSign size={10} /> Paid
                                                    </span>
                                                )}
                                                {post.isPinned && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-jence-gold/10 text-jence-gold flex items-center gap-1">
                                                        <Pin size={10} className="fill-current" />
                                                        Pinned
                                                    </span>
                                                )}
                                            </div>
                                            <Link to={`/post/${post.id}`} className="group-hover:text-jence-gold transition-colors">
                                                <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                                            </Link>
                                            <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setActivePostMenu(activePostMenu === post.id ? null : post.id)
                                                    }}
                                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {activePostMenu === post.id && (
                                                    <div className="absolute right-0 mt-2 w-32 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-20">
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setPostToDelete(post.id);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-muted/50 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                        <button
                                                            onClick={(e) => handlePinPost(e, post)}
                                                            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors border-t border-border/50"
                                                        >
                                                            {post.isPinned ? 'Unpin' : 'Pin to Profile'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => handleVote(e, post)}
                                                    className={`flex items-center gap-1 text-xs transition-colors ${post.userVote === 1 ? 'text-jence-gold' : 'text-muted-foreground hover:text-foreground'}`}
                                                >
                                                    <ArrowBigUp size={16} fill={post.userVote === 1 ? "currentColor" : "none"} />
                                                    <span>{post.likes || 0}</span>
                                                </button>
                                                <Link to={`/post/${post.id}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                                                    <MessageCircle size={14} />
                                                    <span>{post.comments || 0}</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="card-plug p-8 text-center border-dashed">
                                <p className="text-muted-foreground mb-4">You haven't published any analysis yet.</p>
                                <button onClick={() => setIsPostModalOpen(true)} className="btn-primary text-sm">Create your first post</button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Quick Stats/Activity */}
                    <div className="space-y-6">
                        <div className="card-plug p-5">
                            <h3 className="font-semibold text-foreground mb-4">Recent Feedback</h3>
                            {feedback.length > 0 ? (
                                <div className="space-y-4">
                                    {feedback.map((item) => (
                                        <div key={item.id} className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                                            <img
                                                src={item.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user.username}`}
                                                alt={item.user.username}
                                                className="w-8 h-8 rounded-full bg-muted object-cover flex-shrink-0"
                                            />
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span className="text-sm font-medium text-foreground">{item.user.username}</span>
                                                    <span className="text-xs text-muted-foreground">• {new Date(item.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1 mb-1.5 text-jence-gold">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={i < item.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={i >= item.rating ? "text-muted-foreground/30" : ""}>
                                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                                        </svg>
                                                    ))}
                                                </div>
                                                {item.feedback && (
                                                    <p className="text-sm text-foreground/80 italic">"{item.feedback}"</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground py-4">
                                    No reviews yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <DeleteModal
                isOpen={!!postToDelete}
                onClose={() => setPostToDelete(null)}
                onConfirm={handleDeletePost}
                isDeleting={isDeleting}
            />

            {/* Create Post Modal */}
            {isPostModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsPostModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <CreatePostForm
                            creatorId={creatorId}
                            verticalId={verticalId}
                            onClose={() => setIsPostModalOpen(false)}
                            onSuccess={() => {
                                setIsPostModalOpen(false)
                                // Refresh posts (simple window reload for now, or move fetch to function)
                                window.location.reload()
                            }}
                        />
                    </div>
                </div>
            )}
        </section>
    )
}

function CreatePostForm({ creatorId, verticalId, onClose, onSuccess }: any) {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [disclosure, setDisclosure] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [isFree, setIsFree] = useState(false)
    const [loading, setLoading] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB')
            return
        }

        setUploadingImage(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload`, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) throw new Error('Upload failed')

            const data = await response.json()
            setImageUrl(data.url)
        } catch (err: any) {
            console.error('Image upload failed:', err)
            alert('Failed to upload image. Please try again.')
        } finally {
            setUploadingImage(false)
        }
    }

    const handleSubmit = async () => {
        if (!title || !content) {
            alert('Please fill in all fields')
            return
        }
        if (!disclosure.trim()) {
            alert('Please add a conflict-of-interest disclosure.')
            return
        }
        if (!creatorId || !verticalId) {
            alert('Creator profile not loaded. Please try again.')
            return
        }

        setLoading(true)
        try {
            await api.createPost({
                title,
                content,
                disclosure,
                imageUrl: imageUrl || undefined,
                creatorId,
                verticalId,
                isFree,
                // excerpt generated by backend
            })
            onSuccess()
        } catch (e: any) {
            console.error(e)
            alert(e.message || 'Failed to create post')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-foreground mb-6">New Article</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input-field"
                        placeholder="e.g. Thermal limits in compact actuators"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Cover Image (Optional)</label>
                    {imageUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-border group bg-muted w-full h-48 sm:h-64">
                            <img src={imageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => setImageUrl('')}
                                    className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2 text-sm font-medium"
                                >
                                    <X size={16} />
                                    Remove Image
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <input
                                type="file"
                                id="cover-upload"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImage}
                                className="sr-only"
                            />
                            <label
                                htmlFor="cover-upload"
                                className={`flex flex-col items-center justify-center w-full h-32 sm:h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-jence-gold/50 hover:bg-muted/30 transition-colors ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {uploadingImage ? (
                                        <>
                                            <Loader2 size={32} className="text-jence-gold mb-3 animate-spin" />
                                            <p className="text-sm font-medium text-foreground">Uploading...</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={32} className="text-muted-foreground mb-3 group-hover:text-jence-gold transition-colors" />
                                            <p className="mb-1 text-sm text-foreground font-medium">Click to upload cover image</p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="input-field min-h-[200px]"
                        placeholder="Write your article here..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Conflict of interest disclosure</label>
                    <textarea
                        value={disclosure}
                        onChange={(e) => setDisclosure(e.target.value)}
                        className="input-field min-h-[120px]"
                        placeholder="List any sponsor ties, vendor relationships, or state 'No conflicts declared.'"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Disclosures are required on every article and shown publicly.
                    </p>
                </div>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-muted/30">
                    <input
                        type="checkbox"
                        checked={isFree}
                        onChange={(e) => setIsFree(e.target.checked)}
                        className="accent-jence-gold w-4 h-4"
                    />
                    <div>
                        <p className="text-sm font-medium text-foreground">Make this post free</p>
                        <p className="text-xs text-muted-foreground">Free posts are visible to non-subscribers and help attract new users.</p>
                    </div>
                </label>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !title || !content || !disclosure.trim()}
                        className="btn-primary disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Publish'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, trend }: { label: string, value: string, icon: any, trend?: string }) {
    return (
        <div className="card-plug p-5">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm text-muted-foreground font-medium">{label}</p>
                    <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
                </div>
                <div className="p-2 rounded-lg bg-muted/50 text-foreground">
                    <Icon size={20} />
                </div>
            </div>
            {trend && (
                <p className="text-xs text-jence-green font-medium flex items-center gap-1">
                    <TrendingUpIcon size={12} />
                    {trend}
                </p>
            )}
        </div>
    )
}

function TrendingUpIcon({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
    )
}
