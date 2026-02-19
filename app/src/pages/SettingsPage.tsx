import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Bell, Shield, CreditCard, DollarSign } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
]

export default function SettingsPage() {
    const { user, loading: authLoading, signOut } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('profile')
    const [payoutAddress, setPayoutAddress] = useState('')
    const [payoutMethod, setPayoutMethod] = useState('crypto')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [saving, setSaving] = useState(false)
    const [creatorId, setCreatorId] = useState<string | null>(null)

    // Load initial data
    useEffect(() => {
        if (!user) return
        setAvatarUrl(user.image || '')

        if (user.role === 'creator' && user.username) {
            api.getCreatorByUsername(user.username)
                .then(res => {
                    setCreatorId(res.creator.id)
                    setPayoutAddress(res.creator.payoutAddress || '')
                    setPayoutMethod(res.creator.payoutMethod || 'crypto')
                })
                .catch(console.error)
        }
    }, [user])

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login')
        }
    }, [user, authLoading, navigate])

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    const handleSaveProfile = async () => {
        if (!user?.id) return
        setSaving(true)
        try {
            await api.updateUser(user.id, { image: avatarUrl })
            // Ideally notify success or refresh user context
            // For now just stop saving
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    const handleSavePayout = async () => {
        if (!creatorId) return
        setSaving(true)
        try {
            await api.updateCreatorProfile(creatorId, { payoutAddress, payoutMethod })
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
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

    const creatorShare = import.meta.env.VITE_CREATOR_PAYOUT_PERCENT || '80'
    const platformShare = 100 - parseInt(creatorShare)

    return (
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar Tabs */}
                    <nav className="md:w-56 shrink-0">
                        <div className="card-plug p-2 flex md:flex-col gap-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                // Hide subscription tab for non-creators if intended for payouts (actually subscription is for paying others)
                                // But let's add Payout tab for Creators
                                if (tab.id === 'payouts' && user?.role !== 'creator') return null

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all text-left w-full active:scale-[0.97] ${activeTab === tab.id
                                            ? 'bg-jence-gold/10 text-jence-gold font-medium'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                            }`}
                                    >
                                        <Icon size={16} />
                                        <span className="hidden md:inline">{tab.label}</span>
                                    </button>
                                )
                            })}
                            {user?.role === 'creator' && (
                                <>
                                    <button
                                        onClick={() => setActiveTab('payouts')}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all text-left w-full active:scale-[0.97] ${activeTab === 'payouts'
                                            ? 'bg-jence-gold/10 text-jence-gold font-medium'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                            }`}
                                    >
                                        <DollarSign size={16} />
                                        <span className="hidden md:inline">Payouts</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('verification')}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all text-left w-full active:scale-[0.97] ${activeTab === 'verification'
                                            ? 'bg-jence-gold/10 text-jence-gold font-medium'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                            }`}
                                    >
                                        <Shield size={16} />
                                        <span className="hidden md:inline">Verification</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </nav>

                    {/* Content */}
                    <div className="flex-1">
                        {activeTab === 'profile' && (
                            <div className="card-plug p-6">
                                <h2 className="font-semibold text-foreground mb-4">Profile Information</h2>
                                <div className="space-y-4">
                                    {/* Avatar */}
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={32} className="text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-foreground mb-1.5">Profile Picture URL</label>
                                            <input
                                                type="url"
                                                value={avatarUrl}
                                                onChange={(e) => setAvatarUrl(e.target.value)}
                                                className="input-field"
                                                placeholder="https://example.com/me.jpg"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">Paste a direct link to an image.</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Display name</label>
                                        <input
                                            type="text"
                                            defaultValue={user?.name || ''}
                                            className="input-field"
                                            disabled // Add name update logic if needed
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            defaultValue={user?.email || ''}
                                            className="input-field"
                                            disabled
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                                    </div>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="btn-primary text-sm active:scale-[0.97] transition-all disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save changes'}
                                    </button>
                                </div>

                                <div className="mt-8 pt-6 border-t border-border">
                                    <button
                                        onClick={handleSignOut}
                                        className="text-sm text-red-400 hover:text-red-300 transition-colors active:scale-[0.97]"
                                    >
                                        Sign out of your account
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'payouts' && (
                            <div className="card-plug p-6">
                                <h2 className="font-semibold text-foreground mb-4">Payout Settings</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Configure how you receive your earnings. Payments are processed in crypto.
                                </p>

                                <div className="p-4 rounded-xl bg-jence-gold/5 border border-jence-gold/20 mb-6">
                                    <h3 className="text-sm font-medium text-jence-gold mb-2">Revenue Split</h3>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex-1">
                                            <p className="text-2xl font-bold text-foreground">{creatorShare}%</p>
                                            <p className="text-muted-foreground">You receive</p>
                                        </div>
                                        <div className="w-px h-10 bg-border"></div>
                                        <div className="flex-1">
                                            <p className="text-2xl font-bold text-foreground">{platformShare}%</p>
                                            <p className="text-muted-foreground">Platform fee</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Payout Method</label>
                                        <select
                                            value={payoutMethod}
                                            onChange={(e) => setPayoutMethod(e.target.value)}
                                            className="input-field"
                                        >
                                            <option value="crypto">Crypto Wallet (USDC/ETH)</option>
                                            <option value="bank">Bank Transfer (Coming Soon)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Wallet Address</label>
                                        <input
                                            type="text"
                                            value={payoutAddress}
                                            onChange={(e) => setPayoutAddress(e.target.value)}
                                            className="input-field font-mono text-sm"
                                            placeholder="0x..."
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Double check your address. We support Ethereum and Polygon networks.</p>
                                    </div>

                                    <button
                                        onClick={handleSavePayout}
                                        disabled={saving}
                                        className="btn-primary text-sm active:scale-[0.97] transition-all disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Payout Settings'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'verification' && (
                            <div className="card-plug p-6">
                                <h2 className="font-semibold text-foreground mb-4">Identity Verification</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    To receive payouts and get the verified badge, you must complete KYC.
                                    Your data is encrypted and private.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Document Type</label>
                                        <select
                                            className="input-field"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select document type</option>
                                            <option value="NIN">National Identification Number (NIN)</option>
                                            <option value="BVN">Bank Verification Number (BVN)</option>
                                            <option value="Passport">International Passport</option>
                                        </select>
                                    </div>

                                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-jence-gold/50 transition-colors cursor-pointer">
                                        <Shield size={32} className="text-muted-foreground mx-auto mb-3" />
                                        <p className="text-sm text-foreground font-medium">Upload Document</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            PDF, JPG, or PNG — max 5MB.
                                        </p>
                                    </div>

                                    <button
                                        className="btn-primary text-sm active:scale-[0.97] transition-all w-full justify-center"
                                        onClick={() => alert('KYC upload simulation successful. Status updated to Pending Review.')}
                                    >
                                        Submit for Review
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="card-plug p-6">
                                <h2 className="font-semibold text-foreground mb-4">Notification Preferences</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: 'New posts from subscribed creators', desc: 'Get notified when creators publish new content' },
                                        { label: 'Creator announcements', desc: 'Updates from creators you follow' },
                                        { label: 'Platform updates', desc: 'New features, policy changes, and announcements' },
                                    ].map((item, i) => (
                                        <label key={i} className="flex items-start justify-between gap-4 p-3 rounded-xl border border-border hover:border-jence-gold/20 transition-colors cursor-pointer">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{item.label}</p>
                                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                                            </div>
                                            <input type="checkbox" defaultChecked className="mt-1 accent-jence-gold" />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy' && (
                            <div className="card-plug p-6">
                                <h2 className="font-semibold text-foreground mb-4">Privacy & Data</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    In compliance with the Nigeria Data Protection Act (NDPA), you have the right to request
                                    deletion of your personal data.
                                </p>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl border border-border">
                                        <h3 className="text-sm font-medium text-foreground mb-1">Download your data</h3>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Request a copy of all your data stored on Jence.
                                        </p>
                                        <button className="btn-secondary text-sm active:scale-[0.97] transition-all">Request data export</button>
                                    </div>

                                    <div className="p-4 rounded-xl border border-red-500/20">
                                        <h3 className="text-sm font-medium text-red-400 mb-1">Delete account</h3>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Permanently delete your account and all associated data. This action cannot be undone.
                                        </p>
                                        <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-all active:scale-[0.97]">
                                            Delete my account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'subscription' && (
                            <div className="card-plug p-6">
                                <h2 className="font-semibold text-foreground mb-4">Subscription Management</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Manage your creator subscriptions. Payments are processed via cryptocurrency.
                                </p>

                                <div className="p-8 text-center border-2 border-dashed border-border rounded-xl">
                                    <p className="text-muted-foreground text-sm">No active subscriptions</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Subscribe to creators to see them here
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
