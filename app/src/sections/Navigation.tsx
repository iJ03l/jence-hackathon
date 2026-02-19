import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, Zap, LogOut } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const isLanding = location.pathname === '/'
  const isLoggedIn = !!user

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navLinks = isLanding && !isLoggedIn
    ? [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Creators', href: '#creators' },
      { label: 'Verticals', href: '#verticals' },
      { label: 'Forum', href: '#forum' },
    ]
    : [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Explore', href: '/explore' },
      { label: 'Settings', href: '/settings' },
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
          <div className="hidden md:flex items-center gap-8">
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

            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                  <div className="w-6 h-6 rounded-full bg-jence-gold/20 flex items-center justify-center text-xs font-bold text-jence-gold">
                    {user.name?.[0] || '?'}
                  </div>
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
                <button
                  onClick={() => { handleSignOut(); setIsMobileMenuOpen(false) }}
                  className="block w-full text-left text-red-400"
                >
                  Sign out
                </button>
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
