import { Link, useLocation } from 'react-router-dom'
import { Compass, MessageCircle, LayoutDashboard, Settings, Zap, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const tabs = [
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Community', href: '/community', icon: MessageCircle },
    { label: 'Home', href: '/', icon: Zap, isCenter: true },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, requiresAuth: true },
    { label: 'Settings', href: '/settings', icon: Settings, requiresAuth: true },
]

const guestTabs = [
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Home', href: '/', icon: Zap, isCenter: true },
    { label: 'Community', href: '/community', icon: MessageCircle },
    { label: 'Login', href: '/login', icon: User },
]

export default function MobileTabBar() {
    const location = useLocation()
    const { user } = useAuth()

    const activeTabs = user ? tabs : guestTabs

    // Don't show on auth pages
    const hiddenPaths = ['/login', '/register', '/forgot-password', '/reset-password']
    if (hiddenPaths.some(p => location.pathname.startsWith(p))) return null

    return (
        <nav className="mobile-tab-bar">
            <div className="mobile-tab-bar-inner">
                {activeTabs.map((tab) => {
                    const isActive = tab.href === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(tab.href)
                    const Icon = tab.icon

                    if (tab.isCenter) {
                        return (
                            <Link
                                key={tab.label}
                                to={tab.href}
                                className="mobile-tab-center"
                                aria-label={tab.label}
                            >
                                <div className="mobile-tab-center-ring">
                                    <Icon size={22} strokeWidth={2.5} />
                                </div>
                            </Link>
                        )
                    }

                    return (
                        <Link
                            key={tab.label}
                            to={tab.href}
                            className={`mobile-tab ${isActive ? 'mobile-tab-active' : ''}`}
                            aria-label={tab.label}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                            <span className="mobile-tab-label">{tab.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
