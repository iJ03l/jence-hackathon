import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Landmark, Shield, Trophy, Bitcoin, Building2,
    Briefcase, Store, Palette, Wheat, Fuel,
    CheckCircle2, FileText, ArrowRight, ArrowLeft, Loader2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

const iconMap: Record<string, any> = {
    Landmark, Shield, Trophy, Bitcoin, Building2,
    Briefcase, Store, Palette, Wheat, Fuel,
}

const SELF_CERT_CLAUSES = [
    'I confirm that my content constitutes personal opinion, independent analysis, or commentary only.',
    'I will not present opinions as guaranteed outcomes or factual predictions.',
    'I will use clear disclaimer language as required by Jence platform policies.',
    'I understand that violation of content policies may result in strikes, suspension, or account termination.',
]

export default function CreatorOnboardingPage() {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [verticals, setVerticals] = useState<any[]>([])
    const [pseudonym, setPseudonym] = useState('')
    const [selectedVertical, setSelectedVertical] = useState('')

    const [certChecks, setCertChecks] = useState<boolean[]>(new Array(SELF_CERT_CLAUSES.length).fill(false))
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login')
        }
    }, [user, authLoading, navigate])

    useEffect(() => {
        api.getVerticals()
            .then(setVerticals)
            .catch(console.error)
    }, [])

    const toggleCert = (i: number) => {
        const next = [...certChecks]
        next[i] = !next[i]
        setCertChecks(next)
    }

    const allCertSigned = certChecks.every(Boolean)

    const handleSubmit = async () => {
        if (!user?.id) return
        setLoading(true)
        setError('')

        try {
            await api.onboardCreator({
                userId: user.id,
                pseudonym,
                verticalId: selectedVertical,
                selfCertificationSigned: true,
            })
            setStep(3)
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
                {/* Progress */}
                <div className="flex items-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-jence-gold' : 'bg-muted'
                                }`}
                        />
                    ))}
                </div>

                {/* Step 1: Profile */}
                {step === 1 && (
                    <div className="card-plug p-8">
                        <h1 className="text-2xl font-bold text-foreground mb-2">Create your creator profile</h1>
                        <p className="text-muted-foreground mb-6">
                            Choose a pseudonym and select your vertical. Your real identity stays private.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Pseudonym</label>
                                <input
                                    type="text"
                                    value={pseudonym}
                                    onChange={(e) => setPseudonym(e.target.value)}
                                    className="input-field"
                                    placeholder="Your anonymous creator name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-3">Select vertical</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {verticals.map((v) => {
                                        const Icon = iconMap[v.iconName] || FileText
                                        return (
                                            <button
                                                key={v.id}
                                                type="button"
                                                onClick={() => setSelectedVertical(v.id)}
                                                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all text-sm active:scale-[0.97] ${selectedVertical === v.id
                                                    ? 'border-jence-gold bg-jence-gold/10'
                                                    : 'border-border hover:border-jence-gold/50'
                                                    }`}
                                            >
                                                <Icon size={18} style={{ color: v.color }} />
                                                <span className="truncate text-foreground">{v.name}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!pseudonym || !selectedVertical}
                            className="btn-primary w-full mt-6 justify-center disabled:opacity-50 active:scale-[0.98] transition-all"
                        >
                            Continue <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {/* Step 2: Self-Certification */}
                {step === 2 && (
                    <div className="card-plug p-8">
                        <h1 className="text-2xl font-bold text-foreground mb-2">Self-certification agreement</h1>
                        <p className="text-muted-foreground mb-6">
                            Please read and agree to the following content standards from Jence's Creator Policy.
                        </p>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            {SELF_CERT_CLAUSES.map((clause, i) => (
                                <label
                                    key={i}
                                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.99] ${certChecks[i]
                                        ? 'border-jence-gold bg-jence-gold/5'
                                        : 'border-border hover:border-jence-gold/30'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={certChecks[i]}
                                        onChange={() => toggleCert(i)}
                                        className="mt-0.5 accent-jence-gold"
                                    />
                                    <span className="text-sm text-foreground">{clause}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center active:scale-[0.97] transition-all">
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!allCertSigned || loading}
                                className="btn-primary flex-1 justify-center disabled:opacity-50 active:scale-[0.98] transition-all"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit application'
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
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
