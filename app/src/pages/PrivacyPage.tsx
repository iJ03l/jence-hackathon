import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function PrivacyPage() {
    return (
        <>
            <SEO title="Privacy Policy" url="/privacy" description="Jence Privacy Policy — how we collect, use, and protect your personal data on jence.xyz." />
            <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="max-w-3xl mx-auto prose-custom">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
                    <p className="text-sm text-muted-foreground mb-8">Last updated: February 24, 2026</p>

                    <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">
                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
                            <p>
                                Jence ("we", "us", "our") operates <a href="https://jence.xyz" className="text-jence-gold hover:underline">jence.xyz</a>. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform. We are committed to protecting your privacy and complying with applicable data protection regulations including the General Data Protection Regulation (GDPR).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">2. Information We Collect</h2>

                            <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">2.1 Information You Provide</h3>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li><strong>Account Data:</strong> Name, email address, and password when you register.</li>
                                <li><strong>Profile Data:</strong> Real name byline, avatar (optional), affiliation (optional), and bio.</li>
                                <li><strong>Credentials:</strong> Optional links to LinkedIn, GitHub, or ORCID for verification.</li>
                                <li><strong>Content:</strong> Articles, labs, comments, and ratings you create.</li>
                                <li><strong>Disclosures:</strong> Conflict-of-interest disclosures associated with content.</li>
                                <li><strong>Payment Data:</strong> Subscription preferences and payout settings.</li>
                            </ul>

                            <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">2.2 Automatically Collected</h3>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li><strong>Device &amp; Browser:</strong> IP address, browser type, operating system, and device identifiers.</li>
                                <li><strong>Usage Data:</strong> Pages visited, features used, timestamps, and referral URLs.</li>
                                <li><strong>Cookies:</strong> Session cookies for authentication and preferences. See Section 7.</li>
                            </ul>

                            <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">2.3 Blockchain Data</h3>
                            <p>
                                If you use embedded wallet features, transaction data (wallet addresses, amounts, timestamps) may be recorded on a public blockchain. This data is public and immutable by nature of blockchain technology.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>To create and manage your account and wallet.</li>
                                <li>To process subscriptions and payments.</li>
                                <li>To personalize your experience and deliver relevant content.</li>
                                <li>To communicate with you about your account, updates, and new features.</li>
                                <li>To enforce our Terms of Service and Community Guidelines.</li>
                                <li>To detect and prevent fraud, abuse, and security incidents.</li>
                                <li>To comply with legal obligations.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">4. Data Sharing</h2>
                            <p className="mb-2">We do not sell your personal data. We may share information with:</p>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li><strong>Service Providers:</strong> Hosting, analytics, and infrastructure partners who process data on our behalf under strict confidentiality agreements.</li>
                                <li><strong>Legal Authorities:</strong> When required by law, subpoena, or to protect our legal rights.</li>
                                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">5. Wallet &amp; Key Security</h2>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>Embedded wallet private keys (if enabled) are encrypted using AES-256-GCM and stored securely.</li>
                                <li>Only you can decrypt and export your private key via Settings.</li>
                                <li>We cannot recover private keys if you lose access after exporting them.</li>
                                <li>We recommend storing exported keys in a secure password manager.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">6. Data Retention</h2>
                            <p>
                                We retain your personal data for as long as your account is active or as needed to provide services. Upon account deletion, we will remove your personal data within 30 days, except where retention is required by law or for legitimate business purposes. Blockchain transaction data cannot be deleted due to its immutable nature.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">7. Cookies</h2>
                            <p>
                                We use essential cookies to maintain your authenticated session and remember your preferences. We do not use third-party advertising or tracking cookies. You can disable cookies in your browser settings, but this may impair Platform functionality.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">8. Your Rights (GDPR)</h2>
                            <p className="mb-2">If you are located in the European Economic Area, you have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                                <li><strong>Rectification:</strong> Request correction of inaccurate data.</li>
                                <li><strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten").</li>
                                <li><strong>Restriction:</strong> Request limitation of processing in certain circumstances.</li>
                                <li><strong>Portability:</strong> Request your data in a structured, machine-readable format.</li>
                                <li><strong>Objection:</strong> Object to processing based on legitimate interests.</li>
                            </ul>
                            <p className="mt-3">
                                You can exercise your data rights from the <Link to="/settings" className="text-jence-gold hover:underline">Privacy &amp; Data</Link> section in Settings, or by contacting us at <a href="mailto:hello@jence.xyz" className="text-jence-gold hover:underline">hello@jence.xyz</a>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">9. Children's Privacy</h2>
                            <p>
                                Jence is not intended for individuals under the age of 18. We do not knowingly collect personal data from minors. If we discover that a child under 18 has provided us with personal data, we will delete it promptly.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">10. International Transfers</h2>
                            <p>
                                Your data may be transferred to and processed in countries outside your country of residence. We ensure appropriate safeguards are in place including standard contractual clauses approved by relevant authorities.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">11. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. We encourage you to review this page periodically.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">12. Contact Us</h2>
                            <p>
                                For questions or concerns about this Privacy Policy, contact our Data Protection team at <a href="mailto:hello@jence.xyz" className="text-jence-gold hover:underline">hello@jence.xyz</a>.
                            </p>
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t border-border text-center">
                        <p className="text-xs text-muted-foreground">
                            See also: <Link to="/terms" className="text-jence-gold hover:underline">Terms of Service</Link> · <Link to="/guidelines" className="text-jence-gold hover:underline">Community Guidelines</Link>
                        </p>
                    </div>
                </div>
            </section>
        </>
    )
}
