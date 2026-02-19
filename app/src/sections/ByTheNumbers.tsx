import { useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  {
    value: '₦2.3B+',
    label: 'paid out to creators',
  },
  {
    value: '50k+',
    label: 'active subscribers',
  },
  {
    value: '200+',
    label: 'creators sharing alpha',
  },
]

export default function ByTheNumbers() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const statCards = statsRef.current?.querySelectorAll('.stat-card')
      if (statCards) {
        gsap.fromTo(statCards,
          { y: 40, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.15,
            scrollTrigger: {
              trigger: statsRef.current,
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
      className="section-narrow bg-background"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="label-mono mb-2 block">By the numbers</span>
          <h2 className="heading-sm text-foreground">
            Growing <span className="text-jence-gold">fast</span>
          </h2>
        </div>

        {/* Stats Grid */}
        <div
          ref={statsRef}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card"
            >
              <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-jence-gold mb-2">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground text-center">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
