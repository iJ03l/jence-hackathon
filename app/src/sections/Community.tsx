import { useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Shield, Bitcoin, Heart } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface CommunityProps {
  className?: string
}

const values = [
  {
    title: 'Anonymous by design',
    description: 'No real names required.',
    icon: Shield,
  },
  {
    title: 'Crypto-native',
    description: 'Pay and earn in crypto.',
    icon: Bitcoin,
  },
  {
    title: 'Creator-first revenue',
    description: '80% to creators.',
    icon: Heart,
  },
]

export default function Community({ className = '' }: CommunityProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const valuesRef = useRef<HTMLDivElement>(null)
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
        { y: '100vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0
      )

      scrollTl.fromTo(titleRef.current,
        { x: '-8vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0.05
      )

      scrollTl.fromTo(bodyRef.current,
        { x: '-6vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0.1
      )

      // Values stagger
      const valueItems = valuesRef.current?.querySelectorAll('.value-item')
      if (valueItems) {
        valueItems.forEach((item, index) => {
          scrollTl.fromTo(item,
            { x: '6vw', opacity: 0 },
            { x: 0, opacity: 1, ease: 'none' },
            0.1 + index * 0.05
          )
        })
      }

      scrollTl.fromTo(ctaRef.current,
        { y: '5vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.25
      )

      // SETTLE (30%-70%): Hold

      // EXIT (70%-100%)
      scrollTl.fromTo(cardRef.current,
        { y: 0, opacity: 1 },
        { y: '-16vh', opacity: 0, ease: 'power2.in' },
        0.7
      )

      if (valueItems) {
        scrollTl.fromTo(valueItems,
          { opacity: 1 },
          { opacity: 0.25, ease: 'power2.in' },
          0.7
        )
      }

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
          src="/community_city_bg.jpg"
          alt="City alley"
          className="w-full h-full object-cover image-mono"
        />
        <div className="absolute inset-0 bg-jence-black/50" />
      </div>

      {/* Center Card */}
      <div
        ref={cardRef}
        className="relative z-10 w-[min(86vw,1140px)] min-h-[min(58vh,540px)] glass rounded-[28px] border border-white/10 p-8 lg:p-12"
      >
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Left: Main Content */}
          <div className="flex-1">
            <h2
              ref={titleRef}
              className="heading-2 font-semibold text-jence-white mb-6"
            >
              Built for privacy
            </h2>

            <p
              ref={bodyRef}
              className="text-jence-gray text-base lg:text-lg max-w-lg mb-8"
            >
              Jence is a subscription network for independent analysts. Creators earn 80%. Subscribers stay anonymous. We don't sell data. We don't track identities.
            </p>

            <div ref={ctaRef}>
              <button className="btn-outline">
                Join the community
              </button>
            </div>
          </div>

          {/* Right: Values */}
          <div
            ref={valuesRef}
            className="lg:w-80 space-y-6"
          >
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div
                  key={value.title}
                  className="value-item flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="w-10 h-10 rounded-lg bg-jence-green/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-jence-green" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-jence-white mb-1">
                      {value.title}
                    </h3>
                    <p className="text-xs text-jence-gray">
                      {value.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
