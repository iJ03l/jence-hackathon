import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Users, Activity, Loader2, Search, ShieldAlert, ShieldCheck, DollarSign, FileText, LogOut, Rocket, CheckCircle, XCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import SEO from '../components/SEO'
import { Link } from 'react-router-dom'

export default function AdminDashboardPage() {
    const { user, loading: authLoading, signIn, signOut } = useAuth()
    const [loginUsername, setLoginUsername] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [loginError, setLoginError] = useState('')
    const [loggingIn, setLoggingIn] = useState(false)

    // Admin state
    const [metrics, setMetrics] = useState<any>(null)
    const [topArticles, setTopArticles] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [launches, setLaunches] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loadingData, setLoadingData] = useState(false)
    const [errorData, setErrorData] = useState('')
    const [usersVisible, setUsersVisible] = useState(10)
    
    // Chart state
    const [chartInterval, setChartInterval] = useState('7d')
    const [historyData, setHistoryData] = useState<any[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    
    // Review launch state
    const [reviewingLaunch, setReviewingLaunch] = useState<any>(null)
    const [reviewNote, setReviewNote] = useState('')
    const [reviewingStatus, setReviewingStatus] = useState<string | null>(null)

    // Login logic
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (loginUsername !== 'yakoob') {
            setLoginError('Invalid access attempt logged.')
            return
        }
        
        setLoggingIn(true)
        setLoginError('')

        try {
            // Map the username to the email it was seeded with
            await signIn('yorxsm@gmail.com', loginPassword)
        } catch (err: any) {
            setLoginError(err.message || 'Access Denied')
        } finally {
            setLoggingIn(false)
        }
    }

    // Fetch data if admin
    useEffect(() => {
        if (!user || user.role !== 'admin') return

        const fetchData = async () => {
            setLoadingData(true)
            setErrorData('')
            try {
                // We run requests independently to handle failures, though parallel is fine
                await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/metrics`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('jence_session') || ''}` },
                    credentials: 'omit' // the JWT logic inside better-auth or custom headers if you have it
                })
                // Actually, API utility handles the baseUrl and fetch logic smoothly:
                const metricsData = await api.getAdminMetrics()
                const usersData = await api.getAdminUsers(searchQuery)
                const launchesData = await api.getLaunches() // fetch all launches for admin
                
                setMetrics(metricsData.metrics)
                setTopArticles(metricsData.topArticles || [])
                setUsers(usersData.users || [])
                setLaunches(launchesData || [])

            } catch (err: any) {
                setErrorData('Failed to load admin data. ' + err.message)
            } finally {
                setLoadingData(false)
            }
        }

        // Add a debounce effect for search
        const timeoutId = setTimeout(fetchData, 300)
        return () => clearTimeout(timeoutId)

    }, [user, searchQuery])

    // Fetch history when interval changes
    useEffect(() => {
        if (!user || user.role !== 'admin') return
        const fetchHistory = async () => {
            setLoadingHistory(true)
            try {
                const res = await api.getAdminMetricsHistory(chartInterval)
                setHistoryData(res.history || [])
            } catch (err) {
                console.error("Failed to load history metrics")
            } finally {
                setLoadingHistory(false)
            }
        }
        fetchHistory()
    }, [user, chartInterval])

    // Toggle ban
    const handleToggleBan = async (userId: string, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'unban' : 'ban'} this user?`)) return

        try {
            await api.toggleUserBan(userId, !currentStatus)
            setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !currentStatus } : u))
        } catch (error) {
            alert('Failed to toggle ban')
        }
    }

    // Review Launch
    const handleReviewLaunch = async (status: 'approved' | 'rejected') => {
        if (!reviewingLaunch) return
        setReviewingStatus(status)
        try {
            const res = await api.reviewLaunch(reviewingLaunch.id, status, reviewNote)
            setLaunches(launches.map(l => l.id === reviewingLaunch.id ? res.launch : l))
            setReviewingLaunch(null)
            setReviewNote('')
        } catch (error: any) {
            alert('Failed to review launch: ' + error.message)
        } finally {
            setReviewingStatus(null)
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="flex items-center gap-3 text-red-500 font-mono text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    INITIALIZING 0x000...
                </div>
            </div>
        )
    }

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
                <SEO title="System Terminal // 0x000" noIndex />
                {/* Hacker background elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.1)_0,transparent_50%)] pointer-events-none" />
                <div className="absolute top-0 w-full h-[1px] bg-red-500/20 shadow-[0_0_10px_rgba(255,0,0,0.5)] z-[-1]" />
                <div className="absolute bottom-0 w-full h-[1px] bg-red-500/20 shadow-[0_0_10px_rgba(255,0,0,0.5)] z-[-1]" />

                <div className="w-full max-w-sm card-plug border-red-500/30 bg-black/80 backdrop-blur p-8 shadow-2xl relative">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 bg-red-500/10 border border-red-500/50 rounded-full flex items-center justify-center mb-4 text-red-500">
                            <ShieldAlert size={24} />
                        </div>
                        <h1 className="text-xl font-mono font-bold text-red-500 tracking-wider">RESTRICTED_ACCESS</h1>
                        <p className="text-xs font-mono text-red-500/50 mt-2 text-center">// Auth required for 0x000</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                value={loginUsername}
                                onChange={(e) => setLoginUsername(e.target.value)}
                                placeholder="IDENTIFIER"
                                className="w-full bg-black border border-red-500/30 rounded focus:border-red-500 p-3 text-red-500 font-mono text-sm placeholder:text-red-500/30 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="KEYPHRASE"
                                className="w-full bg-black border border-red-500/30 rounded focus:border-red-500 p-3 text-red-500 font-mono text-sm placeholder:text-red-500/30 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                                required
                            />
                        </div>

                        {loginError && (
                            <div className="text-xs font-mono text-white bg-red-500 px-3 py-2 rounded animate-pulse text-center">
                                ERR: {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loggingIn || !loginUsername || !loginPassword}
                            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded p-3 font-mono text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center disabled:opacity-50"
                        >
                            {loggingIn ? (
                                <>
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                    VERIFYING
                                </>
                            ) : (
                                'AUTHENTICATE'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12 min-h-screen bg-[#0a0a0a] text-zinc-300 selection:bg-red-500/30">
            <SEO title="Admin // 0x000" noIndex />
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Admin Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-plug border-zinc-800 bg-black p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center border border-red-500/20">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-mono font-bold text-white flex items-center gap-2">
                                0x000 OVERSEER
                                <span className="px-2 py-0.5 rounded bg-red-500 text-black text-[10px] uppercase font-black tracking-widest">Live</span>
                            </h1>
                            <p className="text-xs font-mono text-zinc-500 mt-1">Authorized as {user.name} ({user.email})</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => signOut()} 
                        className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-zinc-500 hover:text-red-500 transition-colors px-4 py-2 rounded-lg border border-zinc-800 hover:border-red-500/50 bg-zinc-900/50"
                    >
                        <LogOut size={14} />
                        TERMINATE SESSION
                    </button>
                </header>

                {errorData && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono text-sm">
                        {errorData}
                    </div>
                )}

                {/* Metrics Grid */}
                {metrics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="card-plug border-zinc-800 bg-black p-5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Total Users</h3>
                                <Users size={16} className="text-zinc-400" />
                            </div>
                            <p className="text-3xl font-mono font-bold text-white">{metrics.totalUsers}</p>
                        </div>
                        <div className="card-plug border-zinc-800 bg-black p-5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Creators</h3>
                                <FileText size={16} className="text-zinc-400" />
                            </div>
                            <p className="text-3xl font-mono font-bold text-white">{metrics.totalCreators}</p>
                        </div>
                        <div className="card-plug border-zinc-800 bg-black p-5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Tipped Value</h3>
                                <DollarSign size={16} className="text-jence-gold" />
                            </div>
                            <p className="text-3xl font-mono font-bold text-jence-gold">
                                ${parseFloat(metrics.amountTipped || 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="card-plug border-zinc-800 bg-black p-5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Page Views (Est)</h3>
                                <Activity size={16} className="text-zinc-400" />
                            </div>
                            <p className="text-3xl font-mono font-bold text-white">{metrics.pageViews.toLocaleString()}</p>
                        </div>
                    </div>
                )}

                {/* Charts Area */}
                {historyData.length > 0 && (
                    <div className="card-plug border-zinc-800 bg-black p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Activity size={16} />
                                Platform Growth
                            </h2>
                            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                                {['24h', '7d', 'all'].map(interval => (
                                    <button
                                        key={interval}
                                        onClick={() => setChartInterval(interval)}
                                        className={`px-4 py-1.5 text-xs font-mono font-bold uppercase transition-colors ${
                                            chartInterval === interval 
                                                ? 'bg-zinc-800 text-white' 
                                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                                        }`}
                                    >
                                        {interval === 'all' ? 'All Time' : interval}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loadingHistory ? (
                            <div className="h-64 flex items-center justify-center">
                                <Loader2 size={24} className="animate-spin text-zinc-600" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-64">
                                <div className="h-full">
                                    <p className="text-xs font-mono text-zinc-500 mb-2">Total Users</p>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={historyData}>
                                            <defs>
                                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="timestamp" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                                            <RechartsTooltip 
                                                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
                                                labelStyle={{ color: '#a1a1aa', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}
                                            />
                                            <Area type="monotone" dataKey="users" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="h-full">
                                    <p className="text-xs font-mono text-zinc-500 mb-2">Tipped Volume (USDC)</p>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={historyData}>
                                            <defs>
                                                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="timestamp" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                                            <RechartsTooltip 
                                                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                                                itemStyle={{ color: '#eab308', fontSize: '12px', fontFamily: 'monospace' }}
                                                labelStyle={{ color: '#a1a1aa', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}
                                            />
                                            <Area type="monotone" dataKey="volume" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Top Articles List */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            Top Articles
                        </h2>
                        
                        <div className="card-plug border-zinc-800 bg-black overflow-hidden divide-y divide-zinc-800">
                            {!topArticles.length && loadingData ? (
                                <div className="p-8 text-center text-zinc-500 font-mono text-xs flex justify-center"><Loader2 size={16} className="animate-spin" /></div>
                            ) : topArticles.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 font-mono text-xs">NO ARTICLES RECORDED</div>
                            ) : (
                                topArticles.map((article: any, i: number) => (
                                    <div key={article.id} className="p-4 hover:bg-zinc-900/50 transition-colors flex items-start gap-4">
                                        <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center font-mono text-xs font-bold text-zinc-500 shrink-0">
                                            #{i + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <Link to={`/post/${article.id}`} className="text-sm font-medium text-white hover:text-red-400 transition-colors inline-block mb-1 line-clamp-2">
                                                {article.title}
                                            </Link>
                                            <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                                                <span className="truncate pr-4">By {article.creatorPseudonym || 'Unknown'}</span>
                                                <span className="shrink-0 font-bold text-jence-gold">{article.likes} pts</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* User Directory */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Users size={16} />
                                User Directory
                            </h2>
                            <div className="relative w-full sm:w-64">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search users..."
                                    className="w-full bg-black border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-sm font-mono text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
                                />
                            </div>
                        </div>

                        <div className="card-plug border-zinc-800 bg-black overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-800 text-xs font-mono text-zinc-500 uppercase tracking-wider bg-zinc-900/50">
                                        <th className="p-4 font-medium">User</th>
                                        <th className="p-4 font-medium">Email</th>
                                        <th className="p-4 font-medium">Role</th>
                                        <th className="p-4 font-medium text-right">Status</th>
                                        <th className="p-4 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800 font-mono text-sm">
                                    {users.length === 0 && loadingData ? (
                                        <tr><td colSpan={5} className="p-8 text-center"><Loader2 size={16} className="animate-spin mx-auto text-zinc-500" /></td></tr>
                                    ) : users.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No matching users found.</td></tr>
                                    ) : (
                                        users.slice(0, usersVisible).map((u: any) => (
                                            <tr key={u.id} className="hover:bg-zinc-900/30 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold shrink-0">
                                                            {u.name?.[0]?.toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-white truncate max-w-[150px]">{u.name}</p>
                                                            <p className="text-xs text-zinc-500 truncate mt-0.5">
                                                                @{u.username || 'user'} {u.pseudonym && `(${u.pseudonym})`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-zinc-400">{u.email}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                                        u.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                                                        u.role === 'creator' ? 'bg-jence-gold/10 text-jence-gold' :
                                                        'bg-zinc-800 text-zinc-400'
                                                    }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {u.isBanned ? (
                                                        <span className="inline-flex items-center gap-1 text-red-500 text-xs font-semibold">
                                                            <ShieldAlert size={12} /> BANNED
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-green-500 text-xs font-semibold">
                                                            <ShieldCheck size={12} /> ACTIVE
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {u.role !== 'admin' && (
                                                        <button 
                                                            onClick={() => handleToggleBan(u.id, u.isBanned)}
                                                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                                                                u.isBanned 
                                                                    ? 'bg-zinc-800 hover:bg-zinc-700 text-white' 
                                                                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 opacity-0 group-hover:opacity-100'
                                                            }`}
                                                        >
                                                            {u.isBanned ? 'UNBAN' : 'BAN'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            
                            {users.length > usersVisible && (
                                <div className="p-4 border-t border-zinc-800 text-center">
                                    <button 
                                        onClick={() => setUsersVisible(prev => prev + 10)}
                                        className="text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 hover:bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-800"
                                    >
                                        LOAD MORE ({Math.min(10, users.length - usersVisible)} REMAINING)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Launches Directory */}
                <div className="space-y-4">
                    <h2 className="text-sm font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Rocket size={16} />
                        Launch Notes Registry
                    </h2>

                    <div className="card-plug border-zinc-800 bg-black overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800 text-xs font-mono text-zinc-500 uppercase tracking-wider bg-zinc-900/50">
                                    <th className="p-4 font-medium">Launch</th>
                                    <th className="p-4 font-medium">Author</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800 font-mono text-sm">
                                {launches.length === 0 && loadingData ? (
                                    <tr><td colSpan={4} className="p-8 text-center"><Loader2 size={16} className="animate-spin mx-auto text-zinc-500" /></td></tr>
                                ) : launches.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-zinc-500">No launches submitted.</td></tr>
                                ) : (
                                    launches.map((l: any) => (
                                        <tr key={l.id} className="hover:bg-zinc-900/30 transition-colors">
                                            <td className="p-4">
                                                <div className="min-w-0 max-w-[300px]">
                                                    <p className="font-bold text-white truncate">{l.name}</p>
                                                    <p className="text-xs text-zinc-500 truncate mt-0.5">{l.company}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 text-zinc-400 text-xs">
                                                {l.authorName} <br/> <span className="opacity-50">@{l.authorPseudonym || l.authorUsername}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                                    l.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                                    l.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-jence-gold/10 text-jence-gold'
                                                }`}>
                                                    {l.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => { setReviewingLaunch(l); setReviewNote(l.reviewNote || '') }}
                                                    className="px-3 py-1.5 rounded text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-all"
                                                >
                                                    REVIEW
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Review Launch Modal */}
            {reviewingLaunch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur p-4">
                    <div className="w-full max-w-lg card-plug border-zinc-800 bg-[#0a0a0a] shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                            <h3 className="font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Rocket size={16} className="text-red-500" />
                                Review Launch Note
                            </h3>
                            <button onClick={() => setReviewingLaunch(null)} className="text-zinc-500 hover:text-white transition-colors">
                                <XCircle size={18} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[60vh]">
                            <div>
                                <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Product</p>
                                <p className="font-bold text-white text-lg">{reviewingLaunch.name} <span className="text-sm font-normal text-zinc-400">by {reviewingLaunch.company}</span></p>
                            </div>
                            
                            <div>
                                <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Summary</p>
                                <p className="text-sm text-zinc-300 bg-black border border-zinc-800 p-3 rounded">{reviewingLaunch.summary}</p>
                            </div>

                            {reviewingLaunch.disclosure && (
                                <div>
                                    <p className="text-xs font-mono text-red-500/80 uppercase tracking-wider mb-1">Disclosure</p>
                                    <p className="text-sm text-zinc-300 bg-red-500/5 border border-red-500/20 p-3 rounded">{reviewingLaunch.disclosure}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Admin Review Note (Sent via Email)</p>
                                <textarea 
                                    value={reviewNote}
                                    onChange={e => setReviewNote(e.target.value)}
                                    placeholder="Provide reasoning for rejection, or a congratulatory note for approval..."
                                    className="w-full h-24 bg-black border border-zinc-800 rounded p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 resize-none font-mono"
                                />
                            </div>
                        </div>

                        <div className="p-5 border-t border-zinc-800 bg-zinc-900/50 flex gap-3">
                            <button 
                                onClick={() => handleReviewLaunch('rejected')}
                                disabled={!!reviewingStatus}
                                className="flex-1 px-4 py-2 border border-red-500/50 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {reviewingStatus === 'rejected' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                REJECT
                            </button>
                            <button 
                                onClick={() => handleReviewLaunch('approved')}
                                disabled={!!reviewingStatus}
                                className="flex-1 px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-500 hover:bg-green-500/30 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {reviewingStatus === 'approved' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                APPROVE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
