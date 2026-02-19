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
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error?: string }>
    signUp: (username: string, email: string, password: string, role: string) => Promise<{ error?: string }>
    signOut: () => Promise<void>
    refreshSession: () => Promise<void>
}

// ... (API_URL and setup remain same)

const AuthContext = createContext<AuthContextType | null>(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const refreshSession = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/get-session`, {
                credentials: 'include',
            })
            if (res.ok) {
                const data = await res.json()
                setUser(data?.user || null)
            } else {
                setUser(null)
            }
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshSession()
    }, [refreshSession])

    const signIn = async (email: string, password: string) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/sign-in/email`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()
            if (!res.ok) {
                return { error: data?.message || 'Login failed' }
            }
            setUser(data?.user || null)
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
            setUser(data?.user || null)
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
            })
        } catch {
            // ignore
        }
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut: handleSignOut, refreshSession }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
