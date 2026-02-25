import { Link } from 'react-router-dom'

export default function CTAFooter() {
  return (
    <footer className="relative overflow-hidden bg-background border-t border-border/50">

      {/* Animated Minimal Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-[50%] -left-[10%] w-[120%] h-[200%] bg-gradient-to-br from-jence-gold/5 via-transparent to-transparent animate-slow-pulse blur-3xl rounded-[100%]" />
        <div className="absolute top-[30%] -right-[20%] w-[100%] h-[150%] bg-gradient-to-tl from-jence-gold/10 via-transparent to-transparent animate-slow-pulse blur-[100px] rounded-[100%] delay-1000" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">

          {/* Brand & Tagline */}
          <div className="space-y-4 max-w-sm">
            <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80 w-fit">
              <img src="/logo.png" alt="Jence Logo" className="w-10 h-10 object-contain rounded-xl" />
              <span className="font-bold text-3xl tracking-tighter text-foreground lowercase">jence</span>
            </Link>
            <p className="text-sm text-muted-foreground/70 leading-relaxed font-mono">
              The premier knowledge platform.
              <br />
              <span className="mt-2 block opacity-75">
                &copy; {new Date().getFullYear()} Jence. All rights reserved.
              </span>
            </p>
          </div>

          {/* Links & Social */}
          <div className="flex flex-col sm:flex-row items-center gap-10">
            {/* Legal */}
            <div className="flex gap-6 sm:gap-10">
              <Link to="/terms" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <Link to="/privacy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <a href="mailto:hello@jence.xyz" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Support</a>
            </div>

            {/* Socials */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a href="https://x.com/tryjence" target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card hover:bg-muted hover:border-jence-gold/30 transition-all shadow-sm">
                <svg className="w-4 h-4 text-foreground group-hover:text-jence-gold transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-sm font-semibold text-foreground group-hover:text-jence-gold transition-colors">@tryjence</span>
              </a>
              <a href="https://tiktok.com/@tryjence" target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card hover:bg-muted hover:border-jence-gold/30 transition-all shadow-sm">
                <svg className="w-4 h-4 text-foreground group-hover:text-jence-gold transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
                <span className="text-sm font-semibold text-foreground group-hover:text-jence-gold transition-colors">@tryjence</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

