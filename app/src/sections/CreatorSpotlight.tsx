import { useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Check } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface CreatorSpotlightProps {
  className?: string
}

export default function CreatorSpotlight({ className = '' }: CreatorSpotlightProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const textBlockRef = useRef<HTMLDivElement>(null)
  const portraitRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        }
      })

      // ENTRANCE (0%-30%)
      scrollTl.fromTo(cardRef.current,
        { y: '100vh', scale: 0.96, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, ease: 'none' },
        0
      )

      scrollTl.fromTo(textBlockRef.current,
        { x: '-10vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      )

      scrollTl.fromTo(portraitRef.current,
        { x: '12vw', scale: 1.06, opacity: 0 },
        { x: 0, scale: 1, opacity: 1, ease: 'none' },
        0
      )

      scrollTl.fromTo(ctaRef.current,
        { y: '6vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.15
      )

      // SETTLE (30%-70%): Hold positions

      // EXIT (70%-100%)
      scrollTl.fromTo(cardRef.current,
        { y: 0, opacity: 1 },
        { y: '-18vh', opacity: 0, ease: 'power2.in' },
        0.7
      )

      scrollTl.fromTo(textBlockRef.current,
        { x: 0, opacity: 1 },
        { x: '-6vw', opacity: 0.25, ease: 'power2.in' },
        0.7
      )

      scrollTl.fromTo(portraitRef.current,
        { x: 0, opacity: 1 },
        { x: '6vw', opacity: 0.25, ease: 'power2.in' },
        0.7
      )

      // Background parallax
      scrollTl.fromTo(bgRef.current,
        { scale: 1 },
        { scale: 1.05 },
        0.7
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={`section-pinned flex items-center justify-center ${className}`}
    >
      {/* Background Image */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <img
          src="/spotlight_city_bg.jpg"
          alt="City skyline"
          className="w-full h-full object-cover image-mono"
        />
        <div className="absolute inset-0 bg-jence-black/50" />
      </div>

      {/* Spotlight Card */}
      <div
        ref={cardRef}
        className="relative z-10 w-[min(88vw,1200px)] h-[min(62vh,600px)] glass rounded-[28px] border border-white/10 overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row h-full">
          {/* Text Block */}
          <div
            ref={textBlockRef}
            className="flex-1 p-8 lg:p-12 flex flex-col justify-center"
          >
            <span className="label-mono mb-4 text-jence-green">
              Creator Spotlight
            </span>

            <h2 className="heading-2 font-semibold text-jence-white mb-4">
              Hardware Security
            </h2>

            <p className="text-jence-gray text-base lg:text-lg max-w-md mb-8">
              Defensive research on secure boot, supply chain risks, and product hardening with responsible disclosure.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {['Responsible disclosure', 'Mitigation-first writeups', 'Reproducible tests'].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-jence-green/20 flex items-center justify-center">
                    <Check size={12} className="text-jence-green" />
                  </div>
                  <span className="text-sm text-jence-white">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div ref={ctaRef}>
              <button className="btn-primary mb-3">
                Subscribe
              </button>
              <p className="text-xs text-jence-gray/60">
                Cancel anytime. New issues every month.
              </p>
            </div>
          </div>

          {/* Portrait */}
          <div
            ref={portraitRef}
            className="hidden lg:block w-[45%] h-full relative"
          >
            <img
              src="/spotlight_portrait.jpg"
              alt="Policy researcher"
              className="w-full h-full object-cover image-mono"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-jence-black/60 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}
