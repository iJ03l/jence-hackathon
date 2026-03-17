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
          duration: verticals.length * 8, // Slower, premium scroll speed
          repeat: -1,
        })
      }

    }, sectionRef)

    return () => ctx.revert()
  }, [verticals.length])

  // Quadruple the array so the infinite scroll is seamless even on ultrawide monitors
  const duplicatedVerticals = [...verticals, ...verticals, ...verticals, ...verticals]

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
                          className="group relative w-[220px] sm:w-[260px] md:w-[280px] p-6 sm:p-7 rounded-2xl bg-card/60 dark:bg-[#0A0A0A]/60 backdrop-blur-xl border border-border/50 dark:border-white/5 hover:bg-card/80 dark:hover:bg-[#111] hover:border-jence-gold/40 dark:hover:border-jence-gold/20 transition-all duration-500 overflow-hidden flex-shrink-0 flex flex-col hover:-translate-y-1 shadow-sm hover:shadow-2xl hover:shadow-jence-gold/10"
                        >
                          {/* Premium Top Glow Accent */}
                          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-jence-gold/0 group-hover:via-jence-gold/40 to-transparent transition-all duration-700" />
                          
                          <div className="relative z-10">
                              <div
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 bg-muted/50 dark:bg-white/5 border border-border/50 dark:border-white/5 shadow-inner"
                                style={{ color: vertical.color || '#D4AF37' }}
                              >
                                <Icon size={24} strokeWidth={1.5} className="sm:w-7 sm:h-7 w-6 h-6 opacity-80 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <h3 className="font-medium tracking-tight text-base sm:text-lg text-foreground/90 mb-2 group-hover:text-jence-gold transition-colors">
                                {vertical.name}
                              </h3>
                              <p className="text-[12px] sm:text-[13px] leading-relaxed text-muted-foreground/80 mb-6 line-clamp-2 font-light">
                                {vertical.description}
                              </p>
                          </div>
                          
                          <div className="mt-auto relative z-10 pt-4 border-t border-border/50 dark:border-white/5 group-hover:border-border dark:group-hover:border-white/10 transition-colors">
                            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted-foreground/80 dark:text-muted-foreground/60 group-hover:text-jence-gold transition-colors flex items-center gap-2">
                              {12 + (dbStats?.articlesByVertical?.[vertical.slug] || 0)} published
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
