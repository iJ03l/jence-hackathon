import { useRef, useLayoutEffect, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Cpu, Bot, Shield, Settings, Plane,
  Activity, Eye, BatteryCharging, Wrench, FlaskConical
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const verticals = [
  {
    id: 1,
    slug: 'embedded-firmware',
    name: 'Embedded & Firmware',
    description: 'RTOS, bring-up, interfaces, and performance',
    icon: Cpu,
    color: '#2563EB',
    creators: 42,
  },
  {
    id: 2,
    slug: 'robotics-software',
    name: 'Robotics Software',
    description: 'ROS2, autonomy stacks, tooling, and simulation',
    icon: Bot,
    color: '#16A34A',
    creators: 28,
  },
  {
    id: 3,
    slug: 'hardware-security',
    name: 'Hardware Security',
    description: 'Defensive research and responsible disclosure',
    icon: Shield,
    color: '#F59E0B',
    creators: 67,
  },
  {
    id: 4,
    slug: 'industrial-ot-robotics',
    name: 'Industrial / OT Robotics',
    description: 'Automation, safety systems, deployment lessons',
    icon: Settings,
    color: '#0EA5E9',
    creators: 31,
  },
  {
    id: 5,
    slug: 'drones-mobile-systems',
    name: 'Drones & Mobile Systems',
    description: 'Navigation, planning, and field operations',
    icon: Plane,
    color: '#6366F1',
    creators: 45,
  },
  {
    id: 6,
    slug: 'humanoids-actuation',
    name: 'Humanoids & Actuation',
    description: 'Actuators, control loops, and safety limits',
    icon: Activity,
    color: '#EF4444',
    creators: 38,
  },
  {
    id: 7,
    slug: 'sensors-perception',
    name: 'Sensors & Perception',
    description: 'Calibration, perception, and benchmarks',
    icon: Eye,
    color: '#22C55E',
    creators: 52,
  },
  {
    id: 8,
    slug: 'power-thermal',
    name: 'Power / Batteries / Thermal',
    description: 'BMS, power delivery, thermal design',
    icon: BatteryCharging,
    color: '#F97316',
    creators: 25,
  },
  {
    id: 9,
    slug: 'mechanical-manufacturing',
    name: 'Mechanical / Manufacturing / DFM',
    description: 'Materials, tolerances, production lessons',
    icon: Wrench,
    color: '#14B8A6',
    creators: 19,
  },
  {
    id: 10,
    slug: 'research-benchmarks',
    name: 'Research & Benchmarks',
    description: 'Reproducible experiments and datasets',
    icon: FlaskConical,
    color: '#A855F7',
    creators: 23,
  },
]

export default function Verticals() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [dbStats, setDbStats] = useState<any>(null)

  useEffect(() => {
    api.getGlobalStats().then(setDbStats).catch(console.error)
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(titleRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: true,
          }
        }
      )

      const cards = gridRef.current?.querySelectorAll('.vertical-card')
      if (cards) {
        gsap.fromTo(cards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 85%',
              end: 'top 50%',
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
      id="verticals"
      className="section bg-background"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="label-mono mb-2 block">Explore</span>
          <h2
            ref={titleRef}
            className="heading-md text-foreground mb-4"
          >
            Browse by <span className="text-jence-gold">section</span>
          </h2>
          <p className="body-md max-w-lg mx-auto">
            Engineering-first coverage across the full robotics and hardware stack.
          </p>
        </div>

        {/* Verticals Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {verticals.map((vertical) => {
            const Icon = vertical.icon
            return (
              <Link
                key={vertical.id}
                to={`/verticals/${vertical.slug}`}
                className="vertical-card group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${vertical.color}15`, color: vertical.color }}
                >
                  <Icon size={24} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {vertical.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {vertical.description}
                </p>
                <span className="text-xs font-mono text-muted-foreground">
                  {7 + (dbStats?.creatorsByVertical?.[vertical.slug] || 0)} creators
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
