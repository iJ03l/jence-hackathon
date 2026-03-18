import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Users, Rocket, Star } from 'lucide-react'
import { api } from '../lib/api'
import ContentHero from '../sections/ContentHero'
import Verticals from '../sections/Verticals'
import ForumPreview from '../sections/ForumPreview'
import SEO from '../components/SEO'

export default function LandingPage() {
    const [latestPosts, setLatestPosts] = useState<any[]>([])
    const [launches, setLaunches] = useState<any[]>([])
    const [creators, setCreators] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.allSettled([
            api.getLatestPosts(),
            api.getLaunches(),
            api.getTopCreators(),
        ]).then(([postsRes, launchesRes, creatorsRes]) => {
            if (postsRes.status === 'fulfilled') setLatestPosts(postsRes.value.slice(0, 6))
            if (launchesRes.status === 'fulfilled') setLaunches(launchesRes.value.slice(0, 3))
            if (creatorsRes.status === 'fulfilled') setCreators(creatorsRes.value.slice(0, 6))
        }).finally(() => setLoading(false))
    }, [])

    return (
        <>
            <SEO
                title="Jence — Robotics & Hardware Engineering"
                description="Deep technical articles, hardware teardowns, and developer community from credited engineers."
                url="/"
            />
            <ContentHero />

            {/* ─── Latest Articles ─── */}
            <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <span className="label-mono mb-1.5 block">Latest</span>
                            <h2 className="heading-md text-foreground">
                                Recent <span className="text-jence-gold">articles</span>
                            </h2>
                        </div>
                        <Link
                            to="/explore"
                            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-jence-gold transition-colors"
                        >
                            View all
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="card-plug p-5 animate-pulse min-h-[250px]">
                                    <div className="h-4 bg-muted rounded w-20 mb-3" />
                                    <div className="h-5 bg-muted rounded w-4/5 mb-2" />
                                    <div className="h-3 bg-muted rounded w-full mb-1" />
                                    <div className="h-3 bg-muted rounded w-3/5" />
                                </div>
                            ))}
                        </div>
                    ) : latestPosts.length > 0 ? (
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {latestPosts.map((post, index) => {
                                    const isFeaturePost = index === 0;

                                    return (
                                        <Link
                                            key={post.id}
                                            to={`/post/${post.id}`}
                                            className={`group relative overflow-hidden transition-all duration-500 rounded-2xl border border-border/40 bg-card/20 backdrop-blur-sm hover:bg-card/40 hover:border-jence-gold/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.05)] flex flex-col ${
                                                isFeaturePost
                                                    ? 'md:col-span-12 lg:col-span-8 min-h-[380px] md:min-h-[460px]'
                                                    : 'md:col-span-6 lg:col-span-4 min-h-[320px]'
                                            }`}
                                        >
                                            {post.imageUrl && (
                                                <div className="absolute inset-0 z-0 overflow-hidden">
                                                    <img
                                                        src={post.imageUrl}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
                                                    />
                                                    <div className={`absolute inset-0 bg-gradient-to-t ${
                                                        isFeaturePost 
                                                            ? 'from-background via-background/70 to-transparent' 
                                                            : 'from-background via-background/90 to-transparent'
                                                    }`} />
                                                    {/* Premium lighting accent */}
                                                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-jence-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                                </div>
                                            )}

                                            {/* Fallback pattern if no image */}
                                            {!post.imageUrl && (
                                                 <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                                            )}

                                            <div className="relative z-10 flex flex-col h-full p-6 sm:p-8 justify-end">
                                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                                    {post.verticalName && (
                                                        <span className="px-2.5 py-1 rounded-full border border-jence-gold/20 bg-jence-gold/5 text-jence-gold text-[10px] font-semibold uppercase tracking-widest backdrop-blur-md">
                                                            {post.verticalName}
                                                        </span>
                                                    )}
                                                    {post.isFree && !post.imageUrl && (
                                                        <span className="px-2.5 py-1 rounded-full border border-jence-green/20 bg-jence-green/5 text-jence-green text-[10px] font-semibold uppercase tracking-widest">
                                                            Free Edition
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className={`font-medium text-foreground transition-colors group-hover:text-jence-gold mb-3 ${
                                                    isFeaturePost 
                                                        ? 'text-2xl sm:text-3xl lg:text-4xl leading-[1.15] tracking-tight' 
                                                        : 'text-xl leading-snug tracking-tight line-clamp-2'
                                                }`}>
                                                    {post.title}
                                                </h3>

                                                <p className={`text-muted-foreground/80 font-light ${
                                                    isFeaturePost 
                                                        ? 'text-base sm:text-lg line-clamp-2 sm:line-clamp-3 max-w-2xl mb-6' 
                                                        : 'text-sm line-clamp-2 mb-5'
                                                }`}>
                                                    {post.excerpt || ''}
                                                </p>

                                                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/30">
                                                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">
                                                        {(post.creatorPseudonym || 'A')[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-semibold text-foreground/90 leading-none mb-1">
                                                            {post.creatorPseudonym || 'Jence Author'}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                                            {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="card-plug p-10 text-center">
                            <BookOpen size={24} className="text-jence-gold mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No articles published yet. Check back soon.</p>
                        </div>
                    )}

                    <Link
                        to="/explore"
                        className="sm:hidden flex items-center justify-center gap-1.5 mt-4 text-sm text-jence-gold active:scale-[0.97]"
                    >
                        View all articles
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </section>

            <Verticals />

            {/* ─── Launch Notes ─── */}
            <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 bg-muted/20">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <span className="label-mono mb-1.5 block">Launch Notes</span>
                            <h2 className="heading-md text-foreground">
                                Product <span className="text-jence-gold">launches</span>
                            </h2>
                        </div>
                        <Link
                            to="/launches"
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-jence-gold transition-colors"
                        >
                            See all
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="card-plug p-5 animate-pulse">
                                    <div className="h-4 bg-muted rounded w-36 mb-2" />
                                    <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                                    <div className="h-3 bg-muted rounded w-full" />
                                </div>
                            ))}
                        </div>
                    ) : launches.length > 0 ? (
                        <div className="space-y-3">
                            {launches.map(launch => (
                                <div key={launch.id} className="card-plug p-5 hover:border-jence-gold/20 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Rocket size={14} className="text-jence-gold shrink-0" />
                                                <span className="text-xs text-muted-foreground">{launch.company}</span>
                                                <span className="text-xs text-muted-foreground">·</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(launch.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-foreground text-sm mb-1">
                                                {launch.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {launch.summary}
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-jence-green/10 text-jence-green text-[10px] shrink-0">
                                            ✓ Approved
                                        </span>
                                    </div>
                                    {launch.tags && launch.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {launch.tags.map((t: string) => (
                                                <span
                                                    key={t}
                                                    className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card-plug p-10 text-center">
                            <Rocket size={24} className="text-jence-gold mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground mb-3">No launches yet. Be the first.</p>
                            <Link to="/launches" className="btn-primary text-sm inline-flex">
                                Submit a launch
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ─── Top Creators ─── */}
            <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <span className="label-mono mb-1.5 block">Creators</span>
                            <h2 className="heading-md text-foreground">
                                Top <span className="text-jence-gold">authors</span>
                            </h2>
                        </div>
                        <Link
                            to="/explore"
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-jence-gold transition-colors"
                        >
                            Explore all
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="card-plug p-4 animate-pulse text-center">
                                    <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-2" />
                                    <div className="h-3 bg-muted rounded w-16 mx-auto mb-1" />
                                    <div className="h-2 bg-muted rounded w-12 mx-auto" />
                                </div>
                            ))}
                        </div>
                    ) : creators.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {creators.map((creator: any) => (
                                <Link
                                    key={creator.id}
                                    to={`/${creator.pseudonym || creator.username || '#'}`}
                                    className="card-plug p-4 text-center group hover:border-jence-gold/30 transition-all"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-jence-gold/20 to-jence-gold/5 flex items-center justify-center mx-auto mb-2 text-jence-gold font-bold group-hover:scale-110 transition-transform">
                                        {(creator.pseudonym || creator.name || '?')[0].toUpperCase()}
                                    </div>
                                    <p className="text-sm font-medium text-foreground truncate group-hover:text-jence-gold transition-colors">
                                        {creator.pseudonym || creator.name}
                                    </p>
                                    {creator.vertical && (
                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                            {creator.vertical}
                                        </p>
                                    )}
                                    {creator.rating && (
                                        <div className="flex items-center justify-center gap-1 mt-1">
                                            <Star size={10} className="text-jence-gold" />
                                            <span className="text-[10px] text-muted-foreground">{creator.rating}</span>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="card-plug p-10 text-center">
                            <Users size={24} className="text-jence-gold mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">Creators coming soon.</p>
                        </div>
                    )}
                </div>
            </section>

            <ForumPreview />
        </>
    )
}
