import { useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Star, MessageSquare, TrendingUp, ArrowRight, Lock } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const creators = [
  {
    id: 1,
    handle: '@crypto_plug',
    category: 'Crypto',
    categoryColor: 'crypto',
    rating: 4.9,
    subscribers: '1.2k',
    price: '₦8,000',
    preview: 'Made $340 from this airdrop in 2 hours. Here\'s the exact process...',
    comments: 45,
    views: '2.3k',
    trending: true,
  },
  {
    id: 2,
    handle: '@betting_edge',
    category: 'Betting',
    categoryColor: 'betting',
    rating: 4.7,
    subscribers: '890',
    price: '₦5,000',
    preview: 'Bookie exploit still working. 7/10 odds hit this weekend...',
    comments: 89,
    views: '5.1k',
    trending: true,
  },
  {
    id: 3,
    handle: '@remote_hunter',
    category: 'Remote Work',
    categoryColor: 'remote',
    rating: 4.8,
    subscribers: '650',
    price: '₦10,000',
    preview: 'Just landed a $2,500/mo client from this exact proposal template...',
    comments: 34,
    views: '1.8k',
    trending: false,
  },
]

export default function TrendingCreators() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
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

      const cards = cardsRef.current?.querySelectorAll('.creator-card')
      if (cards) {
        gsap.fromTo(cards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
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
      id="creators"
      className="section bg-background"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10"
        >
          <div>
            <span className="label-mono mb-2 block">Trending now</span>
            <h2 className="heading-md text-foreground">
              Featured <span className="text-jence-gold">creators</span>
            </h2>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-jence-gold transition-colors"
          >
            See all creators
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Cards */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {creators.map((creator) => (
            <div key={creator.id} className="creator-card">
              {/* Card Header */}
              <div className="p-5 border-b border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-jence-gold/20 to-jence-gold/5 flex items-center justify-center text-lg font-bold text-jence-gold">
                      {creator.handle.charAt(1).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{creator.handle}</h3>
                      <span className={`badge category-${creator.categoryColor}`}>
                        {creator.category}
                      </span>
                    </div>
                  </div>
                  {creator.trending && (
                    <div className="flex items-center gap-1 text-jence-green">
                      <TrendingUp size={14} />
                      <span className="text-xs font-medium">HOT</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-jence-gold" />
                    <span>{creator.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{creator.subscribers} subscribers</span>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-5">
                <div className="bg-muted/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-jence-gold text-xs">📌 NEW</span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">
                    {creator.preview}
                  </p>
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Lock size={14} />
                    <span>Subscribe to unlock</span>
                  </div>
                </div>

                {/* Engagement */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      {creator.comments}
                    </span>
                    <span>{creator.views} views</span>
                  </div>
                </div>

                {/* CTA */}
                <button className="w-full btn-primary py-2.5 text-sm">
                  Subscribe • {creator.price}/month
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
