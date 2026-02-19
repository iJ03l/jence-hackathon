import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Landmark, Shield, Trophy, Bitcoin, Building2,
    Briefcase, Store, Palette, Wheat, Fuel,
    ArrowRight, FileText
} from 'lucide-react'
import { api } from '../lib/api'

const iconMap: Record<string, any> = {
    Landmark, Shield, Trophy, Bitcoin, Building2,
    Briefcase, Store, Palette, Wheat, Fuel,
}

export default function ExplorePage() {
    const [verticals, setVerticals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.getVerticals()
            .then(setVerticals)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    return (
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="label-mono mb-2 block">Explore</span>
                    <h1 className="heading-lg text-foreground mb-4">
                        Browse by <span className="text-gradient-gold">vertical</span>
                    </h1>
                    <p className="body-lg max-w-2xl mx-auto">
                        Independent analysts across every major sector of Nigerian economic and professional life.
                        Find the expert commentary that matters to you.
                    </p>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="card-plug p-6 animate-pulse">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-muted" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                                        <div className="h-3 bg-muted rounded w-2/3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {verticals.map((vertical) => {
                            const Icon = iconMap[vertical.iconName] || FileText
                            return (
                                <Link
                                    key={vertical.id}
                                    to={`/verticals/${vertical.slug}`}
                                    className="card-plug p-5 sm:p-6 group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                                            style={{ backgroundColor: `${vertical.color}15`, color: vertical.color }}
                                        >
                                            <Icon size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground group-hover:text-jence-gold transition-colors mb-1">
                                                {vertical.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                {vertical.description}
                                            </p>
                                        </div>
                                        <ArrowRight size={18} className="text-muted-foreground group-hover:text-jence-gold transition-colors shrink-0 mt-1" />
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}
