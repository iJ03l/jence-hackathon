import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authClient } from '../lib/auth-client'
import { api } from '../lib/api'
import AuthInteractiveBg from '../components/AuthInteractiveBg'

export default function RegisterPage() {
    const navigate = useNavigate()
    const { signUp } = useAuth()
    
    // Read from localStorage if coming from onboarding
    const initialRole = (localStorage.getItem('jence_role') as 'subscriber' | 'creator') || 'subscriber'
    
    const [role, setRole] = useState<'subscriber' | 'creator'>(initialRole)
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)

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
            // Provision empty embedded wallet seamlessly upon signup
            try {
                await api.createWallet()
            } catch (err) {
                console.error("Failed to provision embedded wallet:", err)
            }
            
            // Sync onboarding metadata
            try {
                const storedVerticals = localStorage.getItem('jence_verticals')
                if (storedVerticals) {
                    await api.saveOnboardingData({
                        role,
                        verticals: JSON.parse(storedVerticals)
                    })
                    localStorage.removeItem('jence_verticals')
                    localStorage.removeItem('jence_role')
                    localStorage.removeItem('jence_onboarded')
                }
            } catch (err) {
               console.error("Failed to sync onboarding data:", err)
            }
            
            navigate(role === 'creator' ? '/creator-onboarding' : '/dashboard')
        }
        setLoading(false)
    }

    return (
        <div className="h-screen flex w-full relative bg-background overflow-hidden">
            {/* Left/Background Panel */}
            <div className="absolute inset-0 md:relative md:flex-1 md:w-1/2 h-full z-0 overflow-hidden border-r border-border/10">
                <AuthInteractiveBg />
            </div>

            {/* Right/Foreground Panel */}
            <div className="flex-1 md:w-1/2 flex flex-col items-center px-6 py-12 z-10 relative bg-transparent md:bg-background md:shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.5)] overflow-y-auto mt-12 md:mt-0">
                <div className="w-full max-w-[360px] my-auto">
                    {/* Content */}
                    <div className="w-full">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-center md:text-left">Create account</h1>
                        <p className="text-sm md:text-base text-muted-foreground mb-8 text-center md:text-left">
                            Join the robotics and hardware engineering publication
                        </p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in">
                            {error}
                        </div>
                    )}

                    {/* Simple Role Toggle */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="p-1 max-w-[240px] w-full bg-muted border border-border/50 rounded-full flex items-center mb-3">
                            <button
                                type="button"
                                onClick={() => setRole('subscriber')}
                                className={`flex-1 py-1.5 px-4 rounded-full text-sm font-medium transition-all duration-300 ${role === 'subscriber'
                                    ? 'bg-jence-gold text-jence-black shadow-md scale-100'
                                    : 'text-muted-foreground hover:text-foreground scale-95'
                                    }`}
                            >
                                Reader
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('creator')}
                                className={`flex-1 py-1.5 px-4 rounded-full text-sm font-medium transition-all duration-300 ${role === 'creator'
                                    ? 'bg-jence-gold text-jence-black shadow-md scale-100'
                                    : 'text-muted-foreground hover:text-foreground scale-95'
                                    }`}
                            >
                                Author
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            {role === 'subscriber'
                                ? 'Read technical articles, issues, and labs'
                                : 'Publish credited engineering work and build your audience'}
                        </p>
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
                                    Create {role === 'subscriber' ? 'reader' : 'author'} account
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
                        By creating an account, you agree to Jence's Terms of Service and Privacy Policy.
                        Content on this platform is for informational purposes only.
                    </p>

                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">or</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    <button
                        onClick={async () => {
                            localStorage.setItem('intendedRole', role)
                            setIsGoogleLoading(true)
                            await authClient.signIn.social({
                                provider: 'google',
                                callbackURL: `${window.location.origin}/dashboard`
                            })
                        }}
                        disabled={isGoogleLoading || loading}
                        className="btn-secondary w-full justify-center active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isGoogleLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin mr-2" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </button>

                        <p className="text-sm text-muted-foreground text-center mt-8">
                            Already have an account?{' '}
                            <Link to="/login" className="text-foreground font-semibold hover:text-jence-gold transition-colors">Sign in</Link>
                        </p>
                    </div>

                    <div className="mt-12 flex items-center justify-center md:justify-start gap-4 text-xs text-muted-foreground">
                        <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <span>·</span>
                        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
