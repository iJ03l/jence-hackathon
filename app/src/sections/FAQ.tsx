import { useRef, useLayoutEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface FAQProps {
  className?: string
}

const faqs = [
  {
    question: 'What is Jence?',
    answer: 'Jence is a subscription-based platform where independent analysts, researchers, and sector specialists share expert commentary and research anonymously. Subscribers pay monthly to access creator-published content organized by sector.',
  },
  {
    question: 'Is it legal?',
    answer: 'Yes. Jence operates as a content subscription platform. All creators self-certify that they are not disclosing confidential information or violating any agreements. Content is framed as expert analysis and commentary, not insider information.',
  },
  {
    question: 'How do payments work?',
    answer: 'All payments are processed in cryptocurrency through third-party processors. Creators receive 80% of subscription revenue, paid out weekly. Subscribers can cancel anytime with no penalties.',
  },
  {
    question: 'Can creators stay anonymous?',
    answer: 'Creators have public anonymity—subscribers only see pseudonymous usernames. However, creators must complete private KYC verification with Jence for legal compliance and accountability.',
  },
  {
    question: 'What content is not allowed?',
    answer: 'Prohibited content includes: confidential employer information, classified government documents, guaranteed financial returns, match-fixing, doxxing, harassment, fraud tutorials, and Ponzi scheme promotion.',
  },
  {
    question: 'How do I cancel?',
    answer: 'You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period. No refunds are provided for partial months.',
  },
]

export default function FAQ({ className = '' }: FAQProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(titleRef.current,
        { y: '3vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'top 55%',
            scrub: true,
          }
        }
      )

      // Accordion rows animation
      const rows = listRef.current?.querySelectorAll('.faq-item')
      if (rows) {
        gsap.fromTo(rows,
          { y: '6vh', opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            scrollTrigger: {
              trigger: listRef.current,
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

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section
      ref={sectionRef}
      className={`section-flowing py-20 lg:py-28 bg-jence-black ${className}`}
    >
      <div className="w-full px-6 lg:px-12">
        {/* Title */}
        <h2
          ref={titleRef}
          className="heading-2 font-semibold text-jence-white mb-10"
        >
          Questions
        </h2>

        {/* Accordion List */}
        <div ref={listRef} className="space-y-3 max-w-4xl">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="faq-item rounded-[18px] bg-jence-dark border border-white/5 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 lg:p-6 text-left"
              >
                <span className="text-jence-white font-medium pr-4">
                  {faq.question}
                </span>
                <ChevronRight
                  size={20}
                  className={`text-jence-gray shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-90' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-48' : 'max-h-0'
                }`}
              >
                <p className="px-5 lg:px-6 pb-5 lg:pb-6 text-sm text-jence-gray">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
