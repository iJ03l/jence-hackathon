import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Users, Activity, Loader2, Search, ShieldAlert, ShieldCheck, DollarSign, FileText, LogOut, Rocket, CheckCircle, XCircle } from 'lucide-react'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import SEO from '../components/SEO'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function AdminDashboardPage() {
    const { user, loading: authLoading, signIn, signOut } = useAuth()
    const { theme } = useTheme()
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

    const isDark = theme === 'dark'
    const shellClass = isDark ? 'bg-[#0a0a0a] text-zinc-300 selection:bg-red-500/30' : 'bg-stone-50 text-stone-700 selection:bg-red-500/20'
    const panelClass = isDark ? 'border-zinc-800 bg-black' : 'border-stone-200 bg-white shadow-sm'
    const panelMutedClass = isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-stone-200 bg-stone-100/80'
    const strongTextClass = isDark ? 'text-white' : 'text-stone-950'
    const mutedTextClass = isDark ? 'text-zinc-500' : 'text-stone-500'
    const softTextClass = isDark ? 'text-zinc-400' : 'text-stone-600'
    const inputClass = isDark
        ? 'bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:ring-red-500/20'
        : 'bg-white border-stone-300 text-stone-950 placeholder:text-stone-400 focus:border-red-500/40 focus:ring-red-500/15'

    const chartData = Array.isArray(historyData)
        ? historyData
            .map((point) => ({
                timestamp: typeof point?.timestamp === 'string' ? point.timestamp : '',
                users: Number.isFinite(Number(point?.users)) ? Number(point.users) : 0,
                volume: Number.isFinite(Number(point?.volume)) ? Number(point.volume) : 0,
            }))
            .filter((point) => point.timestamp.length > 0)
        : []

    const getLaunchStatusClasses = (status: string) =>
        status === 'approved'
            ? 'bg-green-500/10 text-green-500'
            : status === 'rejected'
                ? 'bg-red-500/10 text-red-500'
                : 'bg-jence-gold/10 text-jence-gold'

    const openLaunchReview = (launch: any) => {
        setReviewingLaunch(launch)
        setReviewNote(launch.reviewNote || '')
    }

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
                const [metricsData, usersData, launchesData] = await Promise.all([
                    api.getAdminMetrics(),
                    api.getAdminUsers(searchQuery),
                    api.getLaunches(),
                ])
                
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
            setLaunches(launches.map(l => l.id === reviewingLaunch.id ? { ...l, ...res.launch } : l))
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
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#050505]' : 'bg-stone-50'}`}>
                <div className="flex items-center gap-3 text-red-500 font-mono text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    INITIALIZING 0x000...
                </div>
            </div>
        )
    }

    if (!user || user.role !== 'admin') {
        return (
            <div className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden ${isDark ? 'bg-black' : 'bg-stone-100'}`}>
                <SEO title="System Terminal // 0x000" noIndex />
                {/* Hacker background elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.1)_0,transparent_50%)] pointer-events-none" />
                <div className="absolute top-0 w-full h-[1px] bg-red-500/20 shadow-[0_0_10px_rgba(255,0,0,0.5)] z-[-1]" />
                <div className="absolute bottom-0 w-full h-[1px] bg-red-500/20 shadow-[0_0_10px_rgba(255,0,0,0.5)] z-[-1]" />

                <div className={`w-full max-w-sm card-plug border-red-500/30 backdrop-blur p-8 shadow-2xl relative ${isDark ? 'bg-black/80' : 'bg-white/90'}`}>
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 bg-red-500/10 border border-red-500/50 rounded-full flex items-center justify-center mb-4 text-red-500">
                            <ShieldAlert size={24} />
                        </div>
                        <h1 className="text-xl font-mono font-bold text-red-500 tracking-wider">RESTRICTED_ACCESS</h1>
                        <p className="text-xs font-mono text-red-500/60 mt-2 text-center">// Auth required for 0x000</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                value={loginUsername}
                                onChange={(e) => setLoginUsername(e.target.value)}
                                placeholder="IDENTIFIER"
                                className={`w-full border border-red-500/30 rounded p-3 text-red-500 font-mono text-sm placeholder:text-red-500/30 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all ${isDark ? 'bg-black' : 'bg-white'}`}
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="KEYPHRASE"
                                className={`w-full border border-red-500/30 rounded p-3 text-red-500 font-mono text-sm placeholder:text-red-500/30 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all ${isDark ? 'bg-black' : 'bg-white'}`}
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
        <section className={`pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12 min-h-screen ${shellClass}`}>
            <SEO title="Admin // 0x000" noIndex />
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Admin Header */}
                <header className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-plug p-6 rounded-2xl ${panelClass}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center border border-red-500/20">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h1 className={`text-xl font-mono font-bold flex items-center gap-2 ${strongTextClass}`}>
                                0x000 OVERSEER
                                <span className="px-2 py-0.5 rounded bg-red-500 text-black text-[10px] uppercase font-black tracking-widest">Live</span>
                            </h1>
                            <p className={`text-xs font-mono mt-1 ${mutedTextClass}`}>Authorized as {user.name} ({user.email})</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => signOut()} 
                        className={`flex items-center justify-center sm:justify-start gap-2 text-xs font-mono transition-colors px-4 py-2 rounded-lg border hover:border-red-500/50 ${mutedTextClass} hover:text-red-500 ${panelMutedClass}`}
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
                        <div className={`card-plug p-5 ${panelClass}`}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className={`text-xs font-mono uppercase tracking-wider ${mutedTextClass}`}>Total Users</h3>
                                <Users size={16} className={softTextClass} />
                            </div>
                            <p className={`text-3xl font-mono font-bold ${strongTextClass}`}>{metrics.totalUsers}</p>
                        </div>
                        <div className={`card-plug p-5 ${panelClass}`}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className={`text-xs font-mono uppercase tracking-wider ${mutedTextClass}`}>Creators</h3>
                                <FileText size={16} className={softTextClass} />
                            </div>
                            <p className={`text-3xl font-mono font-bold ${strongTextClass}`}>{metrics.totalCreators}</p>
                        </div>
                        <div className={`card-plug p-5 ${panelClass}`}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className={`text-xs font-mono uppercase tracking-wider ${mutedTextClass}`}>Tipped Value</h3>
                                <DollarSign size={16} className="text-jence-gold" />
                            </div>
                            <p className="text-3xl font-mono font-bold text-jence-gold">
                                ${parseFloat(metrics.amountTipped || 0).toLocaleString()}
                            </p>
                        </div>
                        <div className={`card-plug p-5 ${panelClass}`}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className={`text-xs font-mono uppercase tracking-wider ${mutedTextClass}`}>Page Views (Est)</h3>
                                <Activity size={16} className={softTextClass} />
                            </div>
                            <p className={`text-3xl font-mono font-bold ${strongTextClass}`}>{metrics.pageViews.toLocaleString()}</p>
                        </div>
                    </div>
                )}

                {/* Charts Area */}
                {chartData.length > 0 && (
                    <div className={`card-plug p-6 ${panelClass}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className={`text-sm font-mono font-bold uppercase tracking-widest flex items-center gap-2 ${strongTextClass}`}>
                                <Activity size={16} />
                                Platform Growth
                            </h2>
                            <div className={`flex border rounded-lg overflow-hidden ${panelMutedClass}`}>
                                {['24h', '7d', 'all'].map(interval => (
                                    <button
                                        key={interval}
                                        onClick={() => setChartInterval(interval)}
                                        className={`px-4 py-1.5 text-xs font-mono font-bold uppercase transition-colors ${
                                            chartInterval === interval 
                                                ? isDark ? 'bg-zinc-800 text-white' : 'bg-white text-stone-950'
                                                : isDark
                                                    ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                                                    : 'text-stone-500 hover:text-stone-800 hover:bg-white/70'
                                        }`}
                                    >
                                        {interval === 'all' ? 'All Time' : interval}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loadingHistory ? (
                            <div className="h-64 flex items-center justify-center">
                                <Loader2 size={24} className={`animate-spin ${mutedTextClass}`} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                <div className={`min-w-0 rounded-xl border p-4 ${panelMutedClass}`}>
                                    <p className={`text-xs font-mono mb-3 ${mutedTextClass}`}>Total Users</p>
                                    <div className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.28}/>
                                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid vertical={false} stroke={isDark ? '#27272a' : '#e7e5e4'} strokeDasharray="3 3" />
                                                <XAxis dataKey="timestamp" stroke={isDark ? '#71717a' : '#78716c'} fontSize={10} tickLine={false} axisLine={false} minTickGap={24} />
                                                <YAxis hide />
                                                <RechartsTooltip 
                                                    cursor={{ stroke: isDark ? '#3f3f46' : '#d6d3d1', strokeDasharray: '4 4' }}
                                                    contentStyle={{ backgroundColor: isDark ? '#09090b' : '#ffffff', border: `1px solid ${isDark ? '#27272a' : '#e7e5e4'}`, borderRadius: '8px' }}
                                                    itemStyle={{ color: isDark ? '#fff' : '#111827', fontSize: '12px', fontFamily: 'monospace' }}
                                                    labelStyle={{ color: isDark ? '#a1a1aa' : '#78716c', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}
                                                    formatter={(value: number) => [value.toLocaleString(), 'Users']}
                                                />
                                                <Area type="monotone" dataKey="users" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className={`min-w-0 rounded-xl border p-4 ${panelMutedClass}`}>
                                    <p className={`text-xs font-mono mb-3 ${mutedTextClass}`}>Tipped Volume (USDC)</p>
                                    <div className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.28}/>
                                                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid vertical={false} stroke={isDark ? '#27272a' : '#e7e5e4'} strokeDasharray="3 3" />
                                                <XAxis dataKey="timestamp" stroke={isDark ? '#71717a' : '#78716c'} fontSize={10} tickLine={false} axisLine={false} minTickGap={24} />
                                                <YAxis hide />
                                                <RechartsTooltip 
                                                    cursor={{ stroke: isDark ? '#3f3f46' : '#d6d3d1', strokeDasharray: '4 4' }}
                                                    contentStyle={{ backgroundColor: isDark ? '#09090b' : '#ffffff', border: `1px solid ${isDark ? '#27272a' : '#e7e5e4'}`, borderRadius: '8px' }}
                                                    itemStyle={{ color: '#eab308', fontSize: '12px', fontFamily: 'monospace' }}
                                                    labelStyle={{ color: isDark ? '#a1a1aa' : '#78716c', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}
                                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Volume']}
                                                />
                                                <Area type="monotone" dataKey="volume" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Top Articles List */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className={`text-sm font-mono font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${strongTextClass}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            Top Articles
                        </h2>
                        
                        <div className={`card-plug overflow-hidden divide-y ${panelClass} ${isDark ? 'divide-zinc-800' : 'divide-stone-200'}`}>
                            {!topArticles.length && loadingData ? (
                                <div className={`p-8 text-center font-mono text-xs flex justify-center ${mutedTextClass}`}><Loader2 size={16} className="animate-spin" /></div>
                            ) : topArticles.length === 0 ? (
                                <div className={`p-8 text-center font-mono text-xs ${mutedTextClass}`}>NO ARTICLES RECORDED</div>
                            ) : (
                                topArticles.map((article: any, i: number) => (
                                    <div key={article.id} className={`p-4 transition-colors flex items-start gap-4 ${isDark ? 'hover:bg-zinc-900/50' : 'hover:bg-stone-50'}`}>
                                        <div className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold shrink-0 ${panelMutedClass} ${mutedTextClass}`}>
                                            #{i + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <Link to={`/post/${article.id}`} className={`text-sm font-medium hover:text-red-400 transition-colors inline-block mb-1 line-clamp-2 ${strongTextClass}`}>
                                                {article.title}
                                            </Link>
                                            <div className={`flex items-center justify-between text-xs font-mono ${mutedTextClass}`}>
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
                            <h2 className={`text-sm font-mono font-bold uppercase tracking-widest flex items-center gap-2 ${strongTextClass}`}>
                                <Users size={16} />
                                User Directory
                            </h2>
                            <div className="relative w-full sm:w-64">
                                <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${mutedTextClass}`} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search users..."
                                    className={`w-full border rounded-lg py-2 pl-9 pr-4 text-sm font-mono focus:ring-1 ${inputClass}`}
                                />
                            </div>
                        </div>

                        <div className={`card-plug overflow-x-auto ${panelClass}`}>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className={`border-b text-xs font-mono uppercase tracking-wider ${mutedTextClass} ${panelMutedClass}`}>
                                        <th className="p-4 font-medium">User</th>
                                        <th className="p-4 font-medium">Email</th>
                                        <th className="p-4 font-medium">Role</th>
                                        <th className="p-4 font-medium text-right">Status</th>
                                        <th className="p-4 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className={`font-mono text-sm divide-y ${isDark ? 'divide-zinc-800' : 'divide-stone-200'}`}>
                                    {users.length === 0 && loadingData ? (
                                        <tr><td colSpan={5} className="p-8 text-center"><Loader2 size={16} className={`animate-spin mx-auto ${mutedTextClass}`} /></td></tr>
                                    ) : users.length === 0 ? (
                                        <tr><td colSpan={5} className={`p-8 text-center ${mutedTextClass}`}>No matching users found.</td></tr>
                                    ) : (
                                        users.slice(0, usersVisible).map((u: any) => (
                                            <tr key={u.id} className={`transition-colors group ${isDark ? 'hover:bg-zinc-900/30' : 'hover:bg-stone-50'}`}>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded flex items-center justify-center font-bold shrink-0 ${panelMutedClass} ${softTextClass}`}>
                                                            {u.name?.[0]?.toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className={`font-medium truncate max-w-[150px] ${strongTextClass}`}>{u.name}</p>
                                                            <p className={`text-xs truncate mt-0.5 ${mutedTextClass}`}>
                                                                @{u.username || 'user'} {u.pseudonym && `(${u.pseudonym})`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`p-4 ${softTextClass}`}>{u.email}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                                        u.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                                                        u.role === 'creator' ? 'bg-jence-gold/10 text-jence-gold' :
                                                        isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-200 text-stone-600'
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
                                                                    ? isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-stone-200 hover:bg-stone-300 text-stone-900'
                                                                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
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
                                <div className={`p-4 border-t text-center ${isDark ? 'border-zinc-800' : 'border-stone-200'}`}>
                                    <button 
                                        onClick={() => setUsersVisible(prev => prev + 10)}
                                        className={`text-xs font-mono font-bold transition-colors px-4 py-2 rounded-lg border ${softTextClass} ${isDark ? 'hover:text-white' : 'hover:text-stone-950'} ${panelMutedClass}`}
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
                    <h2 className={`text-sm font-mono font-bold uppercase tracking-widest flex items-center gap-2 ${strongTextClass}`}>
                        <Rocket size={16} />
                        Launch Notes Registry
                    </h2>

                    <div className={`card-plug overflow-x-auto ${panelClass}`}>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`border-b text-xs font-mono uppercase tracking-wider ${mutedTextClass} ${panelMutedClass}`}>
                                    <th className="p-4 font-medium">Launch</th>
                                    <th className="p-4 font-medium">Author</th>
                                    <th className="p-4 font-medium">Submitted</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className={`font-mono text-sm divide-y ${isDark ? 'divide-zinc-800' : 'divide-stone-200'}`}>
                                {launches.length === 0 && loadingData ? (
                                    <tr><td colSpan={5} className="p-8 text-center"><Loader2 size={16} className={`animate-spin mx-auto ${mutedTextClass}`} /></td></tr>
                                ) : launches.length === 0 ? (
                                    <tr><td colSpan={5} className={`p-8 text-center ${mutedTextClass}`}>No launches submitted.</td></tr>
                                ) : (
                                    launches.map((l: any) => (
                                        <tr key={l.id} className={`transition-colors ${isDark ? 'hover:bg-zinc-900/30' : 'hover:bg-stone-50'}`}>
                                            <td className="p-4">
                                                <div className="min-w-0 max-w-[300px]">
                                                    <p className={`font-bold truncate ${strongTextClass}`}>{l.name}</p>
                                                    <p className={`text-xs truncate mt-0.5 ${mutedTextClass}`}>{l.company}</p>
                                                </div>
                                            </td>
                                            <td className={`p-4 text-xs ${softTextClass}`}>
                                                {l.authorName} <br/> <span className="opacity-50">@{l.authorPseudonym || l.authorUsername}</span>
                                            </td>
                                            <td className={`p-4 text-xs ${softTextClass}`}>
                                                {new Date(l.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getLaunchStatusClasses(l.status)}`}>
                                                    {l.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => openLaunchReview(l)}
                                                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-stone-200 hover:bg-stone-300 text-stone-950'}`}
                                                >
                                                    OPEN REVIEW
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
                <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur p-4 ${isDark ? 'bg-black/80' : 'bg-stone-950/35'}`}>
                    <div className={`w-full max-w-2xl card-plug shadow-2xl overflow-hidden flex flex-col ${panelClass}`}>
                        <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-stone-200 bg-stone-100/80'}`}>
                            <h3 className={`font-mono font-bold uppercase tracking-widest flex items-center gap-2 ${strongTextClass}`}>
                                <Rocket size={16} className="text-red-500" />
                                Review Launch Note
                            </h3>
                            <button onClick={() => setReviewingLaunch(null)} className={`${mutedTextClass} hover:text-red-500 transition-colors`}>
                                <XCircle size={18} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className={`rounded-xl border p-4 ${panelMutedClass}`}>
                                    <p className={`text-xs font-mono uppercase tracking-wider mb-1 ${mutedTextClass}`}>Product</p>
                                    <p className={`font-bold text-lg ${strongTextClass}`}>{reviewingLaunch.name}</p>
                                    <p className={`text-sm mt-1 ${softTextClass}`}>{reviewingLaunch.company}</p>
                                </div>
                                <div className={`rounded-xl border p-4 ${panelMutedClass}`}>
                                    <p className={`text-xs font-mono uppercase tracking-wider mb-1 ${mutedTextClass}`}>Current Status</p>
                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getLaunchStatusClasses(reviewingLaunch.status)}`}>
                                        {reviewingLaunch.status}
                                    </span>
                                    <p className={`text-sm mt-3 ${softTextClass}`}>
                                        Submitted {new Date(reviewingLaunch.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className={`rounded-xl border p-4 ${panelMutedClass}`}>
                                    <p className={`text-xs font-mono uppercase tracking-wider mb-1 ${mutedTextClass}`}>Submitted By</p>
                                    <p className={`font-medium ${strongTextClass}`}>{reviewingLaunch.authorName || 'Unknown author'}</p>
                                    <p className={`text-sm ${softTextClass}`}>@{reviewingLaunch.authorPseudonym || reviewingLaunch.authorUsername || 'unknown'}</p>
                                </div>
                                <div className={`rounded-xl border p-4 ${panelMutedClass}`}>
                                    <p className={`text-xs font-mono uppercase tracking-wider mb-1 ${mutedTextClass}`}>Community Support</p>
                                    <p className={`font-medium ${strongTextClass}`}>{reviewingLaunch.allowTips ? 'Tips enabled' : 'Tips disabled'}</p>
                                    <p className={`text-sm ${softTextClass}`}>{reviewingLaunch.allowTips ? 'Readers can support this launch after approval.' : 'No tip support requested.'}</p>
                                </div>
                            </div>

                            {Array.isArray(reviewingLaunch.tags) && reviewingLaunch.tags.length > 0 && (
                                <div>
                                    <p className={`text-xs font-mono uppercase tracking-wider mb-2 ${mutedTextClass}`}>Tags</p>
                                    <div className="flex flex-wrap gap-2">
                                        {reviewingLaunch.tags.map((tag: string) => (
                                            <span key={tag} className={`inline-flex px-2.5 py-1 rounded-full text-xs border ${panelMutedClass} ${softTextClass}`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className={`text-xs font-mono uppercase tracking-wider mb-1 ${mutedTextClass}`}>Summary</p>
                                <div className={`text-sm p-4 rounded-xl border leading-relaxed whitespace-pre-wrap ${panelMutedClass} ${isDark ? 'text-zinc-300' : 'text-stone-700'}`}>
                                    {reviewingLaunch.summary}
                                </div>
                            </div>

                            {reviewingLaunch.disclosure && (
                                <div>
                                    <p className="text-xs font-mono text-red-500/80 uppercase tracking-wider mb-1">Disclosure</p>
                                    <div className={`text-sm p-4 rounded-xl border border-red-500/20 bg-red-500/5 ${isDark ? 'text-zinc-300' : 'text-stone-700'}`}>
                                        {reviewingLaunch.disclosure}
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className={`text-xs font-mono uppercase tracking-wider mb-2 ${mutedTextClass}`}>Admin Review Note (Sent via Email)</p>
                                <textarea 
                                    value={reviewNote}
                                    onChange={e => setReviewNote(e.target.value)}
                                    placeholder="Provide reasoning for rejection, or a congratulatory note for approval..."
                                    className={`w-full h-28 border rounded-xl p-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 resize-none font-mono ${inputClass}`}
                                />
                            </div>
                        </div>

                        <div className={`p-5 border-t flex flex-col sm:flex-row gap-3 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-stone-200 bg-stone-100/80'}`}>
                            <button
                                onClick={() => setReviewingLaunch(null)}
                                disabled={!!reviewingStatus}
                                className={`px-4 py-2 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-white hover:bg-stone-200 text-stone-950 border border-stone-200'} disabled:opacity-50`}
                            >
                                Close
                            </button>
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
