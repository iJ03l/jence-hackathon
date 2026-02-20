import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Landmark, Shield, Trophy, Bitcoin, Building2,
    Briefcase, Store, Palette, Wheat, Fuel,
    TrendingUp, Clock, Users, FileText, LogOut
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { useWallets, useCreateWallet } from '@privy-io/react-auth/solana'
import CreatorDashboardPage from './CreatorDashboardPage'

const iconMap: Record<string, any> = {
    Landmark, Shield, Trophy, Bitcoin, Building2,
    Briefcase, Store, Palette, Wheat, Fuel,
}

export default function DashboardPage() {
    const { user, loading: authLoading, signOut } = useAuth()
    const navigate = useNavigate()
    const [verticals, setVerticals] = useState<any[]>([])
    const [posts, setPosts] = useState<any[]>([])
    const [loadingPosts, setLoadingPosts] = useState(true)
    const { wallets } = useWallets()
    const { createWallet } = useCreateWallet()

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login')
        }
    }, [user, authLoading, navigate])

    // Provision Privy embedded wallet for users who don't have one yet
    // (e.g. Google OAuth users landing here for the first time)
    useEffect(() => {
        if (!user || authLoading) return
        const hasEmbedded = wallets.some((w: any) => w.walletClientType === 'privy')
        if (!hasEmbedded) {
            createWallet().catch((err) =>
                console.error('Failed to provision embedded wallet:', err)
            )
        }
    }, [user, authLoading, wallets, createWallet])

    useEffect(() => {
        if (user?.role === 'creator') return // Don't fetch feed if creator

        api.getVerticals().then(setVerticals).catch(console.error)
        api.getFeed(user?.id)
            .then(setPosts)
            .catch(console.error)
            .finally(() => setLoadingPosts(false))
    }, [user?.id, user?.role])

    // If user is a creator, show the Creator Dashboard
    if (user?.role === 'creator') {
        return <CreatorDashboardPage />
    }

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-5 h-5 border-2 border-jence-gold/30 border-t-jence-gold rounded-full animate-spin" />
                    Loading...
                </div>
            </div>
        )
    }

    return (
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="max-w-6xl mx-auto flex gap-8">
                {/* Sidebar */}
                <aside className="hidden lg:block w-64 shrink-0">
                    <div className="card-plug p-4 mb-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-jence-gold/20 flex items-center justify-center text-jence-gold font-bold">
                                {user?.name?.[0] || '?'}
                            </div>
                            <div>
                                <p className="font-medium text-foreground text-sm">{user?.name || 'User'}</p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-red-400 transition-colors w-full active:scale-[0.97]"
                        >
                            <LogOut size={14} />
                            Sign out
                        </button>
                    </div>

                    <div className="card-plug p-4">
                        <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">Verticals</h3>
                        <nav className="space-y-1">
                            {verticals.map((v) => {
                                const Icon = iconMap[v.iconName] || TrendingUp
                                return (
                                    <Link
                                        key={v.id}
                                        to={`/verticals/${v.slug}`}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                    >
                                        <Icon size={16} style={{ color: v.color }} />
                                        <span className="truncate">{v.name}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Main Feed */}
                <main className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-foreground">Your Feed</h1>
                        <Link to="/explore" className="text-sm text-jence-gold hover:underline">
                            Explore verticals →
                        </Link>
                    </div>

                    {loadingPosts ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="card-plug p-5">
                                    <div className="animate-pulse">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="h-4 bg-muted rounded w-24" />
                                            <div className="h-3 bg-muted rounded w-16" />
                                        </div>
                                        <div className="h-5 bg-muted rounded w-2/3 mb-2" />
                                        <div className="h-3 bg-muted rounded w-full mb-1" />
                                        <div className="h-3 bg-muted rounded w-4/5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : posts.length > 0 ? (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <article key={post.id} className="card-plug p-5 hover:border-jence-gold/20 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-jence-gold">
                                            {post.creatorPseudonym}
                                        </span>
                                        <span className="text-xs text-muted-foreground">·</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                        {post.isFree && (
                                            <span className="px-2 py-0.5 rounded-full bg-jence-green/10 text-jence-green text-xs">
                                                Free
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-1">{post.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {(post.excerpt || post.content || '').length > 258
                                            ? `${(post.excerpt || post.content || '').substring(0, 258)}...`
                                            : (post.excerpt || post.content || '')}
                                    </p>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="card-plug p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-jence-gold/10 flex items-center justify-center mx-auto mb-4">
                                <FileText size={28} className="text-jence-gold" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-2">Your feed is empty</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Subscribe to creators to start seeing their expert analysis here.
                            </p>
                            <Link to="/explore" className="btn-primary inline-flex active:scale-[0.97] transition-all">
                                <Users size={16} />
                                Explore verticals
                            </Link>
                        </div>
                    )}
                </main>
            </div>
        </section>
    )
}
