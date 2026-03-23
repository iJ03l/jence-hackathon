import { api } from '../lib/api'
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
    walletBalance: number
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
    const [walletBalance, setWalletBalance] = useState(0)
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
                        const walletData = await api.getWalletMe()
                        setWalletAddress(walletData?.address || null)
                        setWalletBalance(Number(walletData?.usdcBalance || 0))
                    } catch (e) {
                        console.error('Failed to fetch wallet address', e)
                        setWalletBalance(0)
                    }
                } else {
                    setWalletAddress(null)
                    setWalletBalance(0)
                }
            } else {
                setUser(null)
                setWalletAddress(null)
                setWalletBalance(0)
            }
        } catch {
            setUser(null)
            setWalletAddress(null)
            setWalletBalance(0)
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
        setWalletBalance(0)
    }

    return (
        <AuthContext.Provider value={{ user, walletAddress, walletBalance, loading, signIn, signUp, signOut: handleSignOut, refreshSession }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
