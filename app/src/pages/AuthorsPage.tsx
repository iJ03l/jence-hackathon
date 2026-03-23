import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import SEO from '../components/SEO'
import { gsap } from 'gsap'
import { Search, Loader2, CheckCircle2, User, FileText, ArrowUpDown } from 'lucide-react'

export default function AuthorsPage() {
    const [creators, setCreators] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<'posts' | 'newest' | 'az'>('posts')
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        api.getCreators()
            .then(setCreators)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    useLayoutEffect(() => {
        if (loading) return
        const ctx = gsap.context(() => {
            gsap.fromTo('.authors-header',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
            )
            const cards = containerRef.current?.querySelectorAll('.author-card')
            if (cards && cards.length > 0) {
                gsap.fromTo(cards,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
                )
            }
        }, containerRef)
        return () => ctx.revert()
    }, [loading, creators])

    const filteredAndSortedCreators = useMemo(() => {
        let result = creators

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(c => 
                (c.pseudonym || '').toLowerCase().includes(query) ||
                (c.username || '').toLowerCase().includes(query) ||
                (c.bio || '').toLowerCase().includes(query) ||
                (c.verticalName || '').toLowerCase().includes(query)
            )
        }

        result = [...result].sort((a, b) => {
            if (sortBy === 'posts') {
                return (b.postCount || 0) - (a.postCount || 0)
            }
            if (sortBy === 'newest') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }
            if (sortBy === 'az') {
                const nameA = (a.pseudonym || a.username || '').toLowerCase()
                const nameB = (b.pseudonym || b.username || '').toLowerCase()
                return nameA.localeCompare(nameB)
            }
            return 0
        })

        return result
    }, [creators, searchQuery, sortBy])

    return (
        <div className="min-h-screen bg-background pt-24 pb-20" ref={containerRef}>
            <SEO title="Authors | Jence" description="Discover and follow the top robotics and hardware engineering authors on Jence." />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="authors-header mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
                        All <span className="text-jence-gold">Authors</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Explore the engineers, researchers, and creators publishing deep-dive technical content across the hardware stack.
                    </p>

                    {/* Filters */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative w-full sm:max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, expertise, or bio..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-jence-gold/50 focus:border-jence-gold transition-all"
                            />
                        </div>
                        
                        <div className="flex bg-muted/30 border border-border/50 p-1 rounded-xl w-full sm:w-auto">
                            <button
                                onClick={() => setSortBy('posts')}
                                className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${sortBy === 'posts' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Most Active
                            </button>
                            <button
                                onClick={() => setSortBy('newest')}
                                className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${sortBy === 'newest' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Newest
                            </button>
                            <button
                                onClick={() => setSortBy('az')}
                                className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${sortBy === 'az' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                A-Z <ArrowUpDown size={12} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <Loader2 className="animate-spin text-jence-gold" size={40} />
                    </div>
                ) : filteredAndSortedCreators.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAndSortedCreators.map((creator) => (
                            <Link
                                key={creator.id}
                                to={`/${creator.username || creator.pseudonym}`}
                                className="author-card group block p-5 rounded-2xl border border-border/40 bg-card hover:bg-muted/10 hover:border-jence-gold/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-muted/50 border border-border/50 group-hover:border-jence-gold/50 transition-colors">
                                        {creator.image ? (
                                            <img src={creator.image} alt={creator.pseudonym} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-jence-gold/20 to-jence-gold/5 text-jence-gold">
                                                <User size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-foreground truncate group-hover:text-jence-gold transition-colors flex items-center gap-1.5">
                                            {creator.pseudonym || creator.username}
                                            {creator.isOg && <div className="w-1.5 h-1.5 rounded-full bg-jence-green inline-block ml-0.5 shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="OG Status" />}
                                            {creator.kycStatus === 'verified' && <CheckCircle2 size={14} className="text-blue-500 shrink-0" />}
                                        </h3>
                                        {creator.verticalName && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-muted/50 border border-border/50 rounded text-[10px] uppercase font-mono text-muted-foreground truncate max-w-full">
                                                {creator.verticalName}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10 font-light leading-relaxed">
                                    {creator.bio || 'Hardware engineer on Jence.'}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs font-mono text-muted-foreground">
                                    <div className="flex items-center gap-1.5 group-hover:text-foreground transition-colors">
                                        <FileText size={14} />
                                        {creator.postCount || 0} Posts
                                    </div>
                                    <div className="text-jence-gold opacity-0 group-hover:opacity-100 transition-opacity tracking-wider uppercase text-[10px]">
                                        View Profile
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 border-2 border-dashed border-border/50 rounded-2xl bg-muted/20">
                        <User className="mx-auto text-muted-foreground/30 mb-4" size={48} />
                        <h3 className="text-xl font-medium text-foreground mb-2">No authors found</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            We couldn't find any creators matching your search criteria. Try using different keywords.
                        </p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="mt-6 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-jence-gold transition-colors"
                        >
                            Clear search
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
