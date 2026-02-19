import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Users, FileText, DollarSign,
    Plus, Clock, MoreVertical, Loader2, Eye, Shield, ArrowBigUp, MessageCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function CreatorDashboardPage() {
    const { user } = useAuth()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user?.id) return

        const fetchDashboardData = async () => {
            if (user.username) {
                try {
                    setError(null)
                    const profileRes = await api.getCreatorByUsername(user.username)
                    if (!profileRes?.creator?.id) {
                        throw new Error('Creator profile not found')
                    }
                    const cId = profileRes.creator.id
                    setCreatorId(cId)
                    setVerticalId(profileRes.creator.verticalId)
                    setKycStatus(profileRes.creator.kycStatus)

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-jence-gold" />
            </div>
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
                        <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>

                        {/* KYC Banner */}
                        {kycStatus !== 'verified' && (
                            <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 rounded-full bg-yellow-500/20 text-yellow-500">
                                    <Shield size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-yellow-500">Complete Identity Verification</p>
                                    <p className="text-xs text-muted-foreground">You must verify your identity to enable payouts and get the verified badge.</p>
                                </div>
                                <Link to="/settings" className="text-sm font-bold text-yellow-500 hover:text-yellow-400 underline underline-offset-4">
                                    Complete KYC
                                </Link>
                            </div>
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
                        trend="+12% this month"
                    />
                    <StatCard
                        label="Total Views"
                        value={stats.totalViews.toLocaleString()}
                        icon={Eye}
                        trend="+5% this month"
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
                        trend="+$0.00 this month"
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
                                                {!post.isFree && (
                                                    <span className="text-xs text-jence-gold flex items-center gap-0.5">
                                                        <DollarSign size={10} /> Paid
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => handleVote(e, post)}
                                                    className={`flex items-center gap-1 text-xs transition-colors ${post.userVote === 1 ? 'text-jence-gold' : 'text-muted-foreground hover:text-foreground'}`}
                                                >
                                                    <ArrowBigUp size={16} fill={post.userVote === 1 ? "currentColor" : "none"} />
                                                    <span>{post.likes || 0}</span>
                                                </button>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <MessageCircle size={14} />
                                                    <span>{post.comments || 0}</span>
                                                </div>
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
                            <h3 className="font-semibold text-foreground mb-4">Recent Subscribers</h3>
                            <div className="text-sm text-muted-foreground text-center py-4">
                                No new subscribers yet.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            {isPostModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsPostModalOpen(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                        >
                            <MoreVertical className="rotate-90" /> {/* Should be X icon, using MoreVertical rotated for now or import X */}
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
    const [isFree, setIsFree] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!title || !content) {
            alert('Please fill in all fields')
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
            <h2 className="text-xl font-bold text-foreground mb-6">New Analysis</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input-field"
                        placeholder="e.g. Market Outlook for Q3"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="input-field min-h-[200px]"
                        placeholder="Write your analysis here..."
                    />
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
                        disabled={loading || !title || !content}
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
