import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    // Password validation logic (same as RegisterPage)
    const isPasswordValid =
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*]/.test(password)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (!isPasswordValid) {
            setError('Please meet all password requirements')
            return
        }

        setLoading(true)
        setError('')

        try {
            const resetRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword: password, token }),
            })
            const resetData = await resetRes.json()

            if (!resetRes.ok) {
                setError(resetData.message || 'An error occurred')
            } else {
                setSuccess(true)
                setTimeout(() => navigate('/login'), 3000)
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
                    <img src="/logo.png" alt="Jence Logo" className="w-10 h-10 object-contain rounded-xl" />
                    <span className="font-bold text-xl tracking-tight text-foreground">Jence</span>
                </Link>

                <div className="card-plug p-8">
                    {success ? (
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={24} className="text-green-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground mb-2">Password reset!</h1>
                            <p className="text-sm text-muted-foreground mb-6">
                                Your password has been successfully reset. Redirecting to login...
                            </p>
                            <Link to="/login" className="btn-primary w-full justify-center">
                                Go to login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-foreground text-center mb-2">Set new password</h1>
                            <p className="text-sm text-muted-foreground text-center mb-6">
                                Please enter your new password below
                            </p>

                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="input-field !pl-10 !pr-10"
                                            placeholder="At least 8 characters"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Strength Checklist */}
                                {password && (
                                    <div className="mt-3 p-3 rounded-lg bg-muted/40 space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">Password strength:</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className={`flex items-center gap-1.5 text-xs ${password.length >= 8 ? 'text-jence-green' : 'text-muted-foreground/60'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-jence-green' : 'bg-current'}`} />
                                                8+ characters
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-xs ${/[A-Z]/.test(password) ? 'text-jence-green' : 'text-muted-foreground/60'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-jence-green' : 'bg-current'}`} />
                                                Uppercase letter
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-xs ${/[0-9]/.test(password) ? 'text-jence-green' : 'text-muted-foreground/60'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-jence-green' : 'bg-current'}`} />
                                                Number
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-xs ${/[!@#$%^&*]/.test(password) ? 'text-jence-green' : 'text-muted-foreground/60'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${/[!@#$%^&*]/.test(password) ? 'bg-jence-green' : 'bg-current'}`} />
                                                Special char
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="input-field !pl-10"
                                            placeholder="Repeat password"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !isPasswordValid || password !== confirmPassword}
                                    className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Resetting...
                                        </>
                                    ) : (
                                        <>
                                            Reset password
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
