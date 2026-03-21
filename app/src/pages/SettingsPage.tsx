import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Bell, Shield, CreditCard, Copy, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
    { id: 'subscription', label: 'Tipping & Payouts', icon: CreditCard },
]

export default function SettingsPage() {
    const { user, walletAddress, refreshSession, loading: authLoading, signOut } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('profile')
    const [payoutAddress, setPayoutAddress] = useState('')
    const [payoutMethod, setPayoutMethod] = useState('crypto')
    const [subscriptionPrice, setSubscriptionPrice] = useState('0')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [byline, setByline] = useState('')
    const [affiliation, setAffiliation] = useState('')
    const [credentials, setCredentials] = useState('')
    const [location, setLocation] = useState('')
    const [website, setWebsite] = useState('')

    const [uploadingImage, setUploadingImage] = useState(false)
    const [creatorId, setCreatorId] = useState<string | null>(null)
    const [walletCreating, setWalletCreating] = useState(false)
    const [walletError, setWalletError] = useState('')
    const [copied, setCopied] = useState(false)
    const [exportingWallet, setExportingWallet] = useState(false)
    const [exportModalOpen, setExportModalOpen] = useState(false)
    const [privateKeyToDisplay, setPrivateKeyToDisplay] = useState('')
    const [copiedPrivateKey, setCopiedPrivateKey] = useState(false)
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const initialLoadDone = useRef(false)
    const profileSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const payoutSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const hasWallet = !!walletAddress

    // Load initial data
    useEffect(() => {
        if (!user) return
        setAvatarUrl(user.image || '')
        setDisplayName(user.name || '')

        if (user.role === 'creator') {
            api.getCreatorByUserId(user.id)
                .then(res => {
                    setCreatorId(res.creator.id)
                    setByline(res.creator.pseudonym || '')
                    setAffiliation(res.creator.affiliation || '')
                    setCredentials(res.creator.credentials || '')
                    setLocation(res.creator.location || '')
                    setWebsite(res.creator.website || '')
                    setPayoutAddress(res.creator.payoutAddress || '')
                    setPayoutMethod(res.creator.payoutMethod || 'crypto')
                    setSubscriptionPrice(res.creator.subscriptionPrice || '0')
                    // Mark initial load as done after a tick so auto-save effects don't fire
                    setTimeout(() => { initialLoadDone.current = true }, 500)
                })
                .catch(console.error)
        } else {
            setTimeout(() => { initialLoadDone.current = true }, 500)
        }
    }, [user])

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login')
        }
    }, [user, authLoading, navigate])

    // Auto-provision embedded wallet if missing
    useEffect(() => {
        if (!user || authLoading) return
        if (!hasWallet) {
            api.createWallet().then(() => refreshSession()).catch((err) =>
                console.error('Failed to provision embedded wallet:', err)
            )
        }
    }, [user, authLoading, hasWallet])

    const handleCreateWallet = async () => {
        setWalletCreating(true)
        setWalletError('')
        try {
            await api.createWallet()
            await refreshSession()
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

        const supportedImage = file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|avif|avifs|heic|heif|heics|heifs)$/i.test(file.name)
        if (!supportedImage) {
            alert('Jence only accepts JPG, PNG, GIF, WebP, AVIF, or HEIC images.')
            return
        }

        setUploadingImage(true)
        try {
            const res = await api.uploadImage(file)
            if (res.url) {
                setAvatarUrl(res.url)
            }
        } catch (error) {
            console.error('Failed to upload image:', error)
            alert(error instanceof Error ? error.message : 'Jence could not upload that image. Please try again.')
        } finally {
            setUploadingImage(false)
        }
    }

    // Debounced auto-save for profile fields
    const autoSaveProfile = useCallback(async () => {
        if (!user?.id) return
        setAutoSaveStatus('saving')
        try {
            await api.updateUser(user.id, { image: avatarUrl, name: displayName })
            if (creatorId) {
                await api.updateCreatorProfile(creatorId, {
                    pseudonym: byline,
                    affiliation,
                    credentials,
                    location,
                    website,
                })
            }
            setAutoSaveStatus('saved')
            setTimeout(() => setAutoSaveStatus('idle'), 2000)
        } catch (e) {
            console.error(e)
            setAutoSaveStatus('error')
            setTimeout(() => setAutoSaveStatus('idle'), 3000)
        }
    }, [user?.id, avatarUrl, displayName, byline, affiliation, credentials, location, website, creatorId])

    useEffect(() => {
        if (!initialLoadDone.current) return
        if (profileSaveTimer.current) clearTimeout(profileSaveTimer.current)
        profileSaveTimer.current = setTimeout(() => autoSaveProfile(), 800)
        return () => { if (profileSaveTimer.current) clearTimeout(profileSaveTimer.current) }
    }, [displayName, byline, affiliation, credentials, location, website, avatarUrl, autoSaveProfile])

    // Debounced auto-save for payout/subscription fields
    const autoSavePayout = useCallback(async () => {
        if (!creatorId) return
        setAutoSaveStatus('saving')
        try {
            await api.updateCreatorProfile(creatorId, { payoutAddress, payoutMethod, subscriptionPrice })
            setAutoSaveStatus('saved')
            setTimeout(() => setAutoSaveStatus('idle'), 2000)
        } catch (e) {
            console.error(e)
            setAutoSaveStatus('error')
            setTimeout(() => setAutoSaveStatus('idle'), 3000)
        }
    }, [creatorId, payoutAddress, payoutMethod, subscriptionPrice])

    useEffect(() => {
        if (!initialLoadDone.current || !creatorId) return
        if (payoutSaveTimer.current) clearTimeout(payoutSaveTimer.current)
        payoutSaveTimer.current = setTimeout(() => autoSavePayout(), 800)
        return () => { if (payoutSaveTimer.current) clearTimeout(payoutSaveTimer.current) }
    }, [subscriptionPrice, payoutAddress, payoutMethod, autoSavePayout, creatorId])


    const handleCopyAddress = () => {
        if (!walletAddress) return
        navigator.clipboard.writeText(walletAddress)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleExportWallet = () => {
        setExportModalOpen(true)
        setPrivateKeyToDisplay('')
    }

    const confirmExportWallet = async () => {
        setExportingWallet(true)
        try {
            const res = await api.exportWallet()
            if (res.privateKey) {
                setPrivateKeyToDisplay(res.privateKey)
            }
        } catch (err: any) {
            console.error('Failed to export wallet:', err)
            alert(err?.message || 'Failed to export private key')
        } finally {
            setExportingWallet(false)
        }
    }

    const handleCopyPrivateKey = () => {
        if (!privateKeyToDisplay) return
        navigator.clipboard.writeText(privateKeyToDisplay)
        setCopiedPrivateKey(true)
        setTimeout(() => setCopiedPrivateKey(false), 2000)
    }

    const closeExportModal = () => {
        setExportModalOpen(false)
        setPrivateKeyToDisplay('')
        setCopiedPrivateKey(false)
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
                                                accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.webp,.avif,.heic,.heif"
                                                onChange={handleImageUpload}
                                                disabled={uploadingImage}
                                                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-jence-gold/10 file:text-jence-gold hover:file:bg-jence-gold/20 cursor-pointer disabled:opacity-50"
                                            />
                                            {uploadingImage && <p className="text-xs text-jence-gold mt-1">Uploading...</p>}
                                            {!uploadingImage && <p className="text-xs text-muted-foreground mt-1">Jence supports JPG, PNG, GIF, WebP, AVIF, or HEIC.</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Account name</label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="input-field"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    {creatorId && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-1.5">Author byline (public)</label>
                                                <input
                                                    type="text"
                                                    value={byline}
                                                    onChange={(e) => setByline(e.target.value)}
                                                    className="input-field"
                                                    placeholder="Your published byline"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Real-name bylines are required. Pseudonyms need editorial approval.
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-1.5">Affiliation (optional)</label>
                                                <input
                                                    type="text"
                                                    value={affiliation}
                                                    onChange={(e) => setAffiliation(e.target.value)}
                                                    className="input-field"
                                                    placeholder="Company, lab, or university"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-1.5">Verification links (optional)</label>
                                                <input
                                                    type="text"
                                                    value={credentials}
                                                    onChange={(e) => setCredentials(e.target.value)}
                                                    className="input-field"
                                                    placeholder="LinkedIn, GitHub, ORCID (comma-separated)"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-1.5">Location (optional)</label>
                                                <input
                                                    type="text"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    className="input-field"
                                                    placeholder="City, Country"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-1.5">Website (optional)</label>
                                                <input
                                                    type="text"
                                                    value={website}
                                                    onChange={(e) => setWebsite(e.target.value)}
                                                    className="input-field"
                                                    placeholder="https://your-site.com"
                                                />
                                            </div>
                                        </>
                                    )}
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
                                    <div className="flex items-center gap-2 h-8">
                                        {autoSaveStatus === 'saving' && <p className="text-xs text-jence-gold animate-pulse">Saving...</p>}
                                        {autoSaveStatus === 'saved' && <p className="text-xs text-green-500 flex items-center gap-1"><Check size={12} /> Saved</p>}
                                        {autoSaveStatus === 'error' && <p className="text-xs text-red-400">Failed to save</p>}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-border">
                                    <button
                                        onClick={handleSignOut}
                                        className="text-sm text-red-400 hover:text-red-300 transition-colors active:scale-[0.97]"
                                    >
                                        Sign out of your account
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'subscription' && (
                            <div className="card-plug p-6">
                                <h2 className="font-semibold text-foreground mb-4">Tipping Management</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Manage your creator tipping. Payments are processed using your natively provisioned secure wallet. Subscribe to creators to see them here.
                                </p>

                                {user?.role === 'creator' && (
                                    <>
                                        <h3 className="text-sm font-semibold text-foreground mt-8 mb-4 border-t border-border pt-6">Creator Earnings & Payouts</h3>
                                        <p className="text-sm text-muted-foreground mb-6">
                                            Configure how much your subscribers tip each month to access your premium work. Earnings are sent zero-fee to your wallet.
                                        </p>


                                        <div className="space-y-4 mb-8">
                                            <div className="flex items-center gap-2 h-8">
                                                {autoSaveStatus === 'saving' && <p className="text-xs text-jence-gold animate-pulse">Saving payout settings...</p>}
                                                {autoSaveStatus === 'saved' && <p className="text-xs text-green-500 flex items-center gap-1"><Check size={12} /> Payout settings saved</p>}
                                                {autoSaveStatus === 'error' && <p className="text-xs text-red-400">Failed to save</p>}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="mb-6 p-4 rounded-xl border border-border bg-muted/20">
                                    <h3 className="text-sm font-medium text-foreground mb-2">Your payment wallet</h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={walletAddress || 'No embedded wallet found'}
                                            className="input-field font-mono text-xs flex-1 bg-background"
                                            readOnly
                                        />
                                        {hasWallet && (
                                            <>
                                                <button
                                                    onClick={handleCopyAddress}
                                                    className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground shrink-0"
                                                    title="Copy Address"
                                                >
                                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                                </button>
                                                <button
                                                    onClick={handleExportWallet}
                                                    disabled={exportingWallet}
                                                    className="btn-secondary h-[38px] px-3 shrink-0 text-xs disabled:opacity-50"
                                                >
                                                    {exportingWallet ? 'Exporting...' : 'Export Key'}
                                                </button>
                                            </>
                                        )}
                                        {!hasWallet && (
                                            <button
                                                onClick={handleCreateWallet}
                                                disabled={walletCreating}
                                                className="btn-secondary h-[38px] px-3 shrink-0 text-xs disabled:opacity-50"
                                            >
                                                {walletCreating ? 'Creating...' : 'Create Wallet'}
                                            </button>
                                        )}
                                        {walletError && <p className="text-xs text-red-400 mt-1">{walletError}</p>}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Fund this wallet to pay for tipping. You can export it to a compatible wallet and check your balance there.
                                    </p>

                                </div>

                                <div className="p-8 text-center border-2 border-dashed border-border rounded-xl">
                                    <p className="text-muted-foreground text-sm">No active tips</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Subscribe to creators to see them here
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="card-plug p-6">
                                <h2 className="font-semibold text-foreground mb-4">Notifications</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Manage your email and push notification preferences.
                                </p>
                                <div className="p-8 text-center border-2 border-dashed border-border rounded-xl">
                                    <p className="text-muted-foreground text-sm">Notification settings coming soon</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy' && (
                            <div className="card-plug p-6">
                                <h2 className="font-semibold text-foreground mb-4">Privacy & Data</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Manage your data and privacy settings.
                                </p>
                                <div className="p-8 text-center border-2 border-dashed border-border rounded-xl">
                                    <p className="text-muted-foreground text-sm">Privacy settings coming soon</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Wallet Export Modal */}
            {exportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                                <Shield className="text-red-500" size={20} />
                                Export Private Key
                            </h3>

                            {!privateKeyToDisplay ? (
                                <>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        <strong className="text-red-500 font-semibold block mb-2">WARNING: Never share this key with anyone.</strong>
                                        Anyone who has your private key has full access to your wallet and can steal your funds. Jence staff will never ask for your private key.
                                    </p>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            onClick={closeExportModal}
                                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmExportWallet}
                                            disabled={exportingWallet}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors rounded-lg"
                                        >
                                            {exportingWallet ? 'Revealing...' : 'Reveal Private Key'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-foreground mb-4">
                                        Your Base58 private key is revealed below. Copy it immediately and store it in a secure password manager.
                                    </p>
                                    <div className="relative mb-6">
                                        <textarea
                                            readOnly
                                            value={privateKeyToDisplay}
                                            className="w-full h-24 p-3 bg-muted/50 rounded-lg font-mono text-sm resize-none pr-12 text-foreground outline-none focus:ring-1 focus:ring-jence-gold/50"
                                        />
                                        <button
                                            onClick={handleCopyPrivateKey}
                                            className="absolute top-3 right-3 p-2 bg-background hover:bg-muted border border-border shadow-sm rounded-md transition-colors text-muted-foreground hover:text-foreground"
                                            title="Copy Private Key"
                                        >
                                            {copiedPrivateKey ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={closeExportModal}
                                            className="px-4 py-2 text-sm font-medium text-background bg-foreground rounded-lg hover:bg-jence-gold transition-colors"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section >
    )
}
