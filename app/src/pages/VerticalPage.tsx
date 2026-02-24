import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    Landmark, Shield, Trophy, Bitcoin, Building2,
    Briefcase, Store, Palette, Wheat, Fuel,
    AlertTriangle, Clock, FileText
} from 'lucide-react'
import { api } from '../lib/api'
import SEO from '../components/SEO'

const iconMap: Record<string, any> = {
    Landmark, Shield, Trophy, Bitcoin, Building2,
    Briefcase, Store, Palette, Wheat, Fuel,
}

export default function VerticalPage() {
    const { slug } = useParams<{ slug: string }>()
    const [data, setData] = useState<{ vertical: any; posts: any[] } | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!slug) return
        setLoading(true)
        api.getVertical(slug)
            .then(setData)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [slug])

    if (loading) {
        return (
            <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
                        <div className="h-4 bg-muted rounded w-2/3 mb-8" />
                        <div className="h-20 bg-muted rounded mb-6" />
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-24 bg-muted rounded" />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (error || !data) {
        return (
            <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Vertical not found</h1>
                    <Link to="/explore" className="text-jence-gold hover:underline">
                        ← Back to explore
                    </Link>
                </div>
            </section>
        )
    }

    const { vertical, posts } = data
    const Icon = iconMap[vertical.iconName] || FileText

    return (
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
            <SEO
                title={`${vertical.name} — Expert Analysis`}
                url={`/verticals/${slug}`}
                description={vertical.description || `Browse expert analysis in ${vertical.name}. Anonymous insider insights from verified industry experts on Jence.`}
            />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${vertical.color}15`, color: vertical.color }}
                    >
                        <Icon size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{vertical.name}</h1>
                        <p className="text-muted-foreground mt-1">{vertical.description}</p>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-8">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{vertical.disclaimer}</p>
                    </div>
                </div>

                {/* Posts */}
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText size={18} />
                    Recent posts
                </h2>

                {posts.length > 0 ? (
                    <div className="space-y-4">
                        {posts.map((post: any) => (
                            <article key={post.id} className="card-plug p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Link
                                        to={`/${post.creatorUsername || '#'}`}
                                        className="flex items-center gap-2 group"
                                    >
                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 group-hover:opacity-80 transition-opacity">
                                            {post.creatorImage ? (
                                                <img src={post.creatorImage} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] font-bold text-muted-foreground">{post.creatorPseudonym?.[0] || '?'}</span>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-jence-gold group-hover:underline">
                                            {post.creatorPseudonym}
                                        </span>
                                    </Link>
                                    <span className="text-xs text-muted-foreground">·</span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">{post.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {(post.excerpt || post.content || '').length > 258
                                        ? `${(post.excerpt || post.content || '').substring(0, 258)}...`
                                        : (post.excerpt || post.content || '')}
                                </p>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="card-plug p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                            <FileText size={28} className="text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">No posts yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Be the first to publish expert analysis in this vertical.
                        </p>
                    </div>
                )}
            </div>
        </section>
    )
}
