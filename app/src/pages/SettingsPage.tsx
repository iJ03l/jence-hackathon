import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Bell, Shield, CreditCard, DollarSign, Copy, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { useWallets, useCreateWallet, useExportWallet } from '@privy-io/react-auth/solana'
import { usePrivy } from '@privy-io/react-auth'
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
    const [subscriptionPrice, setSubscriptionPrice] = useState('0')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [creatorId, setCreatorId] = useState<string | null>(null)
    const [walletCreating, setWalletCreating] = useState(false)
    const [walletError, setWalletError] = useState('')
    const [copied, setCopied] = useState(false)

    // Privy Wallet 
    const { wallets } = useWallets()
    const { createWallet } = useCreateWallet()
    const { exportWallet } = useExportWallet()
    const { ready: privyReady, user: privyUser } = usePrivy()

    const privyLinkedWallet = privyUser?.linkedAccounts?.find(
        (acc) => acc.type === 'wallet' && acc.walletClientType === 'privy'
    )
    const hasPrivyLinkedWallet = !!privyLinkedWallet

    // The embeddedWallet might take a moment to appear in 'wallets' even after 'ready'
    const embeddedWallet = wallets.find((w: any) => w.walletClientType === 'privy')
    const hasWallet = !!embeddedWallet || !!hasPrivyLinkedWallet

    // Some types in Privy linkedAccounts have 'address' field
    const walletAddress = embeddedWallet?.address || (privyLinkedWallet as any)?.address || ''

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
                    setSubscriptionPrice(res.creator.subscriptionPrice || '0')
                })
                .catch(console.error)
        }
    }, [user])

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login')
        }
    }, [user, authLoading, navigate])

    // Auto-provision Privy embedded wallet if missing
    useEffect(() => {
        if (!user || authLoading || !privyReady) return
        if (!hasWallet) {
            createWallet().catch((err) =>
                console.error('Failed to provision embedded wallet:', err)
            )
        }
    }, [user, authLoading, privyReady, hasWallet, createWallet])

    const handleCreateWallet = async () => {
        setWalletCreating(true)
        setWalletError('')
        try {
            await createWallet()
        } catch (err: any) {
            console.error('Failed to create wallet:', err)
            setWalletError(err?.message || 'Failed to create wallet. Please try again.')
        } finally {
            setWalletCreating(false)
        }
    }

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingImage(true)
        try {
            const res = await api.uploadImage(file)
            if (res.url) {
                setAvatarUrl(res.url)
            }
        } catch (error) {
            console.error('Failed to upload image:', error)
            alert('Failed to upload image. Please try again.')
        } finally {
            setUploadingImage(false)
        }
    }

    const handleSaveProfile = async () => {
        if (!user?.id) return
        setSaving(true)
        setSaved(false)
        try {
            await api.updateUser(user.id, { image: avatarUrl })
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (e) {
            console.error(e)
            alert('Failed to save. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleSavePayout = async () => {
        if (!creatorId) return
        setSaving(true)
        try {
            await api.updateCreatorProfile(creatorId, { payoutAddress, payoutMethod, subscriptionPrice })
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    const handleCopyAddress = () => {
        if (!walletAddress) return
        navigator.clipboard.writeText(walletAddress)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
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
                                            <label className="block text-sm font-medium text-foreground mb-1.5">Profile Picture</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploadingImage}
                                                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-jence-gold/10 file:text-jence-gold hover:file:bg-jence-gold/20 cursor-pointer disabled:opacity-50"
                                            />
                                            {uploadingImage && <p className="text-xs text-jence-gold mt-1">Uploading...</p>}
                                            {!uploadingImage && <p className="text-xs text-muted-foreground mt-1">Upload a JPG, PNG, or WebP.</p>}
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
                                        {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save changes'}
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
                                <h2 className="font-semibold text-foreground mb-4">Subscription & Earnings</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Configure how much subscribers pay each month to access your premium analysis. Payments are processed in USDC on Solana and sent directly to your wallet.
                                </p>

                                <div className="p-3 rounded-lg bg-jence-gold/5 border border-jence-gold/20 mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-jence-gold">Revenue Split:</p>
                                        <p className="text-sm text-foreground"><span className="font-bold">{creatorShare}%</span> Creator / <span className="font-bold">{platformShare}%</span> Platform</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Monthly Subscription Price (USDC)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={subscriptionPrice}
                                                onChange={(e) => setSubscriptionPrice(e.target.value)}
                                                className="input-field !pl-7 font-mono text-sm"
                                                placeholder="0"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Set to 0 for free subscriptions.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Solana Wallet Address</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                value={walletAddress || 'No embedded wallet found'}
                                                className="input-field font-mono text-sm flex-1 bg-muted/50"
                                                readOnly
                                            />
                                            {hasWallet && (
                                                <button
                                                    onClick={handleCopyAddress}
                                                    className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                                    title="Copy Address"
                                                >
                                                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                                </button>
                                            )}
                                            {!hasWallet && (
                                                <button
                                                    onClick={handleCreateWallet}
                                                    disabled={walletCreating || !privyReady}
                                                    className="btn-secondary h-[42px] px-4 shrink-0 transition-opacity whitespace-nowrap disabled:opacity-50"
                                                >
                                                    {walletCreating ? 'Creating...' : 'Create Wallet'}
                                                </button>
                                            )}
                                            {walletError && <p className="text-xs text-red-400 mt-1">{walletError}</p>}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            This is your natively provisioned secure Solana wallet. Earnings are sent directly here. You can fund this wallet with SOL/USDC or export the private key to use with Phantom, Solflare, or other Solana wallets. Your current wallet balance can be seen on the wallet you export it to.
                                        </p>

                                        {hasWallet && (
                                            <div className="mt-3">
                                                <button
                                                    onClick={() => exportWallet()}
                                                    disabled={!privyReady}
                                                    className="text-sm text-jence-gold hover:text-jence-gold/80 hover:underline transition-all disabled:opacity-50"
                                                >
                                                    Export Private Key
                                                </button>
                                            </div>
                                        )}
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
                                    In compliance with the General Data Protection Regulation (GDPR) and global privacy standards, you have the right to request
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

                                    {/* Delete account functionally removed per requirements */}
                                </div>
                            </div>
                        )}

                        {activeTab === 'subscription' && (
                            <div className="card-plug p-6">
                                <h2 className="font-semibold text-foreground mb-4">Subscription Management</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Manage your creator subscriptions. Payments are processed using your embedded Solana wallet.
                                </p>

                                <div className="mb-6 p-4 rounded-xl border border-border bg-muted/20">
                                    <h3 className="text-sm font-medium text-foreground mb-2">Your Solana Wallet</h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={walletAddress || 'No embedded wallet found'}
                                            className="input-field font-mono text-xs flex-1 bg-background"
                                            readOnly
                                        />
                                        {hasWallet && (
                                            <button
                                                onClick={handleCopyAddress}
                                                className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground shrink-0"
                                                title="Copy Address"
                                            >
                                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                            </button>
                                        )}
                                        {!hasWallet && (
                                            <button
                                                onClick={handleCreateWallet}
                                                disabled={walletCreating || !privyReady}
                                                className="btn-secondary h-[38px] px-3 shrink-0 text-xs disabled:opacity-50"
                                            >
                                                {walletCreating ? 'Creating...' : 'Create Wallet'}
                                            </button>
                                        )}
                                        {walletError && <p className="text-xs text-red-400 mt-1">{walletError}</p>}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Fund this wallet with USDC to pay for subscriptions. You can export it to Phantom or other Solana wallets and check your balance there.
                                    </p>
                                    {hasWallet && (
                                        <button
                                            onClick={() => exportWallet()}
                                            disabled={!privyReady}
                                            className="text-xs text-jence-gold hover:text-jence-gold/80 hover:underline transition-all disabled:opacity-50"
                                        >
                                            Export Private Key
                                        </button>
                                    )}
                                </div>

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
        </section >
    )
}
