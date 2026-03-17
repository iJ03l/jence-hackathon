import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authClient } from '../lib/auth-client'
import SEO from '../components/SEO'
import AuthInteractiveBg from '../components/AuthInteractiveBg'

export default function LoginPage() {
    const navigate = useNavigate()
    const { signIn } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await signIn(email, password, rememberMe)
        if (result.error) {
            setError(result.error)
        } else {
            navigate('/dashboard')
        }
        setLoading(false)
    }

    return (
        <div className="h-screen flex w-full relative bg-background overflow-hidden">
            <SEO title="Sign In" url="/login" description="Sign in to your Jence account to access premium articles." />

            {/* Left/Background Panel */}
            <div className="absolute inset-0 md:relative md:flex-1 md:w-1/2 h-full z-0 overflow-hidden border-r border-border/10">
                <AuthInteractiveBg />
            </div>

            {/* Right/Foreground Panel */}
            <div className="flex-1 md:w-1/2 flex flex-col px-8 sm:px-12 md:px-16 lg:px-24 xl:px-32 py-8 z-10 relative bg-transparent md:bg-background md:shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.5)] overflow-y-auto">
                <div className="w-full max-w-sm mx-auto my-auto py-4">
                    {/* Content */}
                    <div className="w-full mt-12 md:mt-0">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 text-center md:text-left">Welcome back</h1>
                        <p className="text-sm text-muted-foreground mb-6 text-center md:text-left">
                            Sign in to access your premium content.
                        </p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-foreground">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-background border border-border/70 rounded-xl px-4 py-3 pl-[2.5rem] focus:outline-none focus:ring-2 focus:ring-jence-gold/30 focus:border-jence-gold shadow-sm transition-all text-sm placeholder:text-muted-foreground/60"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="block text-sm font-semibold text-foreground">Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-background border border-border/70 rounded-xl px-4 py-3 pl-[2.5rem] pr-[2.5rem] focus:outline-none focus:ring-2 focus:ring-jence-gold/30 focus:border-jence-gold shadow-sm transition-all text-sm placeholder:text-muted-foreground/60"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 pb-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input 
                                        type="checkbox" 
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-border/70 bg-background text-jence-gold focus:ring-jence-gold/30 focus:ring-offset-background transition-colors cursor-pointer"
                                    />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
                            </label>
                            
                            <Link to="/forgot-password" className="text-sm font-medium text-jence-gold hover:text-jence-gold/80 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-5">
                        <div className="flex-1 h-px bg-border/60" />
                        <span className="text-xs text-muted-foreground font-medium">or</span>
                        <div className="flex-1 h-px bg-border/60" />
                    </div>

                    <button
                        onClick={async () => {
                            setIsGoogleLoading(true)
                            await authClient.signIn.social({
                                provider: 'google',
                                callbackURL: `${window.location.origin}/dashboard`
                            })
                        }}
                        disabled={isGoogleLoading || loading}
                        className="btn-secondary w-full justify-center py-3 rounded-xl font-medium active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm border-border/70 hover:bg-muted/50"
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

                        <p className="text-sm text-muted-foreground text-center mt-6">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-foreground font-semibold hover:text-jence-gold transition-colors">Create one</Link>
                        </p>
                    </div>

                    <div className="mt-8 flex items-center justify-center md:justify-start gap-4 text-xs text-muted-foreground">
                        <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <span>·</span>
                        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
