import { Link } from 'react-router-dom'
import { Zap, Github, Twitter, ArrowUpRight } from 'lucide-react'

export default function CTAFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden">
      {/* CTA Section */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-jence-gold/3 to-jence-gold/5" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="heading-lg text-foreground mb-4">
            Ready to access <span className="text-gradient-gold">expert analysis</span>?
          </h2>
          <p className="body-lg mb-8 max-w-xl mx-auto">
            Join thousands of subscribers getting independent sector research from verified creators across Nigeria.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5">
              Start reading now
              <ArrowUpRight size={18} />
            </Link>
            <Link to="/explore" className="btn-secondary text-base px-8 py-3.5">
              Browse verticals
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            {/* Brand */}
            <div className="md:col-span-4">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-jence-gold flex items-center justify-center">
                  <Zap size={18} className="text-jence-black" />
                </div>
                <span className="font-bold text-lg tracking-tight text-foreground">Jence</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Anonymous expert analysis platform. Verified creators, independent sector research,
                crypto-settled subscriptions.
              </p>
            </div>

            {/* Platform */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">Platform</h4>
              <nav className="space-y-2.5">
                <Link to="/explore" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Explore
                </Link>
                <Link to="/register" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign up
                </Link>
                <Link to="/creator-onboarding" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Become a creator
                </Link>
              </nav>
            </div>

            {/* Legal */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">Legal</h4>
              <nav className="space-y-2.5">
                <Link to="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/content-policy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Content Policy
                </Link>
              </nav>
            </div>

            {/* Connect */}
            <div className="md:col-span-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">Stay updated</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Get platform updates and new vertical announcements.
              </p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="input-field flex-1 text-sm"
                />
                <button type="submit" className="btn-primary text-sm px-4 shrink-0">
                  Subscribe
                </button>
              </form>
              <div className="flex items-center gap-3 mt-4">
                <a
                  href="#"
                  className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={16} />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <Github size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} Jence. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/60 max-w-md text-center sm:text-right">
              Content on Jence is for informational purposes only and does not constitute professional advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
