import { useRef, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Star, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const authors = [
  {
    id: 1,
    handle: 'Dr. Amina Yusuf',
    category: 'Embedded',
    categoryColor: 'embedded',
    rating: 4.8,
    articles: 24,
    preview: 'Boot time regression hunt: instrumentation, trace analysis, and the patch.',
    comments: 45,
    views: '1.9k',
    trending: true,
  },
  {
    id: 2,
    handle: 'Kenji Ito',
    category: 'Security',
    categoryColor: 'security',
    rating: 4.9,
    articles: 31,
    preview: 'Secure boot checklist for low-cost MCUs with vendor pitfalls called out.',
    comments: 61,
    views: '3.4k',
    trending: true,
  },
  {
    id: 3,
    handle: 'Maya Patel',
    category: 'Perception',
    categoryColor: 'perception',
    rating: 4.7,
    articles: 18,
    preview: 'Sensor fusion benchmark kit with dataset links and calibration notes.',
    comments: 34,
    views: '2.1k',
    trending: false,
  },
]

export default function FeaturedAuthors() {
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

      const cards = cardsRef.current?.querySelectorAll('.author-card')
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
      id="authors"
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
              Featured <span className="text-jence-gold">authors</span>
            </h2>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-jence-gold transition-colors"
          >
            See all authors
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Cards */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {authors.map((author) => (
            <div key={author.id} className="author-card creator-card group cursor-default">
              {/* Card Header */}
              <div className="block p-5 border-b border-border hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-jence-gold/20 to-jence-gold/5 flex items-center justify-center text-lg font-bold text-jence-gold shrink-0">
                      {author.handle.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-jence-gold transition-colors">{author.handle}</h3>
                      <span className={`badge category-${author.categoryColor} mt-1 inline-block`}>
                        {author.category}
                      </span>
                    </div>
                  </div>
                  {author.trending && (
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
                    <span>{author.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{author.articles} articles</span>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-5">
                <div className="bg-muted/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-jence-gold text-xs">📌 LATEST</span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">
                    {author.preview}
                  </p>
                </div>

                {/* Engagement */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      {author.comments}
                    </span>
                    <span>{author.views} views</span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  to="/explore"
                  className="block w-full btn-secondary py-2.5 text-sm text-center active:scale-[0.97] transition-all"
                >
                  Read their work →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
