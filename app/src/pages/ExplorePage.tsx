import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import SEO from '../components/SEO'
import { verticals } from '../sections/Verticals'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ExplorePage() {
    const [dbStats, setDbStats] = useState<any>(null)
    const gridRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        api.getGlobalStats().then(setDbStats).catch(console.error)
    }, [])

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const cards = gridRef.current?.querySelectorAll('.vertical-card')
            if (cards) {
                gsap.fromTo(cards,
                    { y: 40, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        stagger: 0.05,
                        scrollTrigger: {
                            trigger: gridRef.current,
                            start: 'top 90%',
                            end: 'top 50%',
                            scrub: true,
                        }
                    }
                )
            }
        }, gridRef)
        return () => ctx.revert()
    }, [])

    return (
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
            <SEO title="Explore" url="/explore" description="Browse robotics and hardware sections, from firmware and autonomy to sensors, power, and manufacturing." />
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="label-mono mb-2 block">Explore</span>
                    <h1 className="heading-lg text-foreground mb-4">
                        Browse by <span className="text-gradient-gold">section</span>
                    </h1>
                    <p className="body-lg max-w-2xl mx-auto">
                        Engineer-led reporting across embedded systems, robotics software, sensors, power, and more.
                        Find the technical depth that matters to your work.
                    </p>
                </div>

                {/* Verticals Grid */}
                <div
                    ref={gridRef}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                >
                    {verticals.map((vertical) => {
                        const Icon = vertical.icon
                        return (
                            <Link
                                key={vertical.id}
                                to={`/verticals/${vertical.slug}`}
                                className="vertical-card group card-plug p-5 sm:p-6"
                            >
                                <div
                                    className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: `${vertical.color}15`, color: vertical.color }}
                                >
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground group-hover:text-jence-gold transition-colors mb-2">
                                        {vertical.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3 min-h-[60px]">
                                        {vertical.description}
                                    </p>
                                    <span className="text-xs font-mono font-medium text-jence-gold/80 bg-jence-gold/10 px-2 py-1 rounded-sm">
                                        {7 + (dbStats?.creatorsByVertical?.[vertical.slug] || 0)} content creators
                                    </span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
