import SEO from '../components/SEO'
import Navigation from '../sections/Navigation'
import CTAFooter from '../sections/CTAFooter'
import { Shield, Zap, TrendingUp, Lock, Users, ChevronDown, Check, X, ArrowRight } from 'lucide-react'
import { useState } from 'react'

const VERTICALS = [
    {
        name: 'Financial & Banking',
        emoji: '🏦',
        description: 'Sector trend analysis, regulatory outlook, financial product comparisons, fintech observations.',
        tags: ['Fintech', 'Trends', 'Regulation', 'Banking'],
    },
    {
        name: 'Government & Policy',
        emoji: '🏛️',
        description: 'Public-record-based government sector research, policy trajectory forecasting.',
        tags: ['Policy', 'Public Records', 'Forecasting'],
    },
    {
        name: 'Sports & Recreational',
        emoji: '⚽',
        description: 'Statistical analysis, probability modeling, form analysis, market commentary.',
        tags: ['Stats', 'Probability', 'Form', 'Market'],
    },
    {
        name: 'Digital Assets & Web3',
        emoji: '⛓️',
        description: 'Blockchain research, on-chain data analysis, DeFi comparisons, airdrop research.',
        tags: ['On-chain', 'DeFi', 'Airdrops', 'Blockchain'],
    },
    {
        name: 'Real Estate & Property',
        emoji: '🏘️',
        description: 'Area appreciation analysis, developer track record research, rental yield estimates.',
        tags: ['Appreciation', 'Developers', 'Yields', 'Property'],
    },
    {
        name: 'Professional & Career',
        emoji: '💼',
        description: 'Hiring trends, salary benchmarking, career navigation, professional development.',
        tags: ['Hiring', 'Salary', 'Navigation', 'Development'],
    },
    {
        name: 'Open Market & Trade',
        emoji: '🛒',
        description: 'Supply chain patterns, import logistics, product availability trends, wholesale dynamics.',
        tags: ['Supply Chain', 'Logistics', 'Wholesale', 'Imports'],
    },
    {
        name: 'Creator Economy & Digital Business',
        emoji: '�',
        description: 'Platform strategy, monetization commentary, content trends, brand deal observations.',
        tags: ['Strategy', 'Monetization', 'Content', 'Brands'],
    },
    {
        name: 'Agriculture & Food',
        emoji: '🌾',
        description: 'Harvest intelligence, commodity price trends, supply chain pattern observation.',
        tags: ['Harvest', 'Commodities', 'Prices', 'Supply'],
    },
    {
        name: 'Oil, Gas & Energy',
        emoji: '🛢️',
        description: 'Energy sector market analysis, fuel pricing trends, power sector reform analysis.',
        tags: ['Energy', 'Fuel', 'Power', 'Markets'],
    },
    {
        name: 'The Community Hub',
        emoji: '💬',
        description: 'A free, open-access forum like Reddit. Share updates, startup news, and sector observations without needing to subscribe.',
        tags: ['Startups', 'News', 'Updates', 'Free'],
    },
]

