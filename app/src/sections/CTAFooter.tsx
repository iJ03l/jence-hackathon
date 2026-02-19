import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function CTAFooter() {
  return (
    <footer className="relative">
      {/* Gradient top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-jence-gold/30 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-14">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          {/* Brand Column */}
          <div className="space-y-4 max-w-xs">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-jence-gold/90 group-hover:bg-jence-gold flex items-center justify-center transition-colors">
                <Zap size={16} className="text-jence-black" />
              </div>
              <span className="font-bold text-base tracking-tight text-foreground">Jence</span>
            </Link>
            <p className="text-sm text-muted-foreground/70 leading-relaxed">
              Anonymous expert analysis platform for Nigeria's markets.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              <a href="https://twitter.com/jence_io" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-border/30 hover:bg-jence-gold/10 hover:border-jence-gold/30 border border-transparent flex items-center justify-center transition-all group">
                <svg className="w-3.5 h-3.5 text-muted-foreground group-hover:text-jence-gold transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://instagram.com/jence_io" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-border/30 hover:bg-jence-gold/10 hover:border-jence-gold/30 border border-transparent flex items-center justify-center transition-all group">
                <svg className="w-3.5 h-3.5 text-muted-foreground group-hover:text-jence-gold transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="https://linkedin.com/company/jence" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-border/30 hover:bg-jence-gold/10 hover:border-jence-gold/30 border border-transparent flex items-center justify-center transition-all group">
                <svg className="w-3.5 h-3.5 text-muted-foreground group-hover:text-jence-gold transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="mailto:hello@jence.io"
                className="w-8 h-8 rounded-lg bg-border/30 hover:bg-jence-gold/10 hover:border-jence-gold/30 border border-transparent flex items-center justify-center transition-all group">
                <svg className="w-3.5 h-3.5 text-muted-foreground group-hover:text-jence-gold transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-4">Platform</h4>
              <nav className="space-y-2.5">
                <Link to="/explore" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Explore</Link>
                <Link to="/register" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Sign up</Link>
                <Link to="/creator-onboarding" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Become a creator</Link>
                <Link to="/#faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-4">Legal</h4>
              <nav className="space-y-2.5">
                <Link to="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
                <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
                <Link to="/content-policy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Content Policy</Link>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground/40">
            &copy; {new Date().getFullYear()} Jence. All rights reserved.
          </p>
          <p className="text-[11px] text-muted-foreground/30 text-center sm:text-right max-w-sm">
            Content is for informational purposes only and does not constitute professional advice.
          </p>
        </div>
      </div>
    </footer>
  )
}
