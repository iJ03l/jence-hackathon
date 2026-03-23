import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Users, Rocket, Star } from 'lucide-react'
import { api } from '../lib/api'
import ContentHero from '../sections/ContentHero'
import Verticals from '../sections/Verticals'
import ForumPreview from '../sections/ForumPreview'
import SEO from '../components/SEO'
import LaunchPreviewCard from '../components/LaunchPreviewCard'

export default function LandingPage() {
    const [latestPosts, setLatestPosts] = useState<any[]>([])
    const [launches, setLaunches] = useState<any[]>([])
    const [creators, setCreators] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const getLaunchStackClass = (index: number) => {
        if (index % 3 === 1) return 'w-full sm:max-w-[88%] sm:self-end'
        if (index % 3 === 2) return 'w-full sm:max-w-[94%] sm:ml-4 lg:ml-10'
        return 'w-full sm:max-w-[92%]'
    }

    useEffect(() => {
        Promise.allSettled([
            api.getLatestPosts(),
            api.getLaunches(),
            api.getTopCreators(),
        ]).then(([postsRes, launchesRes, creatorsRes]) => {
            if (postsRes.status === 'fulfilled') setLatestPosts(postsRes.value.slice(0, 6))
            if (launchesRes.status === 'fulfilled') setLaunches(launchesRes.value.slice(0, 5))
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
                <div className="max-w-[52rem] mx-auto">
                    <div className="flex items-center justify-between mb-6">
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
                                <div key={i} className="card-plug p-4 animate-pulse min-h-[180px]">
                                    <div className="h-4 bg-muted rounded w-20 mb-3" />
                                    <div className="h-5 bg-muted rounded w-4/5 mb-2" />
                                    <div className="h-3 bg-muted rounded w-full mb-1" />
                                    <div className="h-3 bg-muted rounded w-3/5" />
                                </div>
                            ))}
                        </div>
                    ) : latestPosts.length > 0 ? (
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                {latestPosts.map((post, index) => {
                                    const isFeaturePost = index === 0;

                                    return (
                                        <Link
                                            key={post.id}
                                            to={`/post/${post.id}`}
                                            className={`group relative overflow-hidden transition-all duration-500 rounded-xl border border-border/40 bg-card/20 backdrop-blur-sm hover:bg-card/40 hover:border-jence-gold/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.05)] flex flex-col ${
                                                isFeaturePost
                                                    ? 'md:col-span-12 lg:col-span-8'
                                                    : 'md:col-span-6 lg:col-span-4'
                                            }`}
                                        >
                                            <div className="relative z-10 flex flex-col h-full p-4 sm:p-5">
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    {post.verticalName && (
                                                        <span className="px-2 py-0.5 rounded-full border border-jence-gold/20 bg-jence-gold/5 text-jence-gold text-[9px] font-semibold uppercase tracking-widest backdrop-blur-md">
                                                            {post.verticalName}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className={`font-medium text-foreground transition-colors group-hover:text-jence-gold mb-3 ${
                                                    isFeaturePost 
                                                        ? 'text-xl sm:text-2xl lg:text-[2rem] leading-[1.15] tracking-tight' 
                                                        : 'text-lg leading-snug tracking-tight line-clamp-2'
                                                }`}>
                                                    {post.title}
                                                </h3>

                                                <p className={`text-muted-foreground/80 font-light ${
                                                    isFeaturePost 
                                                        ? 'text-sm sm:text-base line-clamp-2 sm:line-clamp-3 max-w-xl mb-5' 
                                                        : 'text-xs line-clamp-2 mb-4'
                                                }`}>
                                                    {post.excerpt || ''}
                                                </p>

                                                <div className="flex items-center gap-2.5 pt-3 border-t border-border/30">
                                                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-foreground">
                                                        {(post.creatorPseudonym || 'A')[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-semibold text-foreground/90 leading-none mb-1">
                                                            {post.creatorPseudonym || 'Jence Author'}
                                                        </span>
                                                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                                            {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 overflow-hidden rounded-xl border border-border/40 bg-muted/20 aspect-[3/1]">
                                                    {post.imageUrl ? (
                                                        <img
                                                            src={post.imageUrl}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                                                    )}
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
                        <div className="flex flex-col gap-4">
                            {launches.map((launch, index) => (
                                <LaunchPreviewCard
                                    key={launch.id}
                                    launch={launch}
                                    to={`/launches/${launch.id}`}
                                    authorTo={launch.authorPseudonym || launch.authorUsername ? `/${launch.authorPseudonym || launch.authorUsername}` : undefined}
                                    className={getLaunchStackClass(index)}
                                />
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
                            to="/authors"
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
                                    {creator.image ? (
                                        <img 
                                            src={creator.image} 
                                            alt={creator.pseudonym || creator.username} 
                                            className="w-12 h-12 rounded-full object-cover mx-auto mb-2 border border-border group-hover:scale-110 transition-transform" 
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-jence-gold/20 to-jence-gold/5 flex items-center justify-center mx-auto mb-2 text-jence-gold font-bold group-hover:scale-110 transition-transform">
                                            {(creator.pseudonym || creator.username || '?')[0].toUpperCase()}
                                        </div>
                                    )}
                                    <p className="text-sm font-medium text-foreground truncate group-hover:text-jence-gold transition-colors">
                                        {creator.pseudonym || creator.username}
                                    </p>
                                    {creator.verticalName && (
                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                            {creator.verticalName}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        {creator.rating ? (
                                            <div className="flex items-center gap-1">
                                                <Star size={10} className="text-jence-gold" />
                                                <span className="text-[10px] text-muted-foreground">{creator.rating}</span>
                                            </div>
                                        ) : null}
                                        {creator.postCount > 0 && (
                                            <span className="text-[10px] text-muted-foreground">
                                                {creator.postCount} {creator.postCount === 1 ? 'post' : 'posts'}
                                            </span>
                                        )}
                                    </div>
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
