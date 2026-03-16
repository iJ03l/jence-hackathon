import { useRef, useLayoutEffect, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MessageSquare, ThumbsUp, ArrowRight, Pin, Flame, Loader2 } from 'lucide-react'
import { api } from '../lib/api'

gsap.registerPlugin(ScrollTrigger)

export default function ForumPreview() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getCommunityPosts()
      .then(data => {
          // just grab top 4 recent posts
          setPosts(data.slice(0, 4))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

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

      // We need to wait for rendering to setup the animation for the cards
      setTimeout(() => {
        const items = listRef.current?.querySelectorAll('.thread-card')
        if (items && items.length > 0) {
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
      }, 300)
    }, sectionRef)

    return () => ctx.revert()
  }, [posts.length]) // re-run once posts are loaded

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
            <span className="text-foreground font-medium">Community Rules:</span> Be precise, cite methods, and avoid unsafe instructions.
          </span>
        </div>

        {/* Thread List */}
        <div ref={listRef} className="space-y-3 min-h-[300px]">
          {loading ? (
            <div className="flex justify-center py-12">
               <Loader2 className="animate-spin text-jence-gold" size={32} />
            </div>
          ) : posts.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
               No discussions yet.
             </div>
          ) : posts.map((post) => (
            <Link
              key={post.id}
              to={`/community/post/${post.id}`}
              className="thread-card block card-plug p-4 hover:border-jence-gold/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {post.likes > 5 && (
                      <Flame size={14} className="text-jence-red flex-shrink-0" />
                    )}
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-jence-gold transition-colors">
                      {post.content}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground mb-3">
                    <span className="font-medium text-foreground/80 flex items-center gap-1.5">
                       {post.author?.image && (
                           <img src={post.author.image} alt="Avatar" className="w-4 h-4 rounded-full object-cover" />
                       )}
                       {post.author?.displayName || 'Unknown'}
                    </span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                          {post.tags.map((t: any, idx: number) => (
                              <span key={idx} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-muted text-muted-foreground">
                                  #{t.name}
                              </span>
                          ))}
                      </div>
                  )}

                  {/* Engagement */}
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare size={14} className="group-hover:text-foreground transition-colors" />
                      {post.comments || 0}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ThumbsUp size={14} className="group-hover:text-jence-gold transition-colors" />
                      {post.likes || 0}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All */}
        <div className="mt-8 text-center">
          <Link to="/community" className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-jence-gold/10">
            View all discussions
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
