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

      // We need to wait for rendering to setup the animation for the cards
      setTimeout(() => {
          const cards = gridRef.current?.querySelectorAll('.vertical-card')
          if (cards && cards.length > 0) {
            gsap.fromTo(cards,
              { y: 40, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                stagger: 0.1,
                scrollTrigger: {
                  trigger: gridRef.current,
                  start: 'top 85%',
                  end: 'top 50%',
                  scrub: true,
                }
              }
            )
          }
      }, 300)
    }, sectionRef)

    return () => ctx.revert()
  }, [verticals.length])

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

        {/* Verticals Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 min-h-[300px]"
        >
          {loading ? (
             <div className="col-span-full flex justify-center py-12">
                 <Loader2 className="animate-spin text-jence-gold" size={32} />
             </div>
          ) : verticals.map((vertical) => {
            const Icon = iconMap[vertical.iconName] || FileText
            return (
              <Link
                key={vertical.id}
                to={`/verticals/${vertical.slug}`}
                className="vertical-card group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${vertical.color}15`, color: vertical.color }}
                >
                  <Icon size={24} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {vertical.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {vertical.description}
                </p>
                <span className="text-xs font-mono text-muted-foreground">
                  {7 + (dbStats?.creatorsByVertical?.[vertical.slug] || 0)} creators
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
