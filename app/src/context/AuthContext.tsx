import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface User {
    id: string
    name: string
    username: string
    email: string
    role?: string
    image?: string
}

interface AuthContextType {
    user: User | null
    walletAddress: string | null
    loading: boolean
    signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: string }>
    signUp: (username: string, email: string, password: string, role: string) => Promise<{ error?: string }>
    signOut: () => Promise<void>
    refreshSession: () => Promise<void>
}

// ... (API_URL and setup remain same)

const AuthContext = createContext<AuthContextType | null>(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [walletAddress, setWalletAddress] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const refreshSession = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/get-session`, {
                credentials: 'include',
            })
            if (res.ok) {
                let data = await res.json()
                let fetchedUser = data?.user || null

                if (fetchedUser) {
                    try {
                        const storedVerticals = localStorage.getItem('jence_verticals')
                        const storedRole = localStorage.getItem('intendedRole') || localStorage.getItem('jence_role')
                        
                        if (storedVerticals || storedRole) {
                            const { api } = await import('../lib/api')
                            await api.saveOnboardingData({
                                role: storedRole || undefined,
                                verticals: storedVerticals ? JSON.parse(storedVerticals) : undefined
                            })
                            localStorage.removeItem('jence_verticals')
                            localStorage.removeItem('jence_role')
                            localStorage.removeItem('intendedRole')
                            localStorage.removeItem('jence_onboarded')
                            
                            // Re-fetch to get updated role/data
                            const newRes = await fetch(`${API_URL}/api/auth/get-session`, { credentials: 'include' })
                            if (newRes.ok) {
                                data = await newRes.json()
                                fetchedUser = data?.user || null
                            }
                        }
                    } catch (e) {
                         console.error("Failed to sync onboarding data", e)
                    }

                    setUser(fetchedUser)

                    try {
                        const walletRes = await fetch(`${API_URL}/api/wallet/me`, { credentials: 'include' })
                        if (walletRes.ok) {
                            const walletData = await walletRes.json()
                            setWalletAddress(walletData?.address || null)
                        }
                    } catch (e) {
                        console.error('Failed to fetch wallet address', e)
                    }
                } else {
                    setWalletAddress(null)
                }
            } else {
                setUser(null)
                setWalletAddress(null)
            }
        } catch {
            setUser(null)
            setWalletAddress(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshSession()
    }, [refreshSession])

    const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/sign-in/email`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, rememberMe }),
            })
            const data = await res.json()
            if (!res.ok) {
                return { error: data?.message || 'Login failed' }
            }
            await refreshSession()
            return {}
        } catch {
            return { error: 'Network error. Please try again.' }
        }
    }

    const signUp = async (username: string, email: string, password: string, role: string) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/sign-up/email`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                // We send username as 'name' as well since it's required by default schema,
                // and also as 'username' for our custom field.
                body: JSON.stringify({ name: username, username, email, password, role }),
            })
            const data = await res.json()
            if (!res.ok) {
                return { error: data?.message || 'Registration failed' }
            }
            await refreshSession()
            return {}
        } catch {
            return { error: 'Network error. Please try again.' }
        }
    }

    const handleSignOut = async () => {
        try {
            await fetch(`${API_URL}/api/auth/sign-out`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })
        } catch {
            // ignore
        }
        setUser(null)
        setWalletAddress(null)
    }

    return (
        <AuthContext.Provider value={{ user, walletAddress, loading, signIn, signUp, signOut: handleSignOut, refreshSession }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
