import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useTheme } from '../context/ThemeContext'
import {
  Cpu, Bot, Shield, Settings, Plane,
  Activity, Eye, BatteryCharging, Wrench, FlaskConical,
  ArrowRight, ArrowLeft, Sparkles, BookOpen, PenLine, Check, X
} from 'lucide-react'

/* ─── vertical data ─── */
const verticals = [
  { id: 1, slug: 'embedded-firmware', name: 'Embedded & Firmware', icon: Cpu, color: '#2563EB' },
  { id: 2, slug: 'robotics-software', name: 'Robotics Software', icon: Bot, color: '#16A34A' },
  { id: 3, slug: 'hardware-security', name: 'Hardware Security', icon: Shield, color: '#F59E0B' },
  { id: 4, slug: 'industrial-ot-robotics', name: 'Industrial / OT', icon: Settings, color: '#0EA5E9' },
  { id: 5, slug: 'drones-mobile-systems', name: 'Drones & Mobile', icon: Plane, color: '#6366F1' },
  { id: 6, slug: 'humanoids-actuation', name: 'Humanoids & Actuation', icon: Activity, color: '#EF4444' },
  { id: 7, slug: 'sensors-perception', name: 'Sensors & Perception', icon: Eye, color: '#22C55E' },
  { id: 8, slug: 'power-thermal', name: 'Power / Thermal', icon: BatteryCharging, color: '#F97316' },
  { id: 9, slug: 'mechanical-manufacturing', name: 'Mechanical / DFM', icon: Wrench, color: '#14B8A6' },
  { id: 10, slug: 'research-benchmarks', name: 'Research & Benchmarks', icon: FlaskConical, color: '#A855F7' },
]

/* ─── mock articles ─── */
const mockArticles: Record<string, { title: string; author: string; time: string }[]> = {
  'embedded-firmware': [
    { title: 'Boot time regression hunt: instrumentation, traces, and the fix', author: 'Dr. Amina Yusuf', time: '2h ago' },
    { title: 'RTOS bring-up on a custom SoC: what went wrong', author: 'Leo Marquez', time: '5h ago' },
  ],
  'robotics-software': [
    { title: 'ROS2 nav stack tuning for constrained compute', author: 'Ada Okoye', time: '1h ago' },
    { title: 'Simulation-to-real transfer: bridging the gap', author: 'Nina Petrov', time: '4h ago' },
  ],
  'hardware-security': [
    { title: 'Secure boot pitfalls in low-cost MCUs', author: 'Rina Cho', time: '3h ago' },
    { title: 'Supply chain firmware verification at scale', author: 'Kenji Ito', time: '6h ago' },
  ],
  'industrial-ot-robotics': [
    { title: 'PLC safety systems: lessons from a near-miss', author: 'Marcus Wei', time: '2h ago' },
  ],
  'drones-mobile-systems': [
    { title: 'Visual odometry in GPS-denied environments', author: 'Sara Kim', time: '1h ago' },
  ],
  'humanoids-actuation': [
    { title: 'Actuator vendor reliability: what tests to run', author: 'James Park', time: '4h ago' },
  ],
  'sensors-perception': [
    { title: 'Sensor fusion benchmark: lidar + IMU drift under vibration', author: 'Maya Patel', time: '1h ago' },
  ],
  'power-thermal': [
    { title: 'Power budget audit for an 8-DoF arm', author: 'Kenji Liu', time: '3h ago' },
  ],
  'mechanical-manufacturing': [
    { title: 'DFM teardown: fastener strategy that cut assembly time 22%', author: 'Luis Herrera', time: '5h ago' },
  ],
  'research-benchmarks': [
    { title: 'Reproducibility in manipulation benchmarks', author: 'Dr. Anya Kowalski', time: '2h ago' },
  ],
}

