import { useRef, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MessageSquare, ThumbsUp, Share2, ArrowRight, Flame, Pin } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const threads = [
  {
    id: 1,
    title: "What's everyone's take on the new CBN circular?",
    author: '@naija_crypto',
    category: 'Crypto',
    categoryColor: 'crypto',
    time: '3 hours ago',
    comments: 45,
    likes: 89,
    shares: 12,
    hot: true,
  },
  {
    id: 2,
    title: 'Weekend betting thread - Share your slips',
    author: '@betting_edge',
    category: 'Betting',
    categoryColor: 'betting',
    time: '1 hour ago',
    comments: 234,
    likes: 156,
    shares: 45,
    hot: true,
  },
  {
    id: 3,
    title: 'Just got my first Upwork payment. Here\'s what I did',
    author: '@remote_hunter',
    category: 'Remote Work',
    categoryColor: 'remote',
    time: '5 hours ago',
    comments: 78,
    likes: 234,
    shares: 67,
    hot: false,
  },
  {
    id: 4,
    title: '[INCOME PROOF] Made $500 this month from importation',
    author: '@anon_hustler',
    category: 'Hustle',
    categoryColor: 'hustle',
    time: '8 hours ago',
    comments: 156,
    likes: 445,
    shares: 89,
    hot: true,
  },
]

export default function ForumPreview() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
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

      const items = listRef.current?.querySelectorAll('.thread-card')
      if (items) {
        gsap.fromTo(items,
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            stagger: 0.1,
            scrollTrigger: {
              trigger: listRef.current,
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
      id="forum"
      className="section bg-background"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <MessageSquare size={24} className="text-jence-gold" />
            <div>
              <span className="label-mono mb-1 block">Community</span>
              <h2 className="heading-sm text-foreground">
                Forum <span className="text-jence-gold">discussions</span>
              </h2>
            </div>
          </div>
          <Link
            to="/community"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-jence-gold transition-colors"
          >
            Join the conversation
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Pinned Notice */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-jence-gold/5 border border-jence-gold/20 mb-4">
          <Pin size={16} className="text-jence-gold" />
          <span className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Community Rules:</span> Read before posting. No doxxing. No scams. Proof or it didn't happen.
          </span>
        </div>

        {/* Thread List */}
        <div ref={listRef} className="space-y-3">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className="thread-card cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {/* Category Icon */}
                <div className={`hidden sm:flex w-10 h-10 rounded-lg category-${thread.categoryColor} items-center justify-center shrink-0`}>
                  <span className="text-xs font-bold">{thread.category.charAt(0)}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {thread.hot && (
                      <Flame size={14} className="text-jence-red" />
                    )}
                    <h3 className="font-medium text-foreground truncate group-hover:text-jence-gold transition-colors">
                      {thread.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                    <span className="font-mono">{thread.author}</span>
                    <span>•</span>
                    <span className={`badge category-${thread.categoryColor}`}>
                      {thread.category}
                    </span>
                    <span>•</span>
                    <span>{thread.time}</span>
                  </div>

                  {/* Engagement */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      {thread.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={12} />
                      {thread.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 size={12} />
                      {thread.shares}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="mt-6 text-center">
          <Link to="/community" className="btn-outline inline-flex items-center gap-2">
            View all discussions
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
