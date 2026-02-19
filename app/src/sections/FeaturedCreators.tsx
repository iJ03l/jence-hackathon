import { useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface FeaturedCreatorsProps {
  className?: string
}

const creators = [
  {
    id: 1,
    category: 'Banking & Finance',
    description: 'FX, rates, and sector commentary',
    image: '/creator_portrait_1.jpg',
    handle: '@fxobserver',
  },
  {
    id: 2,
    category: 'Government & Policy',
    description: 'Procurement & legislative briefs',
    image: '/creator_portrait_2.jpg',
    handle: '@policybrief',
  },
  {
    id: 3,
    category: 'Digital Assets',
    description: 'On-chain research & market context',
    image: '/creator_portrait_3.jpg',
    handle: '@chainwatch',
  },
]

export default function FeaturedCreators({ className = '' }: FeaturedCreatorsProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(headerRef.current,
        { x: '-6vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'top 55%',
            scrub: true,
          }
        }
      )

      // Cards animation
      const cards = cardsRef.current?.querySelectorAll('.creator-card')
      if (cards) {
        gsap.fromTo(cards,
          { y: '10vh', opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.12,
            scrollTrigger: {
              trigger: cardsRef.current,
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
      id="featured"
      className={`section-flowing py-20 lg:py-28 bg-jence-black ${className}`}
    >
      <div className="w-full px-6 lg:px-12">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex items-center justify-between mb-12"
        >
          <h2 className="heading-2 font-semibold text-jence-white">
            Featured creators
          </h2>
          <a
            href="#"
            className="hidden sm:flex items-center gap-2 text-jence-gray hover:text-jence-green transition-colors"
          >
            <span className="text-sm">View all</span>
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Cards Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {creators.map((creator) => (
            <div
              key={creator.id}
              className="creator-card group relative h-[420px] rounded-[22px] overflow-hidden border border-white/5 card-hover cursor-pointer"
            >
              {/* Image */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={creator.image}
                  alt={creator.category}
                  className="creator-image w-full h-full object-cover image-mono"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-jence-black via-jence-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="label-mono mb-2 block">{creator.handle}</span>
                <h3 className="text-xl font-semibold text-jence-white mb-1">
                  {creator.category}
                </h3>
                <p className="text-sm text-jence-gray">
                  {creator.description}
                </p>
              </div>

              {/* Hover Border */}
              <div className="absolute inset-0 rounded-[22px] border border-jence-green/0 group-hover:border-jence-green/30 transition-colors pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 sm:hidden">
          <a
            href="#"
            className="flex items-center justify-center gap-2 text-jence-gray hover:text-jence-green transition-colors"
          >
            <span className="text-sm">View all creators</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