const FAQS = [
    {
        q: 'Is Jence safe to use?',
        a: 'Yes. Jence uses state-of-the-art encryption and embedded Solana wallets for all transactions. The platform operates completely without mandatory KYC (Know Your Customer) checks. Your wallet address is the only identity we see, meaning your public profile and subscription activity remain entirely anonymous.',
    },
    {
        q: 'How do I pay with USDC in Africa?',
        a: 'When you subscribe to an analyst, our embedded wallet system lets you fund your account using USDC via the Solana network. Transactions confirm in seconds, the platform sponsors your gas fees (meaning zero transaction costs for you), and no African bank account or card is required. P2P sellers and Binance P2P are common ways Africans source USDC if you don\'t already hold crypto.',
    },
    {
        q: 'Can I subscribe without revealing who I am?',
        a: 'Absolutely. Subscriptions are processed through non-custodial crypto infrastructure. Analysts see a subscriber count, never your personal identity or financial details. You can follow, read, and review content without anyone — including the platform — being able to link your activity to your real identity.',
    },
    {
        q: 'What kind of analysts are on Jence?',
        a: 'Jence hosts independent analysts, professional traders, sector researchers, and domain experts spanning crypto, forex, real estate, betting, government policy, open markets, agriculture, and careers. The platform badge system — Verified, Top Rated, Hot, Rising — reflects real track records, not just self-reported credentials.',
    },
    {
        q: 'Is this financial advice?',
        a: 'No. All content on Jence is for informational and educational purposes only. Sector commentary, statistical models, and analyst opinions are research — not financial, investment, legal, or political advice. Jence does not verify the accuracy of creator content. You assume full responsibility for decisions made based on content you access. Always consult a licensed professional for formal financial decisions.',
    },
    {
        q: 'How much do subscriptions cost?',
        a: 'Pricing is set individually by each creator based on the depth, frequency, and track record of their analysis. Entry-level research subscriptions start from the equivalent of a few dollars per month. Premium analysts with verified records charge more. You only pay for the specific analysts you follow — no blanket platform subscription required.',
    },
    {
        q: 'Can I become an analyst on Jence?',
        a: 'Yes. If you have genuine sector knowledge and want to monetize your research anonymously, you can apply to become a Jence creator. You set your own subscription price in USDC, post on your own schedule, and keep the vast majority of everything you earn — the platform currently takes a 0% cut. You do not need to provide KYC documentation; you publish under a pseudonym.',
    },
    {
        q: 'Why is Jence better than Telegram signal groups?',
        a: 'Telegram groups are free, unaccountable, and riddled with noise. Anyone can post anything with zero consequence. On Jence, creators are rated by real subscribers and subject to a strict strike system. They have financial skin in the game — their subscription revenue depends on the quality of their analysis. That accountability is what separates signal from noise.',
    },
    {
        q: 'What happens if an analyst posts bad or false information?',
        a: 'Jence operates a documented strike system. Strike one removes the content and restricts the creator for 7 days. Strike two triggers a 30-day suspension and withheld revenue. Strike three is permanent termination. Subscriber ratings are public and factored into creator rankings. Bad actors lose income and ranking — the system has teeth.',
    },
]

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false)
    return (
        <div
            className="border border-border/50 rounded-2xl overflow-hidden cursor-pointer"
            onClick={() => setOpen(!open)}
        >
            <div className="flex items-center justify-between p-6 gap-4">
                <h3 className="text-lg font-semibold text-foreground">{q}</h3>
                <ChevronDown
                    size={20}
                    className={`flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                />
            </div>
            {open && (
                <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
                    {a}
                </div>
            )}
        </div>
    )
}

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
        }
    }))
}

const STATS = [
    { value: '11', label: 'Intelligence verticals' },
    { value: 'Up to 100%', label: 'Revenue goes to creators' },
    { value: 'USDC', label: 'Crypto-only payments' },
    { value: '100%', label: 'Subscriber anonymity' },
]

const COMPARISONS = [
    { feature: 'Anonymous analysts', jence: true, telegram: false, twitter: false },
    { feature: 'No KYC requirement', jence: true, telegram: true, twitter: false },
    { feature: 'Subscriber rating system', jence: true, telegram: false, twitter: false },
    { feature: 'Crypto payment (USDC)', jence: true, telegram: false, twitter: false },
    { feature: 'Strike & accountability system', jence: true, telegram: false, twitter: false },
    { feature: '10 premium sectors + free community', jence: true, telegram: false, twitter: false },
    { feature: 'No noise, paid-only access', jence: true, telegram: false, twitter: false },
]

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-jence-gold/30 selection:text-foreground">
            <SEO
                title="Jence — Where Africa's Best Analysts Share What They Actually Know"
                description="Jence is Africa's anonymous expert analysis platform. Get real insights on crypto, forex, sports betting, real estate, and more — from analysts who actually know, paid securely with USDC."
                url="/about"
            >
                <script type="application/ld+json">
                    {JSON.stringify(faqSchema)}
                </script>
            </SEO>

            <Navigation />

            <main className="flex-1 pt-32 pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">

                    {/* ── HERO ── */}
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 bg-jence-gold/10 border border-jence-gold/20 rounded-full px-4 py-2 text-sm font-medium text-jence-gold mb-6">
                            <span className="w-2 h-2 rounded-full bg-jence-gold animate-pulse" />
                            Africa's first anonymous expert analysis platform
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-6 text-foreground">
                            Tired of searching how to make money and getting the same recycled advice?
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
                            The people who actually know how money moves in Africa — the banking insiders, the forex traders, the crypto analysts, the property investors — have never had a safe, anonymous place to share what they know. Now they do.
                        </p>
                        <a
                            href="/explore"
                            className="inline-flex items-center gap-2 bg-jence-gold text-background font-bold px-8 py-4 rounded-2xl text-lg hover:bg-jence-gold/90 transition-colors"
                        >
                            Browse Analysts <ArrowRight size={20} />
                        </a>
                    </div>

                    {/* ── STATS ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                        {STATS.map((s) => (
                            <div key={s.label} className="p-6 rounded-2xl bg-card border border-border/50 text-center">
                                <div className="text-3xl font-black text-jence-gold mb-1">{s.value}</div>
                                <div className="text-sm text-muted-foreground">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── WHAT IS JENCE ── */}
                    <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold tracking-tight mb-3">Every sector. One platform.</h2>
                            <p className="text-muted-foreground text-lg">10 premium verticals + 1 open community hub covering every corner of Africa's information economy.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {VERTICALS.map((v) => (
                                <div key={v.name} className="p-6 rounded-2xl bg-card border border-border/50 hover:border-jence-gold/30 transition-colors group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl">{v.emoji}</span>
                                        <h3 className="font-bold text-lg text-foreground">{v.name}</h3>
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{v.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {v.tags.map((t) => (
                                            <span key={t} className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border/50">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── HOW IT WORKS ── */}
                    <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
                        <h2 className="text-3xl font-bold tracking-tight mb-3">How It Works</h2>
                        <p className="text-muted-foreground text-lg mb-8">Three steps. No bank account needed. No identity exposed.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { icon: <TrendingUp size={28} />, step: '01', title: 'Browse Analysts', body: 'Filter by vertical, price, rating, and track record. Every creator profile shows free preview posts so you can judge quality before you subscribe.' },
                                { icon: <Zap size={28} />, step: '02', title: 'Subscribe with USDC', body: 'Pay securely via USDC on Solana. Transactions confirm in seconds and we sponsor your gas fees. No African bank card required. You keep full anonymity.' },
                                { icon: <Lock size={28} />, step: '03', title: 'Access Research Instantly', body: 'Unlock the analyst\'s full post history the moment payment confirms. New posts land in your feed in real time.' },
                            ].map((item) => (
                                <div key={item.step} className="p-6 rounded-2xl bg-card border border-border/50 relative overflow-hidden">
                                    <div className="absolute top-4 right-4 text-5xl font-black text-muted/20 select-none">{item.step}</div>
                                    <div className="w-12 h-12 rounded-xl bg-jence-gold/10 flex items-center justify-center text-jence-gold mb-4">
                                        {item.icon}
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 text-foreground">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── WHY ANONYMOUS ── */}
                    <div className="mb-20 bg-muted/50 p-8 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold tracking-tight mb-4">
                                    Why do Africa's best analysts share here and not on Twitter?
                                </h2>
                                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                                    Because anonymity removes the social risk of sharing what you actually know. No employer blowback. No competition copying you. No ego. Just signal.
                                </p>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Jence separates the identity from the insight — letting the research speak for itself. The result: people share more, share deeper, and share earlier than they ever would under their real name.
                                </p>
                            </div>
                            <div className="flex-shrink-0 flex flex-col gap-3 w-full md:w-56">
                                {['No employer blowback', 'No competition copying you', 'No reputational risk', 'No social pressure', 'Just the signal'].map((item) => (
                                    <div key={item} className="flex items-center gap-3 bg-card border border-border/50 rounded-xl px-4 py-3">
                                        <Shield size={16} className="text-jence-gold flex-shrink-0" />
                                        <span className="text-sm font-medium text-foreground">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── JENCE VS ALTERNATIVES ── */}
                    <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
                        <h2 className="text-3xl font-bold tracking-tight mb-3">Jence vs. where you currently get your tips</h2>
                        <p className="text-muted-foreground text-lg mb-8">Free Telegram groups and Twitter threads have no accountability. Jence does.</p>
                        <div className="overflow-x-auto rounded-2xl border border-border/50">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                                        <th className="p-4 font-bold text-jence-gold">Jence</th>
                                        <th className="p-4 font-semibold text-muted-foreground">Telegram Groups</th>
                                        <th className="p-4 font-semibold text-muted-foreground">Twitter/X</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {COMPARISONS.map((row, i) => (
                                        <tr key={row.feature} className={`border-b border-border/50 last:border-0 ${i % 2 === 0 ? 'bg-muted/20' : ''}`}>
                                            <td className="p-4 text-foreground">{row.feature}</td>
                                            <td className="p-4 text-center">
                                                {row.jence ? <Check size={18} className="mx-auto text-green-500" /> : <X size={18} className="mx-auto text-red-400" />}
                                            </td>
                                            <td className="p-4 text-center">
                                                {row.telegram ? <Check size={18} className="mx-auto text-green-500" /> : <X size={18} className="mx-auto text-red-400" />}
                                            </td>
                                            <td className="p-4 text-center">
                                                {row.twitter ? <Check size={18} className="mx-auto text-green-500" /> : <X size={18} className="mx-auto text-red-400" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── CREATOR RECRUITMENT ── */}
                    <div className="mb-20 p-8 rounded-3xl border border-jence-gold/20 bg-jence-gold/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400 fill-mode-both">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 bg-jence-gold/10 border border-jence-gold/20 rounded-full px-3 py-1 text-xs font-medium text-jence-gold mb-4">
                                    <Users size={12} /> For Analysts & Experts
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight mb-4">You know things others will pay for. Start earning.</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                                    If you have genuine sector knowledge — in crypto, forex, real estate, betting, policy, markets, or anything else — Jence gives you a safe, anonymous way to monetize it.
                                </p>
                                <ul className="space-y-3 mb-6">
                                    {[
                                        'Set your own subscription price',
                                        'Keep up to 100% of everything you earn (currently 0% platform fee)',
                                        'Stay completely anonymous publicly',
                                        'Get paid in USDC — no bank account needed',
                                        'Build a reputation and subscriber base that pays monthly',
                                    ].map((item) => (
                                        <li key={item} className="flex items-center gap-3 text-foreground">
                                            <Check size={16} className="text-jence-gold flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <a
                                    href="/register?role=creator"
                                    className="inline-flex items-center gap-2 bg-jence-gold text-background font-bold px-6 py-3 rounded-xl hover:bg-jence-gold/90 transition-colors"
                                >
                                    Apply to Become an Analyst <ArrowRight size={16} />
                                </a>
                            </div>
                            <div className="flex-shrink-0 p-6 rounded-2xl bg-card border border-border/50 w-full md:w-60">
                                <div className="text-sm text-muted-foreground mb-4 font-medium">Example earnings</div>
                                {[
                                    { subs: '50 subscribers', price: '5 USDC/mo', earn: '250 USDC/mo' },
                                    { subs: '200 subscribers', price: '10 USDC/mo', earn: '2,000 USDC/mo' },
                                    { subs: '500 subscribers', price: '15 USDC/mo', earn: '7,500 USDC/mo' },
                                ].map((row) => (
                                    <div key={row.subs} className="mb-4 last:mb-0">
                                        <div className="text-xs text-muted-foreground">{row.subs} @ {row.price}</div>
                                        <div className="text-lg font-bold text-jence-gold">{row.earn}</div>
                                        <div className="text-xs text-muted-foreground">0% platform cut</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── TRUST SIGNALS ── */}
                    <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400 fill-mode-both">
                        <h2 className="text-3xl font-bold tracking-tight mb-3">Built with trust at the foundation</h2>
                        <p className="text-muted-foreground text-lg mb-8">Jence was designed so that every party — subscriber, creator, and platform — is accountable.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: '�', title: 'Zero KYC', body: 'We don\'t pretend to collect your data. There is no KYC for creators or subscribers. Your embedded wallet addresses are the only identity layer.' },
                                { icon: '⚖️', title: 'Strike System', body: 'Three documented strikes and a creator is permanently banned. Bad analysis costs them revenue and ranking. The system has teeth.' },
                                { icon: '🛡️', title: 'Privacy Compliant', body: 'Jence complies with African Data Protection regulations. Your data is encrypted, minimally collected, and you have the right to request deletion at any time.' },
                                { icon: '💸', title: 'Non-Custodial Payments', body: 'We do not hold your funds. Crypto payments go directly through third-party infrastructure. Jence never sits between you and your money longer than a single transaction.' },
                                { icon: '📋', title: 'Legal Disclaimers on Every Post', body: 'Every piece of content on Jence carries a legal disclaimer. Research is research. It is not financial advice. You always know where you stand.' },
                                { icon: '⭐', title: 'Verified Rating System', body: 'Subscriber ratings are public and weighted by subscription history. A creator\'s star rating reflects what real paying subscribers think — not likes or follower counts.' },
                            ].map((item) => (
                                <div key={item.title} className="p-6 rounded-2xl bg-card border border-border/50">
                                    <div className="text-2xl mb-3">{item.icon}</div>
                                    <h3 className="font-bold text-base mb-2 text-foreground">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── FAQ ── */}
                    <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
                        <h2 className="text-3xl font-bold tracking-tight mb-3">Frequently Asked Questions</h2>
                        <p className="text-muted-foreground text-lg mb-8">Everything you need to know before you subscribe or start publishing.</p>
                        <div className="space-y-3">
                            {FAQS.map((faq) => (
                                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                            ))}
                        </div>
                    </div>

                    {/* ── BOTTOM CTA ── */}
                    <div className="text-center p-12 rounded-3xl bg-card border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-foreground">
                            The plugged-in Africans don't share publicly.<br />They share here.
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                            Subscribe to analysts who actually know. Or start earning from what you already know.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/explore"
                                className="inline-flex items-center justify-center gap-2 bg-jence-gold text-background font-bold px-8 py-4 rounded-2xl text-lg hover:bg-jence-gold/90 transition-colors"
                            >
                                Browse Analysts <ArrowRight size={20} />
                            </a>
                            <a
                                href="/register?role=creator"
                                className="inline-flex items-center justify-center gap-2 border border-border/50 text-foreground font-bold px-8 py-4 rounded-2xl text-lg hover:bg-muted/50 transition-colors"
                            >
                                Apply as Analyst
                            </a>
                        </div>
                    </div>

                </div>
            </main>

            <CTAFooter />
        </div>
    )
}