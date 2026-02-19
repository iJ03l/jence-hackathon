import { useRef, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Landmark, Shield, Trophy, Bitcoin, Building2,
  Briefcase, Store, Palette, Wheat, Fuel
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const verticals = [
  {
    id: 1,
    slug: 'financial-banking',
    name: 'Financial & Banking',
    description: 'Sector trend analysis, regulatory outlook',
    icon: Landmark,
    color: '#7928CA',
    creators: 42,
  },
  {
    id: 2,
    slug: 'government-policy',
    name: 'Government & Policy',
    description: 'Policy trajectory, sector research',
    icon: Shield,
    color: '#3B82F6',
    creators: 28,
  },
  {
    id: 3,
    slug: 'sports-recreational',
    name: 'Sports & Recreational',
    description: 'Statistical analysis, form analysis',
    icon: Trophy,
    color: '#00D68F',
    creators: 67,
  },
  {
    id: 4,
    slug: 'digital-assets-web3',
    name: 'Digital Assets & Web3',
    description: 'Blockchain research, on-chain data',
    icon: Bitcoin,
    color: '#F59E0B',
    creators: 89,
  },
  {
    id: 5,
    slug: 'real-estate-property',
    name: 'Real Estate',
    description: 'Area analysis, market data',
    icon: Building2,
    color: '#EC4899',
    creators: 31,
  },
  {
    id: 6,
    slug: 'professional-career',
    name: 'Career',
    description: 'Hiring trends, salary data',
    icon: Briefcase,
    color: '#8B5CF6',
    creators: 45,
  },
  {
    id: 7,
    slug: 'open-market-trade',
    name: 'Open Market',
    description: 'Supply chain, logistics',
    icon: Store,
    color: '#EF4444',
    creators: 38,
  },
  {
    id: 8,
    slug: 'creator-economy',
    name: 'Creator Economy',
    description: 'Monetization, content trends',
    icon: Palette,
    color: '#FF6B35',
    creators: 52,
  },
  {
    id: 9,
    slug: 'agriculture-food',
    name: 'Agriculture',
    description: 'Commodity trends, harvest intel',
    icon: Wheat,
    color: '#22C55E',
    creators: 25,
  },
  {
    id: 10,
    slug: 'oil-gas-energy',
    name: 'Oil, Gas & Energy',
    description: 'Energy markets, fuel pricing',
    icon: Fuel,
    color: '#06B6D4',
    creators: 19,
  },
]

export default function Verticals() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

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

      const cards = gridRef.current?.querySelectorAll('.vertical-card')
      if (cards) {
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
    }, sectionRef)

    return () => ctx.revert()
  }, [])

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
            Browse by <span className="text-jence-gold">vertical</span>
          </h2>
          <p className="body-md max-w-lg mx-auto">
            Independent analysts across every major sector of Nigerian economic and professional life.
          </p>
        </div>

        {/* Verticals Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {verticals.map((vertical) => {
            const Icon = vertical.icon
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
                  {vertical.creators} creators
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
