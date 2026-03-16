import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'What is Jence?',
    a: 'Jence is a robotics and hardware engineering publication featuring credited authors, verified credentials, and disclosure-first reporting.',
  },
  {
    q: 'What kind of content does Jence publish?',
    a: 'Deep technical articles, hardware teardowns, field notes, reproducible lab experiments, startup launch coverage, and market intelligence across 10 engineering verticals.',
  },
  {
    q: 'Do authors use real names?',
    a: 'Yes. Authors publish under real names with optional photo, location, and affiliation, plus verified credentials.',
  },
  {
    q: 'How do disclosures work?',
    a: 'Every article includes a conflict-of-interest box covering sponsorships, vendor ties, and personal stakes.',
  },
  {
    q: 'What is the safety policy?',
    a: 'We do not publish dangerous step-by-step instructions or weaponization content. Authors must include mitigations and safety notes.',
  },
  {
    q: 'How is the community moderated?',
    a: 'The community forum is moderated for technical accuracy, safety, and respect. Questions should cite methods and avoid unsafe instructions. Read our full community guidelines for details.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="label-mono mb-2 block">FAQ</span>
          <h2 className="heading-lg text-foreground">
            Common <span className="text-gradient-gold">questions</span>
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border/60 rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/30 active:scale-[0.995]"
              >
                <span className="text-sm font-medium text-foreground pr-4">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''
                    }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${openIndex === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
