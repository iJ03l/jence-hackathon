import { useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, MessageSquare, TrendingUp } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface TrendingThreadsProps {
  className?: string
}

const threads = [
  {
    id: 1,
    title: 'Embedded trace capture: profiling an RTOS latency spike',
    category: 'Embedded',
    author: '@mchen',
    time: '2h',
    comments: 18,
    trending: true,
  },
  {
    id: 2,
    title: 'Drones in wind shear: controller update notes',
    category: 'Drones',
    author: '@ksingh',
    time: '4h',
    comments: 27,
    trending: true,
  },
  {
    id: 3,
    title: 'Secure boot failures in low-cost SoCs',
    category: 'Security',
    author: '@rcho',
    time: '5h',
    comments: 22,
    trending: false,
  },
  {
    id: 4,
    title: 'Thermal audit for a compact actuator stack',
    category: 'Power',
    author: '@powerbench',
    time: '6h',
    comments: 14,
    trending: false,
  },
  {
    id: 5,
    title: 'Sensor fusion dataset release with methodology',
    category: 'Perception',
    author: '@mpatel',
    time: '8h',
    comments: 19,
    trending: false,
  },
  {
    id: 6,
    title: 'Manufacturing notes: tolerance stack for a 6-DoF arm',
    category: 'Mechanical',
    author: '@lnandakumar',
    time: '12h',
    comments: 33,
    trending: true,
  },
]

export default function TrendingThreads({ className = '' }: TrendingThreadsProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(headerRef.current,
        { y: '3vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'top 55%',
            scrub: true,
          }
        }
      )

      // Rows animation
      const rows = listRef.current?.querySelectorAll('.thread-row')
      if (rows) {
        gsap.fromTo(rows,
          { x: '-8vw', opacity: 0 },
          {
            x: 0,
            opacity: 1,
            stagger: 0.10,
            scrollTrigger: {
              trigger: listRef.current,
              start: 'top 85%',
              end: 'top 45%',
              scrub: true,
            }
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={`section-flowing py-20 lg:py-28 bg-jence-black ${className}`}
    >
      <div className="w-full px-6 lg:px-12">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-3">
            <h2 className="heading-2 font-semibold text-jence-white">
              Trending threads
            </h2>
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-jence-green/10">
              <TrendingUp size={14} className="text-jence-green" />
              <span className="text-xs text-jence-green font-mono">LIVE</span>
            </div>
          </div>
          <a
            href="#"
            className="flex items-center gap-2 text-jence-gray hover:text-jence-green transition-colors"
          >
            <span className="text-sm hidden sm:inline">Open feed</span>
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Thread List */}
        <div ref={listRef} className="space-y-3">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className="thread-row group flex items-center gap-4 p-4 lg:p-5 rounded-[18px] bg-jence-dark border border-white/5 cursor-pointer"
            >
              {/* Category Badge */}
              <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 shrink-0">
                <span className="font-mono text-[10px] uppercase text-jence-gray text-center leading-tight">
                  {thread.category.split(' ')[0]}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {thread.trending && (
                    <span className="text-jence-green text-xs">
                      <TrendingUp size={12} className="inline" />
                    </span>
                  )}
                  <h3 className="text-jence-white font-medium truncate group-hover:text-jence-green transition-colors">
                    {thread.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-jence-gray">
                  <span className="font-mono">{thread.author}</span>
                  <span className="text-white/20">·</span>
                  <span>{thread.time} ago</span>
                  <span className="text-white/20">·</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} />
                    {thread.comments}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight
                size={18}
                className="text-jence-gray/40 group-hover:text-jence-green group-hover:translate-x-1 transition-all shrink-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
