import { useRef, useLayoutEffect, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Cpu, Bot, Shield, Settings, Plane,
  Activity, Eye, BatteryCharging, Wrench, FlaskConical,
  FileText, Loader2
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const iconMap: Record<string, any> = {
    Cpu, Bot, Shield, Settings, Plane,
    Activity, Eye, BatteryCharging, Wrench, FlaskConical,
}

export default function Verticals() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  
  const [verticals, setVerticals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dbStats, setDbStats] = useState<any>(null)

  useEffect(() => {
    // Fetch stats and verticals in parallel
    Promise.all([
      api.getGlobalStats().then(setDbStats),
      api.getVerticals().then(setVerticals)
    ]).catch(console.error).finally(() => setLoading(false))
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Title Animation
      gsap.fromTo(titleRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: true,
          }
        }
      )

      // Auto-Scrolling Carousel Animation
      if (gridRef.current && verticals.length > 0) {
        // Calculate total width to scroll based on 50% since we duplicate the array
        gsap.to(gridRef.current, {
          xPercent: -50,
          ease: 'none',
          duration: verticals.length * 3, // Adjust duration based on item count for consistent speed
          repeat: -1,
        })
      }

    }, sectionRef)

    return () => ctx.revert()
  }, [verticals.length])

  // Duplicate the array so the infinite scroll is seamless
  const duplicatedVerticals = [...verticals, ...verticals]

  return (
    <section
      ref={sectionRef}
      id="verticals"
      className="section bg-background"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="label-mono mb-2 block">Explore</span>
          <h2
            ref={titleRef}
            className="heading-md text-foreground mb-4"
          >
            Browse by <span className="text-jence-gold">section</span>
          </h2>
          <p className="body-md max-w-lg mx-auto">
            Engineering-first coverage across the full robotics and hardware stack.
          </p>
        </div>

        {/* Full-width Auto-Scrolling Carousel */}
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden mt-12 py-4">
            
            {/* Fade Out Edges for better visual effect */}
            <div className="absolute top-0 bottom-0 left-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            {loading ? (
                 <div className="w-full flex justify-center py-12">
                     <Loader2 className="animate-spin text-jence-gold" size={32} />
                 </div>
            ) : (
                <div
                    ref={gridRef}
                    className="flex gap-4 w-max hover:[animation-play-state:paused]"
                    // adding CSS pausing on hover makes it easier to click
                    onMouseEnter={() => gsap.getTweensOf(gridRef.current).forEach(t => t.pause())}
                    onMouseLeave={() => gsap.getTweensOf(gridRef.current).forEach(t => t.play())}
                >
                    {duplicatedVerticals.map((vertical, index) => {
                      const Icon = iconMap[vertical.iconName] || FileText
                      return (
                        <Link
                          key={`${vertical.id}-${index}`}
                          to={`/verticals/${vertical.slug}`}
                          className="vertical-card group w-[280px] p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 flex-shrink-0 flex flex-col"
                        >
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500"
                            style={{ backgroundColor: `${vertical.color}15`, color: vertical.color }}
                          >
                            <Icon size={24} />
                          </div>
                          <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-white transition-colors">
                            {vertical.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                            {vertical.description}
                          </p>
                          
                          <div className="mt-auto">
                            <span className="text-xs font-mono text-muted-foreground/50 group-hover:text-muted-foreground transition-colors flex items-center gap-1.5">
                              <FileText size={12} /> {12 + (dbStats?.articlesByVertical?.[vertical.slug] || 0)} articles
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                </div>
            )}
        </div>
      </div>
    </section>
  )
}
