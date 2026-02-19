import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
    const navigate = useNavigate()
    const { signUp } = useAuth()
    const [role, setRole] = useState<'subscriber' | 'creator'>('subscriber')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Password validation logic
    const isPasswordValid =
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*]/.test(password)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!isPasswordValid) {
            setError('Please meet all password requirements')
            return
        }

        setLoading(true)

        const result = await signUp(username, email, password, role)
        if (result.error) {
            setError(result.error)
        } else {
            navigate(role === 'creator' ? '/creator-onboarding' : '/dashboard')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-jence-gold flex items-center justify-center">
                        <Zap size={22} className="text-jence-black" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-foreground">Jence</span>
                </Link>

                {/* Card */}
                <div className="card-plug p-8">
                    <h1 className="text-2xl font-bold text-foreground text-center mb-2">Create account</h1>
                    <p className="text-sm text-muted-foreground text-center mb-6">
                        Join Nigeria's expert analysis platform
                    </p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in">
                            {error}
                        </div>
                    )}

                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('subscriber')}
                            className={`p-4 rounded-xl border text-center transition-all active:scale-[0.97] ${role === 'subscriber'
                                ? 'border-jence-gold bg-jence-gold/10 text-foreground'
                                : 'border-border text-muted-foreground hover:border-jence-gold/50'
                                }`}
                        >
                            <span className="text-2xl block mb-1">📖</span>
                            <span className="text-sm font-medium">Subscriber</span>
                            <p className="text-xs text-muted-foreground mt-1">Access expert content</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('creator')}
                            className={`p-4 rounded-xl border text-center transition-all active:scale-[0.97] ${role === 'creator'
                                ? 'border-jence-gold bg-jence-gold/10 text-foreground'
                                : 'border-border text-muted-foreground hover:border-jence-gold/50'
                                }`}
                        >
                            <span className="text-2xl block mb-1">✍️</span>
                            <span className="text-sm font-medium">Creator</span>
                            <p className="text-xs text-muted-foreground mt-1">Publish analysis</p>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-field !pl-10"
                                    placeholder="username"
                                    required
                                />
                            </div>
                        </div>

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

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field !pl-10 !pr-10"
                                    placeholder="Minimum 8 characters"
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
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create {role} account
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Disclaimer */}
                    <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
                        By creating an account, you agree to Jence's Terms of Service and Privacy Policy.
                        Content on this platform is for informational purposes only.
                    </p>

                    <p className="text-sm text-muted-foreground text-center mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-jence-gold hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
