import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function TermsPage() {
    return (
        <>
            <SEO title="Terms of Service" url="/terms" description="Jence Terms of Service for robotics and hardware engineering publication." />
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
                                Jence is a robotics and hardware engineering publication. Authors publish credited technical articles, labs, teardowns, and research notes. Subscribers pay to access premium content, and a free community forum supports discussion and Q&A.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">3. Eligibility</h2>
                            <p>
                                You must be at least 18 years old to use the Platform. By registering, you represent and warrant that you meet this age requirement and have the legal capacity to enter into a binding agreement.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">4. Author Identity and Credentials</h2>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>Authors publish under their real names by default.</li>
                                <li>Credentials (LinkedIn, GitHub, ORCID) may be requested for verification.</li>
                                <li>Pseudonyms are allowed only in exceptional cases with editorial approval.</li>
                                <li>Affiliations and locations are optional and must be accurate if provided.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">5. Disclosures and Conflicts of Interest</h2>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>Every article must include a conflict-of-interest disclosure.</li>
                                <li>Sponsorships, vendor relationships, or personal stakes must be stated clearly.</li>
                                <li>Failure to disclose conflicts may result in removal or account suspension.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">6. Safety and Responsible Disclosure</h2>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>No dangerous step-by-step instructions that enable harm.</li>
                                <li>No export-controlled or weaponization content.</li>
                                <li>Security research must follow responsible disclosure timelines.</li>
                                <li>Unsafe or exploitative content will be removed.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">7. Subscriptions and Payments</h2>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>Subscriptions are billed on a recurring cycle as shown at checkout.</li>
                                <li>Authors set pricing for their premium content.</li>
                                <li>Renewal payments are processed automatically unless canceled.</li>
                                <li>Refunds are not available for completed billing cycles.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">8. Intellectual Property</h2>
                            <p>
                                Content posted by authors remains their intellectual property, with Jence granted a non-exclusive license to display and distribute it on the Platform. Subscribers may not reproduce or redistribute content without permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">9. Prohibited Conduct</h2>
                            <p className="mb-2">You agree not to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>Use the Platform for unlawful purposes or unsafe activity.</li>
                                <li>Publish false disclosures or misrepresent credentials.</li>
                                <li>Attempt to bypass subscription or security controls.</li>
                                <li>Harass, threaten, or abuse other users.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">10. Disclaimer of Warranties</h2>
                            <p>
                                The Platform is provided "as is" without warranties. Jence does not certify that content is safe for deployment in any environment. Always validate in controlled settings and follow applicable standards.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">11. Limitation of Liability</h2>
                            <p>
                                To the maximum extent permitted by law, Jence shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">12. Modifications</h2>
                            <p>
                                Jence reserves the right to modify these Terms at any time. Changes will be posted on this page with an updated date. Continued use constitutes acceptance of the revised Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-foreground mb-3">13. Governing Law</h2>
                            <p>
                                These Terms shall be governed by applicable international commercial law. Any disputes shall be resolved through binding arbitration.
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
