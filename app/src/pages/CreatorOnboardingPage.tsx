import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'


export default function CreatorOnboardingPage() {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    const [isSubmitted, setIsSubmitted] = useState(false)
    const [pseudonym, setPseudonym] = useState('')
    const [affiliation, setAffiliation] = useState('')
    const [credentials, setCredentials] = useState('')
    const [location, setLocation] = useState('')
    const [website, setWebsite] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login')
        }
    }, [user, authLoading, navigate])

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login')
        }
    }, [user, authLoading, navigate])

    const handleSubmit = async () => {
        if (!user?.id) return
        setLoading(true)
        setError('')

        try {
            await api.onboardCreator({
                userId: user.id,
                pseudonym,
                affiliation,
                credentials,
                location,
                website,
                verticalId: null,
                selfCertificationSigned: true, // Auto-sign since agreement was removed from UI
            })
            setIsSubmitted(true)
        } catch (err: any) {
            setError(err.message || 'Onboarding failed')
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) return null

    return (
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="max-w-2xl mx-auto">
                {!isSubmitted ? (
                    <div className="card-plug p-8">
                        <h1 className="text-2xl font-bold text-foreground mb-2">Create your author profile</h1>
                        <p className="text-muted-foreground mb-6">
                            Publish under your real name. Add verification links and optional affiliation for credential checks.
                        </p>
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Author name (public byline)</label>
                                <input
                                    type="text"
                                    value={pseudonym}
                                    onChange={(e) => setPseudonym(e.target.value)}
                                    className="input-field"
                                    placeholder="Ada Lovelace"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Pseudonyms are allowed only with editorial approval for safety reasons.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Affiliation (optional)</label>
                                <input
                                    type="text"
                                    value={affiliation}
                                    onChange={(e) => setAffiliation(e.target.value)}
                                    className="input-field"
                                    placeholder="Company, lab, or university"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Verification links (optional)</label>
                                <input
                                    type="text"
                                    value={credentials}
                                    onChange={(e) => setCredentials(e.target.value)}
                                    className="input-field"
                                    placeholder="LinkedIn, GitHub, ORCID (comma-separated)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Location (optional)</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="input-field"
                                    placeholder="City, Country"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Website (optional)</label>
                                <input
                                    type="text"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className="input-field"
                                    placeholder="https://your-site.com"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!pseudonym || loading}
                            className="btn-primary w-full mt-6 justify-center disabled:opacity-50 active:scale-[0.98] transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Creating Profile...
                                </>
                            ) : (
                                'Complete Author Profile'
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="card-plug p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-jence-green/10 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} className="text-jence-green" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">Application submitted!</h1>
                        <p className="text-muted-foreground mb-6">
                            Your creator profile has been created. You can now start publishing content.
                        </p>
                        <button onClick={() => navigate('/dashboard')} className="btn-primary active:scale-[0.97] transition-all">
                            Go to dashboard <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}
