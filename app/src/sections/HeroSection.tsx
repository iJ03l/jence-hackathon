import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ArrowRight, TrendingUp, Shield, Wallet } from 'lucide-react'

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subheadlineRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

      tl.fromTo(headlineRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      )

      tl.fromTo(subheadlineRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      )

      tl.fromTo(ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.3'
      )

      const features = featuresRef.current?.querySelectorAll('.feature-item')
      if (features) {
        tl.fromTo(features,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
          '-=0.2'
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-jence-gold/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-jence-gold/10 border border-jence-gold/20 mb-8">
          <TrendingUp size={16} className="text-jence-gold" />
          <span className="text-sm font-medium text-jence-gold">Now live in Nigeria</span>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="heading-xl text-foreground mb-6"
        >
          Expert sector research,
          <br />
          <span className="text-gradient-gold">published anonymously.</span>
        </h1>

        {/* Subheadline */}
        <p
          ref={subheadlineRef}
          className="body-lg max-w-2xl mx-auto mb-10"
        >
          Subscribe to independent analysts sharing expert commentary, research, and professional
          opinion across banking, markets, policy, and more. Paid content from Nigeria's
          professionals — anonymous and crypto-settled.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link to="/register" className="btn-primary w-full sm:w-auto">
            Get started
            <ArrowRight size={18} />
          </Link>
          <Link to="/explore" className="btn-secondary w-full sm:w-auto">
            Explore verticals
          </Link>
        </div>

        {/* Features */}
        <div
          ref={featuresRef}
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          <div className="feature-item flex items-center gap-2">
            <Shield size={16} className="text-jence-green" />
            <span>Anonymous by design</span>
          </div>
          <div className="feature-item flex items-center gap-2">
            <Wallet size={16} className="text-jence-gold" />
            <span>Crypto payments only</span>
          </div>
          <div className="feature-item flex items-center gap-2">
            <TrendingUp size={16} className="text-jence-green" />
            <span>80% to creators</span>
          </div>
        </div>
      </div>
    </section>
  )
}
