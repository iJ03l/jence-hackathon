import { Shield, Users, Hash, MessageCircle } from 'lucide-react'

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
                        Welcome to the Jence community. We strive to maintain a professional, respectful, and high-quality environment for analysis and discussion.
                    </p>
                </div>

                <div className="space-y-6 mt-12">
                    <div className="card-plug p-6 md:p-8 space-y-8">

                        {/* Section 1 */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Users className="w-5 h-5 text-jence-gold" />
                                1. Respectful Discourse
                            </h2>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                <li>Treat all members with respect. Debate the ideas, not the person.</li>
                                <li>Harassment, hate speech, threats, and personal attacks are strictly prohibited and will result in immediate bans.</li>
                                <li>Maintain a professional tone appropriate for deep market analysis and research.</li>
                            </ul>
                        </div>

                        {/* Section 2 */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-jence-gold" />
                                2. High-Quality Content
                            </h2>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                <li>Discussions should be relevant to markets, crypto, banking, policy, or related economic fields.</li>
                                <li>Avoid low-effort posts, spam, or repetitive content.</li>
                                <li>Do not post misleading information. Clearly distinguish between factual news, personal analysis, and speculation.</li>
                                <li>Do not solicit financial advice or present your opinions as guaranteed financial advice.</li>
                            </ul>
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Hash className="w-5 h-5 text-jence-gold" />
                                3. Organization and Tags
                            </h2>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                <li>Use relevant <span className="text-jence-gold">#hashtags</span> to categorize your posts accurately.</li>
                                <li>Do not abuse or spam trending hashtags if your content is unrelated to the topic.</li>
                                <li>Keep discussions focused and on-topic within specific threads and verticals.</li>
                            </ul>
                        </div>

                        {/* Section 4 */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Shield className="w-5 h-5 text-jence-gold" />
                                4. Self-Promotion & Spam
                            </h2>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                <li>Overt self-promotion, shilling of specific low-cap tokens, and referral links are not allowed in the main community feed.</li>
                                <li>Creators are encouraged to share excerpts of their analysis, but should avoid spamming the feed simply to drive traffic to paywalled content.</li>
                                <li>Malicious links, phishing attempts, or scams will result in a permanent ban and potential reporting to relevant authorities.</li>
                            </ul>
                        </div>

                    </div>

                    <div className="flex flex-col items-center justify-center pt-8 border-t border-border/50">
                        <p className="text-sm text-muted-foreground mb-4 text-center">
                            By participating in the Jence Community, you agree to abide by these guidelines. We reserve the right to remove content and suspend accounts that violate these rules.
                        </p>
                        <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
