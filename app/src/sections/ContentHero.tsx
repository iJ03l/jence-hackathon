import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { BookOpen, Users } from 'lucide-react'

export default function ContentHero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

      tl.fromTo(headlineRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 }
      )
      tl.fromTo(subRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.35'
      )
      tl.fromTo(ctaRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.25'
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative pt-28 sm:pt-36 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 xl:px-12 overflow-hidden"
    >
      {/* Subtle gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-jence-gold/3 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border mb-6">
          <div className="w-2 h-2 rounded-full bg-jence-green animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground">Robotics & Hardware Engineering</span>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="heading-xl text-foreground mb-5"
        >
          Every layer,{' '}
          <span className="text-gradient-gold">covered.</span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subRef}
          className="body-lg max-w-xl mx-auto mb-8"
        >
          Deep technical articles, hardware teardowns, and developer community
          from credited engineers — firmware to manufacturing.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/explore"
            className="btn-primary w-full sm:w-auto active:scale-[0.97] transition-all"
          >
            <BookOpen size={18} />
            Explore sections
          </Link>
          <Link
            to="/community"
            className="btn-secondary w-full sm:w-auto active:scale-[0.97] transition-all"
          >
            <Users size={18} />
            Join the community
          </Link>
        </div>
      </div>
    </section>
  )
}
