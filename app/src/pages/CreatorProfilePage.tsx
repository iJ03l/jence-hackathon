import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, Users, FileText, AlertTriangle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function CreatorProfilePage() {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuth()
    const [data, setData] = useState<{ creator: any; posts: any[] } | null>(null)
    const [loading, setLoading] = useState(true)
    const [subscribing, setSubscribing] = useState(false)
    const [subscribed, setSubscribed] = useState(false)

    useEffect(() => {
        if (!id) return
        api.getCreator(id)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [id])

    const handleSubscribe = async () => {
        if (!user?.id || !id) return
        setSubscribing(true)
        try {
            await api.subscribe(user.id, id)
            setSubscribed(true)
        } catch {
            setSubscribed(true)
        } finally {
            setSubscribing(false)
        }
    }

    if (loading) {
        return (
            <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="max-w-3xl mx-auto">
                    <div className="card-plug p-6 mb-6">
                        <div className="animate-pulse flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-muted" />
                            <div className="flex-1">
                                <div className="h-6 bg-muted rounded w-48 mb-2" />
                                <div className="h-4 bg-muted rounded w-32 mb-2" />
                                <div className="h-3 bg-muted rounded w-56" />
                            </div>
                            <div className="h-10 bg-muted rounded w-28" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card-plug p-5 animate-pulse">
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
            <div className="max-w-3xl mx-auto">
                {/* Profile Header */}
                <div className="card-plug p-6 mb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-jence-gold/30 to-jence-gold/5 flex items-center justify-center text-2xl font-bold text-jence-gold">
                                {creator.pseudonym?.[0] || '?'}
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
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
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

                        {user && !subscribed ? (
                            <button
                                onClick={handleSubscribe}
                                disabled={subscribing}
                                className="btn-primary text-sm disabled:opacity-60 active:scale-[0.97] transition-all"
                            >
                                {subscribing ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Subscribing...
                                    </>
                                ) : (
                                    'Subscribe'
                                )}
                            </button>
                        ) : subscribed ? (
                            <span className="px-4 py-2 rounded-lg bg-jence-green/10 text-jence-green text-sm font-medium">
                                ✓ Subscribed
                            </span>
                        ) : (
                            <Link to="/login" className="btn-primary text-sm active:scale-[0.97] transition-all">
                                Sign in to subscribe
                            </Link>
                        )}
                    </div>

                    {creator.bio && (
                        <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                            {creator.bio}
                        </p>
                    )}
                </div>

                {/* KYC Badge */}
                {creator.kycStatus === 'verified' && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-jence-green/10 border border-jence-green/20 mb-6 text-sm">
                        <span className="text-jence-green">✓</span>
                        <span className="text-muted-foreground">Identity verified via KYC</span>
                    </div>
                )}

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
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">{post.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {post.excerpt || post.content?.substring(0, 200)}
                                </p>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="card-plug p-8 text-center">
                        <p className="text-muted-foreground">No posts published yet.</p>
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
        </section>
    )
}
