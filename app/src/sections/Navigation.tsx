import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, Zap, LogOut, Bell, Loader2 } from 'lucide-react'
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
            <div className="w-8 h-8 rounded-lg bg-jence-gold flex items-center justify-center">
              <Zap size={18} className="text-jence-black" />
            </div>
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
                                <div className="w-8 h-8 rounded-full bg-jence-gold/20 flex items-center justify-center text-jence-gold">
                                  <Zap size={14} />
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

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="theme-toggle w-9 h-9"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) =>
              link.href.startsWith('#') ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="pt-4 border-t border-border space-y-3">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="btn-primary w-full text-center block mb-4"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleSignOut(); setIsMobileMenuOpen(false) }}
                    className="block w-full text-left text-red-400 mt-2"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block w-full text-left text-muted-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary w-full text-center block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
