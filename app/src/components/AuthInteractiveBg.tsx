import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'

export default function AuthInteractiveBg() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to('.trace-line', {
                strokeDashoffset: 0,
                duration: 3,
                ease: 'none',
                stagger: 0.5,
                repeat: -1,
            })
            gsap.to('.floating-2d', {
                y: '-10px',
                duration: 4,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut',
                stagger: 0.2
            })
            gsap.to('.pulse-node', {
                scale: 1.5,
                opacity: 0.5,
                duration: 1.5,
                yoyo: true,
                repeat: -1,
                ease: 'power1.inOut',
                stagger: 0.3,
                transformOrigin: 'center center'
            })
        }, containerRef)
        return () => ctx.revert()
    }, [])

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-[#050505] flex flex-col justify-between p-8 md:p-12">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px]" />
            
            {/* Top Logo Section */}
            <div className="relative z-20 flex justify-start">
                <Link to="/" className="flex items-center gap-3 group">
                    <img src="/logo.png" alt="Jence Logo" className="w-10 h-10 object-contain rounded-lg group-hover:scale-105 transition-transform" />
                    <span className="font-bold text-2xl tracking-tight text-white">Jence</span>
                </Link>
            </div>
            
            {/* 2D Schematic / PCB Traces Art */}
            <div className="relative z-10 flex-1 flex items-center justify-center opacity-80 md:opacity-100 mix-blend-screen overflow-hidden">
                <svg className="w-[150%] max-w-2xl h-auto text-jence-gold/40 transform -rotate-12 group-hover:rotate-0 transition-transform duration-1000" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Background Grid Lines within SVG */}
                    <path d="M0 100 H 600 M0 200 H 600 M0 300 H 600" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
                    <path d="M150 0 V 400 M300 0 V 400 M450 0 V 400" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />

                    {/* Animated PCB Traces */}
                    <path className="trace-line" d="M -50 200 H 150 L 250 100 H 650" stroke="currentColor" strokeWidth="2" strokeDasharray="1000" strokeDashoffset="1000" />
                    <path className="trace-line" d="M -50 250 H 200 L 250 300 H 450 L 500 250 H 650" stroke="currentColor" strokeWidth="2" strokeDasharray="1000" strokeDashoffset="1000" />
                    <path className="trace-line" d="M 100 450 V 350 L 150 300 V -50" stroke="currentColor" strokeWidth="2" strokeDasharray="1000" strokeDashoffset="1000" />
                    <path className="trace-line" d="M 350 450 V 250 L 400 200 V -50" stroke="currentColor" strokeWidth="2" strokeDasharray="1000" strokeDashoffset="1000" />
                    
                    {/* Connecting Nodes */}
                    <circle className="pulse-node" cx="150" cy="200" r="4" fill="currentColor" />
                    <circle className="pulse-node" cx="250" cy="100" r="4" fill="currentColor" />
                    <circle className="pulse-node" cx="200" cy="250" r="4" fill="currentColor" />
                    <circle className="pulse-node" cx="250" cy="300" r="4" fill="currentColor" />
                    <circle className="pulse-node" cx="450" cy="300" r="4" fill="currentColor" />
                    <circle className="pulse-node" cx="500" cy="250" r="4" fill="currentColor" />
                    
                    {/* CPU / Microcontroller Component */}
                    <rect className="floating-2d" x="220" y="170" width="80" height="80" rx="4" stroke="currentColor" strokeWidth="2" fill="#050505" />
                    {/* Inner detail */}
                    <rect className="floating-2d" x="240" y="190" width="40" height="40" rx="2" stroke="currentColor" strokeWidth="1" />
                    
                    {/* Chip pins Top/Bottom */}
                    {Array.from({ length: 6 }).map((_, i) => (
                        <g key={`pin-tb-${i}`} className="floating-2d">
                            <path d={`M ${235 + i * 10} 160 V 170`} stroke="currentColor" strokeWidth="2" />
                            <path d={`M ${235 + i * 10} 250 V 260`} stroke="currentColor" strokeWidth="2" />
                        </g>
                    ))}
                    {/* Chip pins Left/Right */}
                    {Array.from({ length: 6 }).map((_, i) => (
                        <g key={`pin-lr-${i}`} className="floating-2d">
                            <path d={`M 210 ${185 + i * 10} H 220`} stroke="currentColor" strokeWidth="2" />
                            <path d={`M 300 ${185 + i * 10} H 310`} stroke="currentColor" strokeWidth="2" />
                        </g>
                    ))}
                    
                    {/* Other components */}
                    <rect className="floating-2d" x="400" y="80" width="30" height="60" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <rect className="floating-2d" x="100" y="280" width="40" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            </div>
            
            {/* Text Overlay for Desktop */}
            <div className="relative z-20 hidden lg:block">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                    Join the vanguard of <br />
                    <span className="text-jence-gold">hardware engineering</span>.
                </h2>
                <p className="text-white/60 text-sm lg:text-base max-w-md">
                    Connect with top creators, read deep-dive technical articles, and stay ahead in the world of robotics, embedded systems, and manufacturing.
                </p>
            </div>

            {/* Mobile Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent md:hidden z-0 pointer-events-none" />
        </div>
    )
}
