import { Shield, Users, AlertTriangle, FileCheck } from 'lucide-react'

export default function CommunityGuidelinesPage() {
    return (
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12 bg-background min-h-screen">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-jence-gold/10 flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-jence-gold" />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground">Community Guidelines</h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        Jence is a robotics and hardware engineering community. Keep discussions precise, safe,
                        and grounded in evidence.
                    </p>
                </div>

                <div className="space-y-6 mt-12">
                    <div className="card-plug p-6 md:p-8 space-y-8">

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Users className="w-5 h-5 text-jence-gold" />
                                1. Professional Discourse
                            </h2>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                <li>Debate ideas, not people. Respect authors and peers.</li>
                                <li>No harassment, hate speech, threats, or personal attacks.</li>
                                <li>Be specific: share methods, measurements, and limitations.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-jence-gold" />
                                2. Safety and Non-Weaponization
                            </h2>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                <li>No step-by-step instructions that enable harm.</li>
                                <li>No weaponization, export-controlled content, or bypassing safety interlocks.</li>
                                <li>Include mitigations and safe operating limits where applicable.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-jence-gold" />
                                3. Responsible Disclosure
                            </h2>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                <li>Security research must follow responsible disclosure timelines.</li>
                                <li>No exploit release details for unpatched vulnerabilities.</li>
                                <li>Disclose methodology and reproduction steps only when safe and coordinated.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Shield className="w-5 h-5 text-jence-gold" />
                                4. Disclosure and Conflicts
                            </h2>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                <li>Always disclose sponsorships, vendor ties, or personal stakes.</li>
                                <li>Reviews and teardowns must include funding and sample provenance.</li>
                                <li>Misleading disclosure is grounds for removal.</li>
                            </ul>
                        </div>

                    </div>

                    <div className="flex flex-col items-center justify-center pt-8 border-t border-border/50">
                        <p className="text-sm text-muted-foreground mb-4 text-center">
                            By participating, you agree to abide by these guidelines. We reserve the right to remove
                            content and suspend accounts that violate these rules.
                        </p>
                        <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
