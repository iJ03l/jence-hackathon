import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Bell, Shield, CreditCard } from 'lucide-react'
import { useSession, signOut } from '../lib/auth-client'

const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
]

export default function SettingsPage() {
    const { data: session, isPending } = useSession()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('profile')

    useEffect(() => {
        if (!isPending && !session) {
            navigate('/login')
        }
    }, [session, isPending, navigate])

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
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
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors text-left w-full ${activeTab === tab.id
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
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Display name</label>
                                        <input
                                            type="text"
                                            defaultValue={session?.user?.name || ''}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            defaultValue={session?.user?.email || ''}
                                            className="input-field"
                                            disabled
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                                    </div>
                                    <button className="btn-primary text-sm">Save changes</button>
                                </div>

                                <div className="mt-8 pt-6 border-t border-border">
                                    <button
                                        onClick={handleSignOut}
                                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Sign out of your account
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
                                        <label key={i} className="flex items-start justify-between gap-4 p-3 rounded-xl border border-border">
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
                                        <button className="btn-secondary text-sm">Request data export</button>
                                    </div>

                                    <div className="p-4 rounded-xl border border-red-500/20">
                                        <h3 className="text-sm font-medium text-red-400 mb-1">Delete account</h3>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Permanently delete your account and all associated data. This action cannot be undone.
                                        </p>
                                        <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors">
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
