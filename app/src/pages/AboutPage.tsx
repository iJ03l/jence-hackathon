import SEO from '../components/SEO'
import Navigation from '../sections/Navigation'
import { Shield, FileCheck, Users, ChevronDown, Check, X, ArrowRight, HandCoins } from 'lucide-react'
import { useState } from 'react'

const VERTICALS = [
    {
        name: 'Embedded & Firmware',
        emoji: '🧩',
        description: 'Boot, RTOS, bring-up, instrumentation, and low-level reliability work.',
        tags: ['RTOS', 'Bring-up', 'Drivers', 'Tracing'],
    },
    {
        name: 'Robotics Software',
        emoji: '🤖',
        description: 'ROS2, autonomy stacks, tooling, simulation, and runtime orchestration.',
        tags: ['ROS2', 'Autonomy', 'Simulation', 'Tooling'],
    },
    {
        name: 'Hardware Security',
        emoji: '🛡️',
        description: 'Defensive research on boot chains, debug ports, and product security.',
        tags: ['Secure Boot', 'Product Security', 'Hardening', 'DFD'],
    },
    {
        name: 'Industrial / OT Robotics',
        emoji: '🏭',
        description: 'Industrial controls, OT safety, and deployment realities in factories.',
        tags: ['OT', 'Safety', 'PLC', 'Deployment'],
    },
    {
        name: 'Drones & Mobile Systems',
        emoji: '🛰️',
        description: 'Mobile platforms, navigation stacks, and field reliability studies.',
        tags: ['Navigation', 'Reliability', 'Edge', 'Field Tests'],
    },
    {
        name: 'Humanoids & Actuation',
        emoji: '🦾',
        description: 'Actuators, tendon design, torque density, and performance tradeoffs.',
        tags: ['Actuation', 'Torque', 'Materials', 'Dynamics'],
    },
    {
        name: 'Sensors & Perception',
        emoji: '👁️',
        description: 'Sensor fusion, calibration, perception stacks, and benchmarking.',
        tags: ['Perception', 'Calibration', 'Fusion', 'Datasets'],
    },
    {
        name: 'Power / Batteries / Thermal',
        emoji: '🔋',
        description: 'Power delivery, thermal envelopes, and pack design tradeoffs.',
        tags: ['Thermal', 'Battery', 'Power', 'Reliability'],
    },
    {
        name: 'Mechanical / Manufacturing / DFM',
        emoji: '🧰',
        description: 'DFM, assembly workflows, tolerances, and field repairs.',
        tags: ['DFM', 'Manufacturing', 'Assembly', 'Tolerances'],
    },
    {
        name: 'Research & Benchmarks',
        emoji: '🧪',
        description: 'Reproducible experiments, datasets, and transparent methodology.',
        tags: ['Benchmarks', 'Reproducibility', 'Datasets', 'Methodology'],
    },
    {
        name: 'Launch Notes',
        emoji: '🚀',
        description: 'Open product launch updates with clear disclosure, ship notes, and community support.',
        tags: ['Launches', 'Support', 'Disclosure', 'Shipping'],
    },
    {
        name: 'Community Q&A',
        emoji: '💬',
        description: 'Open discussion forum for questions, clarifications, and peer help.',
        tags: ['Q&A', 'Discussion', 'Peer Review', 'Open'],
    },
]

