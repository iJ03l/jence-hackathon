import { useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface CategoryGridProps {
  className?: string
}

const categories = [
  { id: 1, name: 'Banking & Finance', count: 24 },
  { id: 2, name: 'Government & Policy', count: 18 },
  { id: 3, name: 'Sports & Recreation', count: 31 },
  { id: 4, name: 'Digital Assets', count: 42 },
  { id: 5, name: 'Real Estate', count: 15 },
  { id: 6, name: 'Professional Careers', count: 27 },
  { id: 7, name: 'Open Markets', count: 19 },
  { id: 8, name: 'Creator Economy', count: 33 },
  { id: 9, name: 'Agriculture', count: 12 },
  { id: 10, name: 'Oil, Gas & Energy', count: 21 },
]

export default function CategoryGrid({ className = '' }: CategoryGridProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(titleRef.current,
        { y: '4vh', opacity: 0 },
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

      // Grid items animation
      const items = gridRef.current?.querySelectorAll('.category-card')
      if (items) {
        gsap.fromTo(items,
          { y: '12vh', opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            scrollTrigger: {
              trigger: gridRef.current,
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
      id="categories"
      className={`section-flowing py-20 lg:py-28 bg-jence-black ${className}`}
    >
      <div className="w-full px-6 lg:px-12">
        {/* Title */}
        <h2
          ref={titleRef}
          className="heading-2 font-semibold text-jence-white text-center mb-12"
        >
          Browse by sector
        </h2>

        {/* Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {categories.map((category) => (
            <div
              key={category.id}
              className="category-card group relative h-[160px] lg:h-[180px] rounded-[18px] bg-jence-dark border border-white/5 p-5 cursor-pointer flex flex-col justify-between"
            >
              {/* Top Left: Category Name */}
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-jence-gray/60 mb-1 block">
                  {category.count} creators
                </span>
                <h3 className="text-sm lg:text-base font-medium text-jence-white leading-tight">
                  {category.name}
                </h3>
              </div>

              {/* Bottom Right: Arrow */}
              <div className="flex justify-end">
                <ArrowUpRight
                  size={20}
                  className="arrow-icon text-jence-gray group-hover:text-jence-green transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
