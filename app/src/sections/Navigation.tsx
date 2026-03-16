import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Sun, Moon, LogOut, Bell, Loader2, X, Menu } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  const isLoggedIn = !!user

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Poll unread notifications
  useEffect(() => {
    if (!user?.id) return
    const fetchCount = () => {
      api.getUnreadCount(user.id).then(d => setUnreadCount(d.count)).catch(() => { })
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000) // every 30s
    return () => clearInterval(interval)
  }, [user?.id])

  const [notifications, setNotifications] = useState<any[]>([])
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  useEffect(() => {
    if (isNotificationsOpen && user?.id) {
      setLoadingNotifications(true)
      api.getNotifications(user.id)
        .then(setNotifications)
        .catch(console.error)
        .finally(() => setLoadingNotifications(false))

      // Mark all as read when opening (optional, or separate button)
      // For now let's just fetch.
    }
  }, [isNotificationsOpen, user?.id])

  const handleMarkAllRead = async () => {
    if (!user?.id) return
    try {
      await api.markNotificationsRead(user.id)
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (e) {
      console.error(e)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navLinks = [
    { label: 'Explore', href: '/explore' },
    { label: 'Launch Notes', href: '/launches' },
    { label: 'Community', href: '/community' },
    ...(isLoggedIn ? [{ label: 'Settings', href: '/settings' }] : []),
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'nav-blur border-b border-border' : 'bg-transparent'
        }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Jence Logo" className="w-8 h-8 object-contain rounded-lg" />
            <span className="font-bold text-lg tracking-tight text-foreground">
              Jence
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {navLinks.map((link) =>
              link.href.startsWith('#') ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`text-sm transition-colors ${location.pathname === link.href
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors outline-none"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-jence-gold text-jence-black text-[10px] font-bold flex items-center justify-center border-2 border-background">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 md:w-96 rounded-xl border border-border bg-background shadow-lg shadow-black/5 p-1 animate-in fade-in zoom-in-95 origin-top-right z-50">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-jence-gold hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto py-1">
                      {loadingNotifications ? (
                        <div className="flex justify-center p-4">
                          <Loader2 size={16} className="animate-spin text-muted-foreground" />
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <Link
                            key={notif.id}
                            to={notif.postId ? `/verticals/${notif.verticalSlug || 'all'}` : '#'}
                            // ideally link to the specific post context or modality
                            className={`block px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors ${!notif.isRead ? 'bg-muted/20' : ''}`}
                            onClick={() => setIsNotificationsOpen(false)}
                          >
                            <div className="flex gap-3">
                              <div className="shrink-0 mt-0.5">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                                  <img src="/logo.png" alt="Jence Notification" className="w-full h-full object-cover" />
                                </div>
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-sm font-medium text-foreground truncate">{notif.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.body}</p>
                                <p className="text-[10px] text-muted-foreground mt-1.5 opacity-70">
                                  {new Date(notif.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              {!notif.isRead && (
                                <div className="shrink-0 mt-2">
                                  <div className="w-2 h-2 rounded-full bg-jence-gold" />
                                </div>
                              )}
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Backdrop to close */}
                {isNotificationsOpen && (
                  <div
                    className="fixed inset-0 z-40 bg-transparent cursor-default"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                )}
              </div>
            )}

            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="hidden lg:flex items-center justify-center btn-primary text-sm py-2 px-4 whitespace-nowrap">
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 ml-1">
                  {user.image ? (
                    <img src={user.image} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-jence-gold/20 flex items-center justify-center text-xs font-bold text-jence-gold">
                      {user.name?.[0] || '?'}
                    </div>
                  )}
                  <span className="text-sm text-foreground">{user.name?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2.5">
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions (Theme Toggle & Notifications) */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="theme-toggle w-9 h-9"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors outline-none"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-jence-gold text-jence-black text-[10px] font-bold flex items-center justify-center border-2 border-background">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -mr-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center w-10 h-10 group"
              aria-label="Open menu"
            >
              <Menu size={20} className="transition-transform group-hover:scale-110" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="absolute inset-y-0 right-0 w-3/4 max-w-sm bg-background border-l border-border shadow-2xl animate-in slide-in-from-right sm:w-1/2">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <span className="font-bold text-lg">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* User Profile (if logged in) */}
              {isLoggedIn && user ? (
                <div className="p-4 border-b border-border/50 bg-muted/20">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img src={user.image} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-jence-gold/20 flex items-center justify-center text-sm font-bold text-jence-gold">
                        {user.name?.[0] || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground">{user.name}</p>
                      {user.username && <p className="text-sm text-muted-foreground">@{user.username}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-b border-border/50 flex flex-col gap-2">
                  <Link to="/login" className="btn-secondary w-full text-center py-2">Log in</Link>
                  <Link to="/register" className="btn-primary w-full text-center py-2">Get started</Link>
                </div>
              )}

              {/* Links */}
              <div className="flex-1 overflow-y-auto py-2">
                <div className="flex flex-col px-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      className={`px-4 py-3 rounded-xl flex items-center text-sm font-medium transition-colors ${location.pathname === link.href
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {isLoggedIn && (
                    <Link
                      to="/dashboard"
                      className={`px-4 py-3 rounded-xl flex items-center text-sm font-medium transition-colors mt-2 ${location.pathname === '/dashboard'
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                    >
                      Dashboard
                    </Link>
                  )}
                </div>
              </div>

              {/* Footer */}
              {isLoggedIn && (
                <div className="p-4 border-t border-border/50">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={18} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

    </nav>
  )
}
