import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Check if user exists first
            const checkRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/check-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const { exists } = await checkRes.json()

            if (!exists) {
                setError('No account found with that email address')
                setLoading(false)
                return
            }

            const resetRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/request-password-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, redirectTo: `${window.location.origin}/reset-password` }),
            })
            const resetData = await resetRes.json()

            if (!resetRes.ok) {
                setError(resetData.message || 'An error occurred')
            } else {
                setSuccess(true)
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-jence-gold flex items-center justify-center">
                        <Zap size={22} className="text-jence-black" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-foreground">Jence</span>
                </Link>

                <div className="card-plug p-8">
                    {success ? (
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={24} className="text-green-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
                            <p className="text-sm text-muted-foreground mb-6">
                                We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                            </p>
                            <Link to="/login" className="btn-primary w-full justify-center">
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-foreground text-center mb-2">Reset password</h1>
                            <p className="text-sm text-muted-foreground text-center mb-6">
                                Enter your email address and we'll send you a link to reset your password
                            </p>

                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="input-field !pl-10"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Sending link...
                                        </>
                                    ) : (
                                        <>
                                            Send reset link
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 transition-colors">
                                    <ArrowLeft size={14} />
                                    Back to login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
