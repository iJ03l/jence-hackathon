import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import SEO from '../components/SEO'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
    Cpu, Bot, Shield, Settings, Plane,
    Activity, Eye, BatteryCharging, Wrench, FlaskConical,
    FileText, Loader2, ArrowRight, BookOpen
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const iconMap: Record<string, any> = {
    Cpu, Bot, Shield, Settings, Plane,
    Activity, Eye, BatteryCharging, Wrench, FlaskConical,
}

export default function ExplorePage() {
    const [verticals, setVerticals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [dbStats, setDbStats] = useState<any>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        Promise.all([
            api.getGlobalStats().then(setDbStats),
            api.getVerticals().then(setVerticals)
        ]).catch(console.error).finally(() => setLoading(false))
    }, [])

    useLayoutEffect(() => {
        if (loading) return
        const ctx = gsap.context(() => {
            gsap.fromTo('.explore-header',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
            )
            gsap.fromTo('.explore-featured',
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 0.8, delay: 0.2, ease: 'power2.out' }
            )
            const listItems = containerRef.current?.querySelectorAll('.explore-list-item')
            if (listItems && listItems.length > 0) {
                gsap.fromTo(listItems,
                    { y: 20, opacity: 0 },
                    {
                        y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out',
                        scrollTrigger: { trigger: '.explore-list-container', start: 'top 80%' }
                    }
                )
            }
        }, containerRef)
        return () => ctx.revert()
    }, [loading, verticals.length])

    const featuredVertical = verticals[0]
    const remainingVerticals = verticals.slice(1)

    return (
        <section className="pt-24 pb-24 px-4 sm:px-6 lg:px-8 bg-background min-h-screen" ref={containerRef}>
            <SEO title="Explore Directory" url="/explore" description="The definitive directory of robotics and hardware engineering sections." />
            
            <div className="max-w-7xl mx-auto">
                
                {/* Header Phase */}
                <div className="explore-header max-w-3xl mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-jence-gold/10 border border-jence-gold/20 text-jence-gold text-xs font-mono mb-6">
                        <BookOpen size={14} /> Jence Directory
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight leading-none">
                        Mapping the <br/>
                        <span className="text-muted-foreground">hardware stack.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                        Engineer-led reporting across embedded systems, robotics software, sensors, power, and manufacturing. Find the technical depth that matters to your work.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="animate-spin text-jence-gold" size={48} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Featured Vertical (Left Column) */}
                        <div className="lg:col-span-5 explore-featured">
                            {featuredVertical && (() => {
                                const Icon = iconMap[featuredVertical.iconName] || FileText
                                const articleCount = 12 + (dbStats?.articlesByVertical?.[featuredVertical.slug] || 0)
                                return (
                                    <div className="sticky top-24 group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-br from-jence-gold/50 to-transparent rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                                        <Link 
                                            to={`/verticals/${featuredVertical.slug}`}
                                            className="relative flex flex-col h-full bg-card/60 dark:bg-[#0A0A0A]/80 border border-border/50 dark:border-white/5 rounded-[2rem] p-8 md:p-12 overflow-hidden hover:border-jence-gold/40 dark:hover:border-jence-gold/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-jence-gold/10 backdrop-blur-xl group/featured"
                                        >
                                            {/* Top Subtle Glow */}
                                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-jence-gold/0 group-hover/featured:via-jence-gold/40 to-transparent transition-all duration-700" />

                                            <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover/featured:scale-110 group-hover/featured:rotate-12 transition-transform duration-700 pointer-events-none text-foreground dark:text-white">
                                                <Icon size={240} color={featuredVertical.color} />
                                            </div>

                                            <div className="flex items-center justify-between mb-12">
                                                <div 
                                                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md bg-muted/60 dark:bg-white/5 border border-border/50 dark:border-white/10 group-hover/featured:scale-110 group-hover/featured:-rotate-3 transition-transform duration-500"
                                                    style={{ color: featuredVertical.color }}
                                                >
                                                    <Icon size={32} />
                                                </div>
                                                <span className="px-3 py-1 bg-muted/50 dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-full text-[11px] uppercase tracking-widest font-mono text-muted-foreground/80 dark:text-muted-foreground/90">
                                                    Featured
                                                </span>
                                            </div>

                                            <div className="mt-auto relative z-10">
                                                <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4 group-hover/featured:text-jence-gold transition-colors">
                                                    {featuredVertical.name}
                                                </h2>
                                                <p className="text-muted-foreground/90 dark:text-white/70 text-lg mb-8 leading-relaxed font-light">
                                                    {featuredVertical.description}
                                                </p>
                                                
                                                {/* Tags */}
                                                {(featuredVertical.tags && featuredVertical.tags.length > 0) && (
                                                    <div className="flex flex-wrap gap-2 mb-8">
                                                        {featuredVertical.tags.map((tag: string) => (
                                                            <span key={tag} className="px-2.5 py-1 text-[11px] uppercase tracking-wider font-mono text-muted-foreground/80 dark:text-white/60 bg-muted/40 dark:bg-white/5 rounded-md border border-border/50 dark:border-white/5">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between border-t border-border/50 dark:border-white/5 pt-6 group-hover/featured:border-border dark:group-hover/featured:border-white/10 transition-colors">
                                                    <div className="flex items-center gap-2 text-muted-foreground/80 dark:text-white/50 text-[13px] uppercase tracking-widest font-mono">
                                                        <FileText size={16} />
                                                        {articleCount} articles
                                                    </div>
                                                    <div className="w-10 h-10 rounded-full bg-muted/50 dark:bg-white/5 flex items-center justify-center group-hover/featured:bg-jence-gold group-hover/featured:text-black transition-colors text-foreground dark:text-white shadow-sm">
                                                        <ArrowRight size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                )
                            })()}
                        </div>

                        {/* List View (Right Column) */}
                        <div className="lg:col-span-7 explore-list-container">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {remainingVerticals.map((vertical) => {
                                    const Icon = iconMap[vertical.iconName] || FileText
                                    const articleCount = 12 + (dbStats?.articlesByVertical?.[vertical.slug] || 0)
                                    return (
                                        <Link
                                            key={vertical.id}
                                            to={`/verticals/${vertical.slug}`}
                                            className="explore-list-item group relative flex flex-col p-6 sm:p-7 rounded-2xl bg-card/40 dark:bg-white/[0.02] border border-border/40 dark:border-white/5 hover:bg-card/80 dark:hover:bg-white/[0.04] hover:border-jence-gold/30 dark:hover:border-white/10 transition-all duration-500 min-h-[220px] shadow-sm hover:shadow-xl hover:shadow-jence-gold/5 hover:-translate-y-1 overflow-hidden"
                                        >
                                            {/* Subdued Premium Glow */}
                                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-jence-gold/0 group-hover:via-jence-gold/20 to-transparent transition-all duration-700" />
                                            
                                            <div className="relative z-10 flex items-start justify-between mb-5">
                                                <div 
                                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center bg-muted/60 dark:bg-white/5 border border-border/40 dark:border-transparent group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner"
                                                    style={{ color: vertical.color || '#D4AF37' }}
                                                >
                                                    <Icon size={24} strokeWidth={1.5} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground/60 group-hover:text-jence-gold/80 transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                                                    <FileText size={12} /> {articleCount} published
                                                </span>
                                            </div>
                                            
                                            <div className="mt-auto relative z-10">
                                                <h3 className="text-lg font-medium tracking-tight text-foreground mb-2 group-hover:text-jence-gold transition-colors">
                                                    {vertical.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground/90 font-light line-clamp-2 mb-5">
                                                    {vertical.description}
                                                </p>
                                                
                                                {/* Smaller Tags for list items */}
                                                {(vertical.tags && vertical.tags.length > 0) && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {vertical.tags.map((tag: string) => (
                                                            <span key={tag} className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono text-muted-foreground/70 bg-muted/30 border border-border/40 rounded">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>

                            {/* Call to action at bottom of list */}
                            <div className="explore-list-item mt-8 p-8 sm:p-10 rounded-2xl border border-dashed border-border/60 bg-muted/30 dark:bg-white/[0.02] flex flex-col items-center justify-center text-center transition-colors hover:bg-muted/50 dark:hover:bg-white/[0.04]">
                                <h4 className="text-xl font-medium tracking-tight text-foreground mb-3">Don't see your domain?</h4>
                                <p className="text-sm sm:text-base text-muted-foreground/90 font-light mb-6 max-w-md leading-relaxed">
                                    We're always expanding our coverage. Let us know what technical areas you want to read or write about.
                                </p>
                                <a href="mailto:hello@jence.xyz" className="px-6 py-2.5 rounded-full bg-foreground text-background font-medium text-sm hover:bg-jence-gold hover:text-black transition-colors shadow-sm">
                                    Contact Editorial
                                </a>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </section>
    )
}
