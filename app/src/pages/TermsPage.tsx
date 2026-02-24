import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function TermsPage() {
    return (
        <>
            <SEO title="Terms of Service" url="/terms" description="Jence Terms of Service — rules and guidelines governing the use of jence.xyz." />
            <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="max-w-3xl mx-auto prose-custom">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
                    <p className="text-sm text-muted-foreground mb-8">Last updated: February 24, 2026</p>

                    <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">
                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using Jence ("the Platform"), accessible at <a href="https://jence.xyz" className="text-jence-gold hover:underline">jence.xyz</a>, you agree to be bound by these Terms of Service. If you do not agree, you must not use the Platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
                            <p>
                                Jence is a subscription-based platform for anonymous expert analysis. Creators publish premium content under pseudonyms, and subscribers pay to access that content. Payments are processed on-chain using USDC on the Solana blockchain.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">3. Eligibility</h2>
                            <p>
                                You must be at least 18 years old to use the Platform. By registering, you represent and warrant that you meet this age requirement and have the legal capacity to enter into a binding agreement.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">4. User Accounts</h2>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>You are responsible for maintaining the confidentiality of your account credentials and wallet private keys.</li>
                                <li>You agree to provide accurate, current, and complete information during registration.</li>
                                <li>Jence reserves the right to suspend or terminate accounts that violate these Terms.</li>
                                <li>Each individual may only maintain one account on the Platform.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">5. Subscriptions &amp; Payments</h2>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>Subscriptions are billed on a 30-day cycle in USDC via the Solana blockchain.</li>
                                <li>When you subscribe to a creator, the payment is processed automatically from your Jence wallet.</li>
                                <li>Renewal payments are processed automatically. You may cancel anytime before the next billing date.</li>
                                <li>Refunds are not available for completed billing cycles.</li>
                                <li>Revenue is split between creators and the Platform as displayed in the creator's settings.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">6. Wallet &amp; Blockchain</h2>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>Jence provisions a managed Solana wallet for each user. Your private key is encrypted and stored securely.</li>
                                <li>You may export your private key at any time via Settings. Once exported, you are solely responsible for its security.</li>
                                <li>Jence is not responsible for any losses resulting from compromised private keys, failed transactions, or blockchain network issues.</li>
                                <li>Gas fees for transactions are sponsored by the Platform's relayer where applicable.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">7. Creator Obligations</h2>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>Creators must provide original, genuine analysis. Plagiarism or fabricated content is prohibited.</li>
                                <li>Creators may not share investment advice that constitutes a regulated financial service without proper licensing.</li>
                                <li>All content must comply with our <Link to="/guidelines" className="text-jence-gold hover:underline">Community Guidelines</Link>.</li>
                                <li>Creators are responsible for applicable taxes on their earnings.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">8. Prohibited Conduct</h2>
                            <p className="mb-2">You agree not to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>Use the Platform for any unlawful purpose or to promote illegal activities.</li>
                                <li>Attempt to reverse-engineer, decompile, or disassemble any part of the Platform.</li>
                                <li>Use bots, scrapers, or automated tools to access the Platform without authorization.</li>
                                <li>Harass, threaten, or abuse other users in any form.</li>
                                <li>Impersonate any person or entity, or falsely represent your affiliation.</li>
                                <li>Attempt to manipulate or exploit the subscription or payment system.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">9. Intellectual Property</h2>
                            <p>
                                All Platform design, logos, and software are owned by Jence. Content posted by creators remains their intellectual property, with Jence granted a non-exclusive license to display and distribute it on the Platform. Subscribers may not reproduce, distribute, or resell creator content without explicit permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">10. Disclaimer of Warranties</h2>
                            <p>
                                The Platform is provided "as is" and "as available" without warranties of any kind, whether express or implied. Jence does not guarantee the accuracy, completeness, or reliability of any content or analysis published by creators. Content on Jence is not financial, legal, or professional advice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">11. Limitation of Liability</h2>
                            <p>
                                To the maximum extent permitted by law, Jence shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including but not limited to loss of profits, data, or cryptocurrency assets.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">12. Modifications</h2>
                            <p>
                                Jence reserves the right to modify these Terms at any time. Changes will be posted on this page with an updated date. Continued use of the Platform after modifications constitutes acceptance of the revised Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">13. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with applicable international commercial law. Any disputes shall be resolved through binding arbitration.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">14. Contact</h2>
                            <p>
                                If you have questions about these Terms, contact us at <a href="mailto:hello@jence.xyz" className="text-jence-gold hover:underline">hello@jence.xyz</a>.
                            </p>
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t border-border text-center">
                        <p className="text-xs text-muted-foreground">
                            See also: <Link to="/privacy" className="text-jence-gold hover:underline">Privacy Policy</Link> · <Link to="/guidelines" className="text-jence-gold hover:underline">Community Guidelines</Link>
                        </p>
                    </div>
                </div>
            </section>
        </>
    )
}
