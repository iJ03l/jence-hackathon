import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { Search, Bot, Cpu, Smile, Wrench, ChevronDown, Rocket, FileText, User, MessageSquare } from 'lucide-react'
import { api } from '../lib/api'
import useDebounce from '../hooks/useDebounce'

const SEARCH_TYPES = [
  { id: 'all', label: 'All', icon: Search },
  { id: 'authors', label: 'Authors', icon: User },
  { id: 'launches', label: 'Launches', icon: Rocket },
  { id: 'posts', label: 'Articles', icon: FileText },
  { id: 'community', label: 'Community', icon: MessageSquare },
]

export default function ContentHero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const floatersRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('all')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const debouncedQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsLoading(true)
      api.search(debouncedQuery, searchType)
        .then(data => setResults(data))
        .catch(console.error)
        .finally(() => setIsLoading(false))
    } else {
      setResults(null)
    }
  }, [debouncedQuery, searchType])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

      tl.fromTo(headlineRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 }
      )
      tl.fromTo(subRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.35'
      )
      tl.fromTo(searchContainerRef.current,
        { y: 16, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.2)' },
        '-=0.25'
      )

      // Floating elements animation
      if (floatersRef.current) {
        const floaters = floatersRef.current.children
        gsap.fromTo(floaters,
          { opacity: 0, scale: 0, rotation: -20 },
          { opacity: 1, scale: 1, rotation: 0, stagger: 0.1, duration: 0.8, ease: 'back.out(1.5)', delay: 0.4 }
        )

        // Continuous floating
        Array.from(floaters).forEach((el, i) => {
          gsap.to(el, {
            y: `random(-15, 15)`,
            x: `random(-10, 10)`,
            rotation: `random(-15, 15)`,
            duration: `random(3, 5)`,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2
          })
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Click outside listener for the custom dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedTypeObj = SEARCH_TYPES.find(t => t.id === searchType) || SEARCH_TYPES[0]
  const SelectedIcon = selectedTypeObj.icon

  const handleResultClick = () => {
    setSearchQuery('')
    setIsFocused(false)
  }

  const showModal = isFocused && searchQuery.length >= 2;

  return (
    <section
      ref={sectionRef}
      className="relative pt-24 sm:pt-32 pb-14 sm:pb-24 px-4 sm:px-6 lg:px-8 xl:px-12 overflow-visible"
    >
      {/* Subtle gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-jence-gold/3 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-20 max-w-4xl mx-auto text-center mt-8">
        {/* Headline */}
        <h1
          ref={headlineRef}
          className="heading-xl text-foreground mb-6"
        >
          Every layer,{' '}
          <span className="text-gradient-gold">covered.</span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subRef}
          className="body-lg max-w-xl mx-auto mb-10 text-muted-foreground"
        >
          Deep technical articles, hardware teardowns, and developer community
          from credited engineers — firmware to manufacturing.
        </p>

        {/* Search Container with Floating Elements */}
        <div className="relative inline-block w-full max-w-2xl mx-auto z-30" ref={searchContainerRef}>
          
          {/* Floating Aesthetic Elements */}
          <div ref={floatersRef} className="absolute inset-0 pointer-events-none perspective-1000">
            <div className="absolute -top-10 -left-12 text-jence-gold/60 opacity-0 transform-style-3d"><Bot size={40} strokeWidth={1.5} /></div>
            <div className="absolute -bottom-8 -right-8 text-blue-400/50 opacity-0 transform-style-3d"><Cpu size={36} strokeWidth={1.5} /></div>
            <div className="absolute top-4 -right-14 text-pink-400/50 opacity-0 transform-style-3d"><Smile size={32} strokeWidth={1.5} /></div>
            <div className="absolute -bottom-6 -left-8 text-emerald-400/50 opacity-0 transform-style-3d"><Wrench size={28} strokeWidth={1.5} /></div>
          </div>

          {/* Search Bar Wrapper */}
          <div className={`relative flex items-stretch bg-card/80 backdrop-blur-xl border ${isFocused ? 'border-jence-gold/60 shadow-[0_0_20px_rgba(212,175,55,0.15)]' : 'border-border'} rounded-[2rem] transition-all duration-300 z-40 overflow-visible`}>
            
            {/* Category Dropdown (Custom UI) */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                className="h-full px-5 py-4 flex items-center gap-2 text-sm font-medium text-foreground hover:bg-muted/50 rounded-l-[2rem] border-r border-border transition-colors outline-none focus:bg-muted/50"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <SelectedIcon size={16} className="text-muted-foreground" />
                <span className="hidden sm:inline-block">{selectedTypeObj.label}</span>
                <ChevronDown size={14} className="text-muted-foreground ml-1" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-16 left-0 w-48 bg-card border border-border shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {SEARCH_TYPES.map(type => {
                    const TypeIcon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-colors ${searchType === type.id ? 'bg-muted text-jence-gold font-medium' : 'text-foreground hover:bg-muted/50'}`}
                        onClick={() => {
                          setSearchType(type.id)
                          setIsDropdownOpen(false)
                        }}
                      >
                        <TypeIcon size={16} className={searchType === type.id ? 'text-jence-gold' : 'text-muted-foreground'} />
                        {type.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Input Field */}
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                placeholder="Search across the hardware stack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground/60 text-base sm:text-lg focus:outline-none focus:ring-0 px-4 h-full"
              />
              {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-jence-gold/30 border-t-jence-gold rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Results Modal */}
          {showModal && (
            <div 
              ref={modalRef}
              className="absolute top-full left-0 right-0 mt-4 bg-card border border-border/80 shadow-2xl rounded-3xl overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-4 duration-300 max-h-[60vh] overflow-y-auto"
            >
              {results ? (
                <div className="p-2 sm:p-4">
                  {(!results.authors?.length && !results.launches?.length && !results.posts?.length && !results.community?.length) ? (
                    <div className="text-center py-12 px-4">
                      <Search className="mx-auto text-muted-foreground/30 mb-3" size={32} />
                      <p className="text-muted-foreground text-sm">No results found for "{searchQuery}"</p>
                    </div>
                  ) : (
                    <>
                      {/* Authors Results */}
                      {results.authors?.length > 0 && (
                        <div className="mb-6 last:mb-0">
                          <h4 className="px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                            <User size={12} /> Authors
                          </h4>
                          <div className="space-y-1">
                            {results.authors.map((author: any) => (
                              <Link
                                key={author.id}
                                to={`/${author.username || author.pseudonym}`}
                                onClick={handleResultClick}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted/60 transition-colors group"
                              >
                                <div className="w-8 h-8 rounded-full bg-muted/80 overflow-hidden shrink-0">
                                  {author.image ? <img src={author.image} alt={author.pseudonym} className="w-full h-full object-cover" /> : null}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-foreground group-hover:text-jence-gold truncate flex items-center gap-1.5">
                                    {author.pseudonym}
                                    {author.verticalName && <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 border border-border rounded bg-muted/40 uppercase relative -top-[1px]">{author.verticalName}</span>}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Posts Results */}
                      {results.posts?.length > 0 && (
                        <div className="mb-6 last:mb-0">
                          <h4 className="px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                            <FileText size={12} /> Articles
                          </h4>
                          <div className="space-y-1">
                            {results.posts.map((post: any) => (
                              <Link
                                key={post.id}
                                to={`/verticals/${post.verticalSlug}/${post.id}`}
                                onClick={handleResultClick}
                                className="block px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
                              >
                                <div className="text-sm font-medium text-foreground group-hover:text-jence-gold line-clamp-1 mb-1">
                                  {post.title}
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                  by {post.creatorPseudonym} in <span className="text-foreground/80">{post.verticalName}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Launches Results */}
                      {results.launches?.length > 0 && (
                        <div className="mb-6 last:mb-0">
                          <h4 className="px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                            <Rocket size={12} /> Launches
                          </h4>
                          <div className="space-y-1">
                            {results.launches.map((launch: any) => (
                              <Link
                                key={launch.id}
                                to={`/launches/${launch.id}`}
                                onClick={handleResultClick}
                                className="block px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
                              >
                                <div className="text-sm font-medium text-foreground group-hover:text-jence-gold truncate mb-0.5">
                                  {launch.name} <span className="text-xs font-normal text-muted-foreground">by {launch.company}</span>
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                  {launch.summary}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Community Results */}
                      {results.community?.length > 0 && (
                        <div className="mb-6 last:mb-0">
                          <h4 className="px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                            <MessageSquare size={12} /> Community
                          </h4>
                          <div className="space-y-1">
                            {results.community.map((comm: any) => (
                              <Link
                                key={comm.id}
                                to={`/community/${comm.id}`}
                                onClick={handleResultClick}
                                className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
                              >
                                <div className="w-6 h-6 rounded-full bg-muted/80 overflow-hidden shrink-0 mt-0.5">
                                  {comm.userImage ? <img src={comm.userImage} alt={comm.username} className="w-full h-full object-cover" /> : null}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs text-foreground/70 mb-0.5">@{comm.username}</div>
                                  <div className="text-sm text-foreground group-hover:text-jence-gold line-clamp-2 leading-snug">
                                    {comm.content}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="py-12 flex justify-center">
                  <div className="w-6 h-6 border-2 border-jence-gold/30 border-t-jence-gold rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