const TOTAL_STEPS = 5

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [step, setStep] = useState(0)
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>([])
  const [role, setRole] = useState<'reader' | 'creator' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const stepRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Array<{
    x: number; y: number; baseX: number; baseY: number;
    size: number; alpha: number; speedX: number; speedY: number; z: number;
  }>>([])
  const rafRef = useRef<number>(0)
  const touchStartRef = useRef<number>(0)

  /* ─── Particle System (reused from Hero) ─── */
  const initParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = canvas.width = canvas.offsetWidth
    const h = canvas.height = canvas.offsetHeight
    const count = Math.min(Math.floor((w * h) / 8000), 80)
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      baseX: Math.random() * w, baseY: Math.random() * h,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      z: Math.random() * 2 + 0.5,
    }))
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const w = canvas.width, h = canvas.height
    const isDark = document.documentElement.classList.contains('dark')
    ctx.fillStyle = isDark ? 'rgba(10, 10, 10, 0.25)' : 'rgba(250, 250, 250, 0.25)'
    ctx.fillRect(0, 0, w, h)

    particlesRef.current.forEach(p => {
      p.baseX += p.speedX; p.baseY += p.speedY
      if (p.baseX < -20) p.baseX = w + 20
      if (p.baseX > w + 20) p.baseX = -20
      if (p.baseY < -20) p.baseY = h + 20
      if (p.baseY > h + 20) p.baseY = -20
      p.x = p.baseX; p.y = p.baseY
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = isDark
        ? `rgba(212, 175, 55, ${p.alpha})`
        : `rgba(15, 23, 42, ${p.alpha * 0.6})`
      ctx.fill()
    })

    // connections
    const pts = particlesRef.current
    ctx.lineWidth = 0.4
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x
        const dy = pts[i].y - pts[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 90) {
          const op = 0.15 * (1 - dist / 90)
          ctx.beginPath()
          ctx.moveTo(pts[i].x, pts[i].y)
          ctx.lineTo(pts[j].x, pts[j].y)
          ctx.strokeStyle = isDark
            ? `rgba(212, 175, 55, ${op})`
            : `rgba(15, 23, 42, ${op})`
          ctx.stroke()
        }
      }
    }
    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    initParticles()
    rafRef.current = requestAnimationFrame(animate)
    const handleResize = () => initParticles()
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [initParticles, animate])

  /* ─── Step transition animation ─── */
  useEffect(() => {
    if (!stepRef.current) return
    gsap.fromTo(stepRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    )
    // Animate children with stagger
    const children = stepRef.current.querySelectorAll('.anim-item')
    if (children.length) {
      gsap.fromTo(children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.15 }
      )
    }
  }, [step])

  /* ─── Swipe support ─── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartRef.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 60) {
      if (diff > 0 && canAdvance()) goNext()
      else if (diff < 0 && step > 0) goPrev()
    }
  }

  /* ─── Navigation ─── */
  const canAdvance = () => {
    if (step === 1 && selectedVerticals.length === 0) return false
    if (step === 2 && !role) return false
    return true
  }

  const goNext = () => {
    if (step >= TOTAL_STEPS - 1) return
    if (!canAdvance()) return
    gsap.to(stepRef.current, {
      opacity: 0, y: -20, duration: 0.25, ease: 'power2.in',
      onComplete: () => setStep(s => s + 1)
    })
  }

  const goPrev = () => {
    if (step <= 0) return
    gsap.to(stepRef.current, {
      opacity: 0, y: 20, duration: 0.25, ease: 'power2.in',
      onComplete: () => setStep(s => s - 1)
    })
  }

  const finishOnboarding = (destination: string) => {
    localStorage.setItem('jence_onboarded', 'true')
    if (selectedVerticals.length > 0) {
      localStorage.setItem('jence_verticals', JSON.stringify(selectedVerticals))
    }
    if (role) {
      localStorage.setItem('jence_role', role)
    }
    navigate(destination)
  }

  const skip = () => finishOnboarding('/')

  const toggleVertical = (slug: string) => {
    setSelectedVerticals(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    )
  }

  /* ─── Get personalized articles ─── */
  const getPreviewArticles = () => {
    const slugs = selectedVerticals.length > 0 ? selectedVerticals : verticals.map(v => v.slug)
    const articles: { title: string; author: string; time: string; vertical: string }[] = []
    for (const slug of slugs) {
      const items = mockArticles[slug] || []
      items.forEach(a => articles.push({ ...a, vertical: verticals.find(v => v.slug === slug)?.name || slug }))
    }
    // Shuffle and take 4
    return articles.sort(() => Math.random() - 0.5).slice(0, 4)
  }

  /* ─── Progress Bar ─── */
  const progress = ((step + 1) / TOTAL_STEPS) * 100

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.7 }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-jence-gold/3 via-transparent to-background pointer-events-none" />

      {/* Top Bar: Progress + Skip */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex-1 mr-4">
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-jence-gold to-[#FFA500] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-jence-gold scale-125' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
        <button
          onClick={skip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/50 shrink-0"
        >
          Skip
        </button>
      </div>

      {/* Step Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 overflow-y-auto">
        <div ref={stepRef} className="w-full max-w-lg mx-auto text-center">

          {/* ──── STEP 0: Welcome ──── */}
          {step === 0 && (
            <div className="space-y-8">
              <div className="anim-item">
                <img src="/logo.png" alt="Jence" className="w-16 h-16 mx-auto rounded-2xl mb-4" />
                <div className="w-2 h-2 rounded-full bg-jence-green animate-pulse mx-auto mb-6" />
              </div>
              <div className="anim-item">
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
                  Welcome to <span className="text-gradient-gold">Jence</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Robotics & Hardware. Every Layer.
                </p>
              </div>
              <div className="anim-item space-y-3 max-w-xs mx-auto">
                <div className="flex items-center gap-3 text-left p-3 rounded-xl bg-card/80 border border-border/50 backdrop-blur-sm">
                  <BookOpen size={20} className="text-jence-gold shrink-0" />
                  <span className="text-sm text-foreground">Deep technical articles & teardowns</span>
                </div>
                <div className="flex items-center gap-3 text-left p-3 rounded-xl bg-card/80 border border-border/50 backdrop-blur-sm">
                  <Sparkles size={20} className="text-jence-gold shrink-0" />
                  <span className="text-sm text-foreground">Market intelligence & startup coverage</span>
                </div>
                <div className="flex items-center gap-3 text-left p-3 rounded-xl bg-card/80 border border-border/50 backdrop-blur-sm">
                  <PenLine size={20} className="text-jence-gold shrink-0" />
                  <span className="text-sm text-foreground">Developer community & Q&A</span>
                </div>
              </div>
            </div>
          )}

          {/* ──── STEP 1: Pick Your Stack ──── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="anim-item">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Build your <span className="text-gradient-gold">stack</span>
                </h2>
                <p className="text-muted-foreground text-sm">
                  Select the engineering areas you care about
                </p>
              </div>

              <div className="anim-item flex items-center justify-center gap-2 mb-2">
                <span className="text-sm font-mono text-jence-gold">{selectedVerticals.length}</span>
                <span className="text-xs text-muted-foreground">of {verticals.length} selected</span>
                <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden ml-2">
                  <div
                    className="h-full rounded-full bg-jence-gold transition-all duration-300"
                    style={{ width: `${(selectedVerticals.length / verticals.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                {verticals.map(v => {
                  const Icon = v.icon
                  const selected = selectedVerticals.includes(v.slug)
                  return (
                    <button
                      key={v.id}
                      onClick={() => toggleVertical(v.slug)}
                      className={`anim-item relative flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 active:scale-[0.96] ${
                        selected
                          ? 'border-jence-gold bg-jence-gold/10 shadow-sm shadow-jence-gold/20'
                          : 'border-border bg-card/80 hover:border-border/80'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200"
                        style={{
                          backgroundColor: `${v.color}15`,
                          color: v.color,
                          transform: selected ? 'scale(1.1)' : 'scale(1)'
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <span className={`text-xs font-medium line-clamp-1 ${selected ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {v.name}
                      </span>
                      {selected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-jence-gold flex items-center justify-center">
                          <Check size={10} className="text-jence-black" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ──── STEP 2: Your Role ──── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="anim-item">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  How will you use <span className="text-gradient-gold">Jence?</span>
                </h2>
                <p className="text-muted-foreground text-sm">
                  You can always change this later
                </p>
              </div>

              <div className="flex flex-col gap-4 max-w-xs mx-auto">
                <button
                  onClick={() => setRole('reader')}
                  className={`anim-item relative p-5 rounded-2xl border text-left transition-all duration-300 active:scale-[0.97] ${
                    role === 'reader'
                      ? 'border-jence-gold bg-jence-gold/10 shadow-lg shadow-jence-gold/10'
                      : 'border-border bg-card/80 hover:border-jence-gold/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      role === 'reader' ? 'bg-jence-gold/20' : 'bg-muted'
                    }`}>
                      <BookOpen size={20} className={role === 'reader' ? 'text-jence-gold' : 'text-muted-foreground'} />
                    </div>
                    <h3 className="font-semibold text-foreground">Reader</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-[52px]">
                    Read articles, join discussions, follow engineers, and explore technical verticals.
                  </p>
                  {role === 'reader' && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-jence-gold flex items-center justify-center">
                      <Check size={14} className="text-jence-black" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setRole('creator')}
                  className={`anim-item relative p-5 rounded-2xl border text-left transition-all duration-300 active:scale-[0.97] ${
                    role === 'creator'
                      ? 'border-jence-gold bg-jence-gold/10 shadow-lg shadow-jence-gold/10'
                      : 'border-border bg-card/80 hover:border-jence-gold/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      role === 'creator' ? 'bg-jence-gold/20' : 'bg-muted'
                    }`}>
                      <PenLine size={20} className={role === 'creator' ? 'text-jence-gold' : 'text-muted-foreground'} />
                    </div>
                    <h3 className="font-semibold text-foreground">Creator</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-[52px]">
                    Publish credited engineering work, share teardowns, and build your reputation.
                  </p>
                  {role === 'creator' && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-jence-gold flex items-center justify-center">
                      <Check size={14} className="text-jence-black" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ──── STEP 3: Personalized Preview ──── */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="anim-item">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Your <span className="text-gradient-gold">feed</span> preview
                </h2>
                <p className="text-muted-foreground text-sm">
                  Here's what's waiting for you
                </p>
              </div>

              <div className="space-y-3 max-w-sm mx-auto">
                {getPreviewArticles().map((article, i) => (
                  <div
                    key={i}
                    className="anim-item flex items-start gap-3 p-3.5 rounded-xl bg-card/90 border border-border/60 text-left backdrop-blur-sm transition-all hover:border-jence-gold/30"
                  >
                    <div className="w-2 h-2 rounded-full bg-jence-gold mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{article.author}</span>
                        <span>·</span>
                        <span>{article.time}</span>
                      </div>
                      <span className="inline-block mt-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
                        {article.vertical}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ──── STEP 4: Join or Explore ──── */}
          {step === 4 && (
            <div className="space-y-8">
              <div className="anim-item">
                <div className="w-14 h-14 rounded-2xl bg-jence-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={28} className="text-jence-gold" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  You're <span className="text-gradient-gold">all set</span>
                </h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  {selectedVerticals.length > 0
                    ? `${selectedVerticals.length} verticals selected${role ? ` as a ${role}` : ''}. Let's go.`
                    : 'Ready to explore robotics and hardware engineering.'}
                </p>
              </div>

              <div className="anim-item flex flex-col gap-3 max-w-xs mx-auto">
                <button
                  onClick={() => finishOnboarding('/register')}
                  className="btn-primary w-full justify-center py-3.5 text-base active:scale-[0.97] transition-all"
                >
                  Join Jence
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => finishOnboarding('/explore')}
                  className="btn-secondary w-full justify-center py-3 text-sm active:scale-[0.97] transition-all"
                >
                  Explore first
                </button>
              </div>

              <p className="anim-item text-xs text-muted-foreground">
                Free to read. Credited authorship. Disclosure-first.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="relative z-10 flex items-center justify-between px-5 py-4 border-t border-border/30">
        <button
          onClick={goPrev}
          disabled={step === 0}
          className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl transition-all active:scale-[0.96] ${
            step === 0
              ? 'text-muted-foreground/30 cursor-not-allowed'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Step indicator */}
        <span className="text-xs font-mono text-muted-foreground">
          {step + 1} / {TOTAL_STEPS}
        </span>

        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={goNext}
            disabled={!canAdvance()}
            className={`flex items-center gap-1.5 text-sm font-medium px-5 py-2.5 rounded-xl transition-all active:scale-[0.96] ${
              canAdvance()
                ? 'bg-jence-gold text-jence-black hover:shadow-lg hover:shadow-jence-gold/20'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            Next
            <ArrowRight size={16} />
          </button>
        ) : (
          <div className="w-20" /> /* Spacer for last step since CTAs are in content */
        )}
      </div>
    </div>
  )
}
