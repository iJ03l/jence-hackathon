import { useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { UserPlus, Search, Unlock } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    number: '01',
    title: 'Create anonymous account',
    description: 'No real names. No email required. Just a username and password.',
    icon: UserPlus,
  },
  {
    number: '02',
    title: 'Find expert creators',
    description: 'Browse by category. See ratings, reviews, and preview content.',
    icon: Search,
  },
  {
    number: '03',
    title: 'Access exclusive alpha',
    description: 'Pay with crypto. Unlock locked posts. Cancel anytime.',
    icon: Unlock,
  },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)

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

      const stepCards = stepsRef.current?.querySelectorAll('.step-card')
      if (stepCards) {
        gsap.fromTo(stepCards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            scrollTrigger: {
              trigger: stepsRef.current,
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
      id="how-it-works"
      className="section bg-background"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="label-mono mb-4 block">How it works</span>
          <h2
            ref={titleRef}
            className="heading-md text-foreground mb-4"
          >
            Get started in <span className="text-jence-gold">3 steps</span>
          </h2>
          <p className="body-md max-w-lg mx-auto">
            No real names. No bank accounts. Pay with crypto. Stay anonymous.
          </p>
        </div>

        {/* Steps */}
        <div
          ref={stepsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="step-card relative">
                <span className="step-number">{step.number}</span>

                <div className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-jence-gold/10 flex items-center justify-center mb-5">
                    <Icon size={24} className="text-jence-gold" />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
                      <span className="text-jence-gold text-lg">→</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
