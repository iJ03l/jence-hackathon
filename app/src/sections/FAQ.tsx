import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'What is Jence?',
    a: 'Jence is an anonymous expert analysis platform where verified creators publish independent sector research across Nigerian markets — finance, energy, real estate, tech, agriculture, and more.',
  },
  {
    q: 'How do creators stay anonymous?',
    a: 'Creators publish under pseudonyms. Their real identity is verified privately through KYC but never shared publicly. Only Jence has access to identity documents, encrypted at rest.',
  },
  {
    q: 'Is the content financial or legal advice?',
    a: 'No. All content on Jence is personal opinion and independent analysis. Creators self-certify that their content is commentary, not professional advice. Each vertical carries a specific disclaimer.',
  },
  {
    q: 'How do subscriptions work?',
    a: 'Subscribe to individual creators to access their premium analysis. Payments are settled via cryptocurrency — no personal banking details needed. Free posts are always available.',
  },
  {
    q: 'What happens if a creator violates content policies?',
    a: 'Jence has a 3-strike moderation system. Violations result in warnings, suspension, or permanent termination depending on severity. All strikes are transparent and auditable.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. Jence is compliant with the Nigeria Data Protection Act (NDPA). You can request data export or full deletion at any time from your settings page.',
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