const FAQS = [
    {
        q: 'Are authors credited with real names?',
        a: 'Yes. Jence is real-name by default. Pseudonyms are allowed only for exceptional safety reasons and require editorial approval.',
    },
    {
        q: 'How are credentials verified?',
        a: 'Authors can submit LinkedIn, GitHub, ORCID, and optional employer or lab affiliation. Jence verifies links and may request additional confirmation before marking a profile as verified.',
    },
    {
        q: 'What is a conflict-of-interest disclosure?',
        a: 'Every article includes a disclosure box listing sponsor ties, vendor relationships, or a clear statement that no conflicts are declared.',
    },
    {
        q: 'What is the safety policy?',
        a: 'We do not publish dangerous step-by-step instructions. Authors must include safety limits, mitigations, and failure modes where relevant.',
    },
    {
        q: 'How does responsible disclosure work?',
        a: 'Security research must follow a documented disclosure timeline, including vendor contact and coordinated release expectations.',
    },
    {
        q: 'Do you allow weaponization or export-controlled content?',
        a: 'No. Weaponization content and export-controlled material are out of scope and will be removed.',
    },
    {
        q: 'How do tips work?',
        a: 'Jence uses one-time tips, not subscriptions. Readers can directly support useful articles, research disclosures, and Launch Notes.',
    },
    {
        q: 'Can researchers publish and get rewarded?',
        a: 'Yes. Researchers can publish findings, teardowns, benchmarks, and disclosed technical work, then receive one-time tips from the community.',
    },
    {
        q: 'Can product launchers get community support?',
        a: 'Yes. Launch Notes are open to submit, and product launchers can receive community tips when their work is useful to readers.',
    },
    {
        q: 'Do I need to apply before I submit?',
        a: 'No. Jence is open to contributors. If you have research, field notes, or a launch update to share, submit it directly and include clear disclosure and safety context.',
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
    { value: '10', label: 'Engineering sections' },
    { value: 'Open', label: 'Submission access' },
    { value: 'Tips', label: 'Support model' },
    { value: '100%', label: 'Credited bylines' },
    { value: '0', label: 'Application gate' },
]

const COMPARISONS = [
    { feature: 'Credited authorship', jence: true, pr: false, blogs: false },
    { feature: 'Clear disclosure and article credit', jence: true, pr: false, blogs: false },
    { feature: 'Reproducible labs and datasets', jence: true, pr: false, blogs: false },
    { feature: 'Responsible disclosure for security work', jence: true, pr: false, blogs: false },
    { feature: 'Open submissions from researchers and builders', jence: true, pr: false, blogs: false },
    { feature: 'One-time community support via tips', jence: true, pr: false, blogs: false },
]

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-jence-gold/30 selection:text-foreground">
            <SEO
                title="Jence — Robotics and Hardware Engineering Publication"
                description="Jence is an open robotics and hardware publishing platform where researchers, builders, and launchers share disclosed work and earn community tips."
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
                            Hardware and robotics, every layer
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-6 text-foreground">
                            Engineering work with credit, disclosure, and rigor.
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
                            Jence is an open robotics and hardware publishing platform. Read deep technical articles, disclosed research, product launch notes, and field reports from builders across the stack, then support useful work with one-time tips.
                        </p>
                        <a
                            href="/explore"
                            className="inline-flex items-center gap-2 bg-jence-gold text-background font-bold px-8 py-4 rounded-2xl text-lg hover:bg-jence-gold/90 transition-colors"
                        >
                            Explore sections <ArrowRight size={20} />
                        </a>
                    </div>

                    {/* ── STATS ── */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
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
                            <h2 className="text-3xl font-bold tracking-tight mb-3">A global publication for builders</h2>
                            <p className="text-muted-foreground text-lg">Ten engineering sections, open Launch Notes, and a community forum where research and product work can earn support.</p>
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
                        <h2 className="text-3xl font-bold tracking-tight mb-3">How it works</h2>
                        <p className="text-muted-foreground text-lg mb-8">Open submissions, clear disclosure, and tip-based support.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { icon: <Users size={28} />, step: '01', title: 'Read credited authors', body: 'Every profile lists a real-name byline, verification links, and optional affiliation.' },
                                { icon: <FileCheck size={28} />, step: '02', title: 'Track disclosure and credit', body: 'Every article and launch can include article credit, sponsor context, and safety notes where needed.' },
                                { icon: <HandCoins size={28} />, step: '03', title: 'Support useful work', body: 'Readers can reward strong research, disclosed findings, and launch updates with one-time tips.' },
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

                    {/* ── WHY CREDITED ── */}
                    <div className="mb-20 bg-muted/50 p-8 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold tracking-tight mb-4">
                                    Why credited authorship matters in hardware
                                </h2>
                                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                                    Real names and verified credentials drive accountability, reproducibility, and real-world trust. When labs publish under their own reputations, the work travels further and lands with more impact.
                                </p>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Jence keeps the rigor of a technical journal while remaining readable for builders, operators, and decision makers.
                                </p>
                            </div>
                            <div className="flex-shrink-0 flex flex-col gap-3 w-full md:w-56">
                                {['Accountability by design', 'Reproducible methods', 'Responsible disclosure', 'Career credit for builders', 'Trust for buyers'].map((item) => (
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
                        <h2 className="text-3xl font-bold tracking-tight mb-3">Jence vs. typical tech posts</h2>
                        <p className="text-muted-foreground text-lg mb-8">Most technical publishing stops at posting. Jence adds credit, disclosure, and direct community support.</p>
                        <div className="overflow-x-auto rounded-2xl border border-border/50">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                                        <th className="p-4 font-bold text-jence-gold">Jence</th>
                                        <th className="p-4 font-semibold text-muted-foreground">Vendor PR</th>
                                        <th className="p-4 font-semibold text-muted-foreground">General Blogs</th>
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
                                                {row.pr ? <Check size={18} className="mx-auto text-green-500" /> : <X size={18} className="mx-auto text-red-400" />}
                                            </td>
                                            <td className="p-4 text-center">
                                                {row.blogs ? <Check size={18} className="mx-auto text-green-500" /> : <X size={18} className="mx-auto text-red-400" />}
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
                                    <Users size={12} /> For researchers, builders, and launchers
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight mb-4">Publish openly. Get supported.</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                                    If you run experiments, disclose research, design hardware, ship robotics software, or launch products, Jence gives you an open place to publish with credit and earn one-time tips from the community.
                                </p>
                                <ul className="space-y-3 mb-6">
                                    {[
                                        'Open submission flow with no application gate',
                                        'Article credit and disclosure on every post',
                                        'One-time tips on articles and Launch Notes',
                                        'Community support for product launchers',
                                        'Clear safety and responsible disclosure expectations',
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
                                    Start Publishing <ArrowRight size={16} />
                                </a>
                            </div>
                            <div className="flex-shrink-0 p-6 rounded-2xl bg-card border border-border/50 w-full md:w-60">
                                <div className="text-sm text-muted-foreground mb-4 font-medium">Support examples</div>
                                {[
                                    { subs: 'Research note', price: 'Tips enabled', earn: 'Reward useful disclosure' },
                                    { subs: 'Launch Note', price: 'Community support', earn: 'Get backed by readers' },
                                    { subs: 'Field teardown', price: 'Credited publishing', earn: 'Turn work into trust' },
                                ].map((row) => (
                                    <div key={row.subs} className="mb-4 last:mb-0">
                                        <div className="text-xs text-muted-foreground">{row.subs} @ {row.price}</div>
                                        <div className="text-lg font-bold text-jence-gold">{row.earn}</div>
                                        <div className="text-xs text-muted-foreground">Revenue share applies</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── TRUST SIGNALS ── */}
                    <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400 fill-mode-both">
                        <h2 className="text-3xl font-bold tracking-tight mb-3">Built on editorial rigor</h2>
                        <p className="text-muted-foreground text-lg mb-8">Publishing policies that protect readers, vendors, and the wider robotics ecosystem.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: '📋', title: 'Disclosure-first', body: 'Every article includes article credit plus sponsor, vendor, or research context where relevant.' },
                                { icon: '🧯', title: 'Safety policy', body: 'No harmful step-by-step instructions. Mitigations and limits are required.' },
                                { icon: '🔐', title: 'Responsible disclosure', body: 'Security research follows clear vendor contact and timeline requirements.' },
                                { icon: '🚫', title: 'No weaponization', body: 'Weaponization content and export-controlled material are out of scope.' },
                                { icon: '📝', title: 'Corrections policy', body: 'Corrections are transparent and timestamped for long-term credibility.' },
                                { icon: '✅', title: 'Open launch support', body: 'Product launches can be shared with clear disclosure and receive community tips.' },
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
                        <p className="text-muted-foreground text-lg mb-8">Everything you need to know before you publish, tip, or support a launch.</p>
                        <div className="space-y-3">
                            {FAQS.map((faq) => (
                                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                            ))}
                        </div>
                    </div>

                    {/* ── BOTTOM CTA ── */}
                    <div className="text-center p-12 rounded-3xl bg-card border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-foreground">
                            Hardware and robotics, every layer.
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                            Publish research, launch updates, and field work openly, then support what matters with tips.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/explore"
                                className="inline-flex items-center justify-center gap-2 bg-jence-gold text-background font-bold px-8 py-4 rounded-2xl text-lg hover:bg-jence-gold/90 transition-colors"
                            >
                                Explore sections <ArrowRight size={20} />
                            </a>
                            <a
                                href="/register?role=creator"
                                className="inline-flex items-center justify-center gap-2 border border-border/50 text-foreground font-bold px-8 py-4 rounded-2xl text-lg hover:bg-muted/50 transition-colors"
                            >
                                Start publishing
                            </a>
                        </div>
                    </div>

                </div>
            </main>

        </div>
    )
}
