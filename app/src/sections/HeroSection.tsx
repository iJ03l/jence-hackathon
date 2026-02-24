import { useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ArrowRight, Shield, Wallet, Clock, Lock } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const mockPosts = [
  { id: 'm1', title: 'NFL Week 12: Sharp money fading favorites', time: '1m ago', author: 'VegasInsider', vertical: 'Sports Betting' },
  { id: 'm2', title: 'USD/JPY correlation with Treasury yields breaking', time: '15m ago', author: 'FXMacro', vertical: 'Forex' },
  { id: 'm3', title: 'On-chain accumulation patterns for tier-1 altcoins', time: '1h ago', author: 'ChainIntel', vertical: 'Crypto' },
  { id: 'm4', title: 'Tracking dev activity spikes in low-cap memecoins', time: '3h ago', author: 'DegenWatch', vertical: 'Memecoins' },
  { id: 'm5', title: 'Election odds decoupling from polling data', time: '5h ago', author: 'PolyPredicts', vertical: 'Prediction Market' },
]

export default function HeroSection() {
  const { theme } = useTheme()
  const themeRef = useRef(theme)
  useEffect(() => { themeRef.current = theme }, [theme])
  const sectionRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subheadlineRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const mockPostsRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const rafRef = useRef<number>(0)

  const particlesRef = useRef<Array<{
    x: number; y: number; baseX: number; baseY: number;
    size: number; alpha: number; speedX: number; speedY: number; z: number; hue: number;
  }>>([])

  // Advanced Spatial Particle System
  const initParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = canvas.width = canvas.offsetWidth
    const h = canvas.height = canvas.offsetHeight
    const count = Math.min(Math.floor((w * h) / 6000), 120)

    particlesRef.current = Array.from({ length: count }, () => {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        baseX: Math.random() * w,
        baseY: Math.random() * h,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.2, // Opacity
        speedX: (Math.random() - 0.5) * 0.4, // Continuous horizontal drift
        speedY: (Math.random() - 0.5) * 0.4, // Continuous vertical drift
        z: Math.random() * 2 + 0.5, // Parallax depth
        hue: 0
      }
    })
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const w = canvas.width
    const h = canvas.height

    const isDark = themeRef.current === 'dark'

    // Smooth trailing effect instead of clearRect
    ctx.fillStyle = isDark ? 'rgba(10, 10, 10, 0.3)' : 'rgba(250, 250, 250, 0.3)'
    ctx.fillRect(0, 0, w, h)

    const mx = mouseRef.current.x * w
    const my = mouseRef.current.y * h

    ctx.globalCompositeOperation = 'source-over'

    particlesRef.current.forEach((p) => {
      // Continuous slow drift
      p.baseX += p.speedX
      p.baseY += p.speedY

      // Wrap around edges seamlessly
      if (p.baseX < -50) p.baseX = w + 50
      if (p.baseX > w + 50) p.baseX = -50
      if (p.baseY < -50) p.baseY = h + 50
      if (p.baseY > h + 50) p.baseY = -50

      // Parallax effect tracking the mouse relative to center
      const centerX = w / 2
      const centerY = h / 2
      const mouseOffsetX = (mx - centerX) * 0.05
      const mouseOffsetY = (my - centerY) * 0.05

      // Parallax application (closer particles move more)
      p.x = p.baseX + (mouseOffsetX * p.z)
      p.y = p.baseY + (mouseOffsetY * p.z)

      // Mouse repulsion
      const dx = mx - p.x
      const dy = my - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      const repulseRadius = 150
      if (dist < repulseRadius) {
        const force = (repulseRadius - dist) / repulseRadius
        p.x -= dx * force * 0.1
        p.y -= dy * force * 0.1
      }

      // Drawing dot
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = isDark
        ? `rgba(212, 175, 55, ${p.alpha})` // Gold
        : `rgba(15, 23, 42, ${p.alpha * 0.7})` // Slate
      ctx.fill()
    })

    // Draw dynamic glowing constellation connections
    const particles = particlesRef.current
    ctx.lineWidth = 0.6
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const connectionDistance = 100

        if (dist < connectionDistance) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)

          const opacity = 0.2 * (1 - dist / connectionDistance)
          ctx.strokeStyle = isDark
            ? `rgba(212, 175, 55, ${opacity})`
            : `rgba(15, 23, 42, ${opacity})`
          ctx.stroke()
        }
      }

      // Highlight mouse proximity
      const mdx = mx - particles[i].x
      const mdy = my - particles[i].y
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
      if (mdist < 150) {
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(mx, my)
        const mopacity = 0.3 * (1 - mdist / 150)
        ctx.strokeStyle = isDark
          ? `rgba(212, 175, 55, ${mopacity})`
          : `rgba(15, 23, 42, ${mopacity})`
        ctx.stroke()
      }
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    initParticles()
    rafRef.current = requestAnimationFrame(animate)

    const handleResize = () => {
      initParticles()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [initParticles, animate])

  // Mouse + Touch tracking (smoothed using GSAP)
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // Initialize to center
    mouseRef.current = { x: 0.5, y: 0.5 }

    const handleMove = (clientX: number, clientY: number) => {
      const rect = section.getBoundingClientRect()
      // Use GSAP quickTo for incredibly smooth mouse tracking interpolation
      gsap.to(mouseRef.current, {
        x: (clientX - rect.left) / rect.width,
        y: (clientY - rect.top) / rect.height,
        duration: 0.8,
        ease: 'power3.out'
      })
    }

    const onMouse = (e: MouseEvent) => handleMove(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    section.addEventListener('mousemove', onMouse)
    section.addEventListener('touchmove', onTouch, { passive: true })

    return () => {
      section.removeEventListener('mousemove', onMouse)
      section.removeEventListener('touchmove', onTouch)
      gsap.killTweensOf(mouseRef.current)
    }
  }, [])

  // GSAP intro animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

      tl.fromTo(headlineRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      )

      tl.fromTo(subheadlineRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      )

      tl.fromTo(ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.3'
      )

      const features = featuresRef.current?.querySelectorAll('.feature-item')
      if (features) {
        tl.fromTo(features,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
          '-=0.2'
        )
      }

      // Doorknob falling animation & Mock Posts flowing
      const badge = badgeRef.current
      const mockPostCards = mockPostsRef.current?.querySelectorAll('.mock-post-card')

      if (badge && mockPostCards && portalRef.current) {
        const isDark = themeRef.current === 'dark'
        // Wait 1.5s, then make the badge fall off a hinge
        const doorknobTl = gsap.timeline({ delay: 1.5 })

        doorknobTl.to(badge, {
          rotationZ: 45,
          transformOrigin: "left center",
          duration: 0.3,
          ease: 'power2.inOut',
        })
          .to(badge, {
            y: 200,
            rotationZ: 120,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.in',
          })

        // Reveal the portal and flow posts out
        doorknobTl.to(portalRef.current, {
          boxShadow: isDark ? 'inset 0 0 20px rgba(0,0,0,0.8)' : 'inset 0 0 15px rgba(0,0,0,0.2)',
          duration: 0.3,
        }, "-=0.2")

        // Flow posts out sequentially in an infinite loop
        gsap.to(mockPostCards, {
          keyframes: [
            { y: -20, opacity: 1, scale: 1, duration: 1.0 },
            { y: -100, opacity: 1, scale: 1.05, duration: 3.0 },
            { y: -150, opacity: 0, scale: 1.1, duration: 1.0 }
          ],
          stagger: {
            each: 2.4,
            repeat: -1,
            repeatDelay: 0.5
          },
          ease: 'power1.out',
          delay: 2.2 // Start flowing immediately after door falls
        })
      }

    }, sectionRef)

    return () => ctx.revert()
  }, [themeRef])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12 overflow-hidden"
    >
      {/* Spatial particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.8 }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-jence-gold/3 via-transparent to-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial from-jence-gold/5 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge / Doorknob / Portal */}
        <div className="relative mx-auto mb-10 w-[180px] h-[40px] flex justify-center items-center">

          {/* Internal Portal hole (behind the doorknob) */}
          <div
            ref={portalRef}
            className="absolute inset-0 rounded-full bg-black/40 border border-black/20 overflow-visible"
          >
            {/* Posts flowing out of portal */}
            <div ref={mockPostsRef} className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[260px] pointer-events-none">
              {mockPosts.map((post) => (
                <div
                  key={post.id}
                  className="mock-post-card absolute bottom-0 left-0 w-full card-plug p-3 bg-background/95 backdrop-blur shadow-xl border-jence-gold/30 flex flex-col gap-1 z-0 origin-bottom"
                  style={{ opacity: 0, transform: 'translateY(20px) scale(0.8)' }}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={10} /> {post.time}</span>
                    <span className="text-[10px] text-jence-gold bg-jence-gold/10 px-1.5 py-0.5 rounded flex items-center gap-1"><Lock size={8} /> {post.vertical}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-foreground truncate text-left">{post.title}</h4>
                  <span className="text-[10px] text-muted-foreground text-left">{post.author}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Doorknob (The original badge) */}
          <div
            ref={badgeRef}
            className="absolute z-10 inset-0 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-background border border-border shadow-sm shadow-jence-gold/10"
          >
            <div className="w-2 h-2 rounded-full bg-jence-green animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">Now live globally</span>
          </div>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="heading-xl text-foreground mb-6"
        >
          Know what
          <br />
          <span className="text-gradient-gold">They know.</span>
        </h1>

        {/* Subheadline */}
        <p
          ref={subheadlineRef}
          className="body-lg max-w-2xl mx-auto mb-10"
        >
          Subscribe to independent analysts sharing expert commentary, research, and professional
          opinion across banking, markets, policy, and more. Anonymous and crypto-settled.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link to="/register" className="btn-primary w-full sm:w-auto active:scale-[0.97] transition-all">
            Get started
            <ArrowRight size={18} />
          </Link>
          <Link to="/explore" className="btn-secondary w-full sm:w-auto active:scale-[0.97] transition-all">
            Explore verticals
          </Link>
        </div>

        {/* Features */}
        <div
          ref={featuresRef}
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          <div className="feature-item flex items-center gap-2">
            <Shield size={16} className="text-jence-green" />
            <span>Anonymous by design</span>
          </div>
          <div className="feature-item flex items-center gap-2">
            <Wallet size={16} className="text-jence-gold" />
            <span>Crypto payments only</span>
          </div>
        </div>
      </div>
    </section>
  )
}
