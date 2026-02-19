import { useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ArrowRight, Shield, Wallet } from 'lucide-react'

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subheadlineRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const rafRef = useRef<number>(0)
  const particlesRef = useRef<Array<{
    x: number; y: number; baseX: number; baseY: number;
    size: number; alpha: number; speed: number;
  }>>([])

  // Spatial particle field
  const initParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = canvas.width = canvas.offsetWidth
    const h = canvas.height = canvas.offsetHeight
    const count = Math.min(Math.floor((w * h) / 8000), 120) // responsive count
    particlesRef.current = Array.from({ length: count }, () => {
      const x = Math.random() * w
      const y = Math.random() * h
      return {
        x, y, baseX: x, baseY: y,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        speed: Math.random() * 0.5 + 0.2,
      }
    })
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const w = canvas.width
    const h = canvas.height
    const mx = mouseRef.current.x * w
    const my = mouseRef.current.y * h

    ctx.clearRect(0, 0, w, h)

    particlesRef.current.forEach((p) => {
      // Spatial drift towards mouse
      const dx = mx - p.baseX
      const dy = my - p.baseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const influence = Math.max(0, 1 - dist / 400) * 30

      p.x += (p.baseX + dx * influence * 0.05 - p.x) * 0.08
      p.y += (p.baseY + dy * influence * 0.05 - p.y) * 0.08

      // Gentle float
      p.y += Math.sin(Date.now() * 0.001 * p.speed + p.baseX) * 0.3

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha * (0.5 + influence * 0.02)})`
      ctx.fill()
    })

    // Draw connections between nearby particles
    const particles = particlesRef.current
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(212, 175, 55, ${0.06 * (1 - dist / 100)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
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

  // Mouse + Touch tracking
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const handleMove = (clientX: number, clientY: number) => {
      const rect = section.getBoundingClientRect()
      mouseRef.current = {
        x: (clientX - rect.left) / rect.width,
        y: (clientY - rect.top) / rect.height,
      }
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
    }, sectionRef)

    return () => ctx.revert()
  }, [])

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
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-jence-gold/10 border border-jence-gold/20 mb-8 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-jence-green animate-pulse" />
          <span className="text-sm font-medium text-jence-gold">Now live in Nigeria</span>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="heading-xl text-foreground mb-6"
        >
          Expert sector research,
          <br />
          <span className="text-gradient-gold">published anonymously.</span>
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
