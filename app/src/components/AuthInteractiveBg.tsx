import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function AuthInteractiveBg() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to('.auth-shape', {
                y: 'random(-30, 30)',
                x: 'random(-30, 30)',
                rotation: 'random(-25, 25)',
                duration: 'random(4, 7)',
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: 0.2
            })
        }, containerRef)
        return () => ctx.revert()
    }, [])

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-background flex items-center justify-center">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            {/* Glowing Orb */}
            <div className="absolute left-0 right-0 top-0 bottom-0 m-auto h-[40vh] w-[40vh] rounded-full bg-jence-gold opacity-10 blur-[120px]" />
            
            {/* Interactive/floating shapes representing hardware components */}
            <div className="relative w-full max-w-lg aspect-square">
                {/* Chip/Die representation */}
                <div className="auth-shape absolute top-1/4 left-1/4 w-32 h-32 border border-jence-gold/30 rounded-xl backdrop-blur-sm bg-jence-gold/5 flex items-center justify-center">
                    <div className="w-16 h-16 border border-jence-gold/40 rounded-sm" />
                </div>
                
                {/* Board/PCB trace representation */}
                <div className="auth-shape absolute top-1/2 right-1/4 w-48 h-48 border border-muted-foreground/30 rounded-full backdrop-blur-sm bg-muted/10 transform rotate-12 flex items-center justify-center">
                     <div className="w-full h-px bg-muted-foreground/30 absolute rotate-45" />
                     <div className="w-px h-full bg-muted-foreground/30 absolute rotate-45" />
                </div>
                
                {/* Sensor/Lens representation */}
                <div className="auth-shape absolute bottom-1/4 left-1/3 w-24 h-24 border border-jence-gold/40 rounded-full backdrop-blur-sm bg-jence-gold/10 transform -rotate-12 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border border-jence-gold/50" />
                </div>
                
                {/* overlaid text for desktop */}
                <div className="absolute inset-0 hidden md:flex flex-col items-center justify-center text-center z-10 p-8 select-none">
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                        Join the vanguard of <span className="text-jence-gold">hardware engineering</span>.
                    </h2>
                    <p className="text-muted-foreground text-sm lg:text-base max-w-md">
                        Connect with top creators, read deep-dive technical articles, and stay ahead in the world of robotics, embedded systems, and manufacturing.
                    </p>
                </div>
            </div>
            
            {/* Gradients to fade out the background on mobile so the form is readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent md:hidden" />
            <div className="absolute inset-0 bg-background/60 md:hidden backdrop-blur-md" />
        </div>
    )
}
