import { CheckCircle2 } from 'lucide-react'

interface OGBadgeProps {
    className?: string
}

export function OGBadge({ className = '' }: OGBadgeProps) {
    return (
        <span
            title="Original Member"
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-jence-green/20 to-jence-green/5 text-jence-green text-[10px] font-bold uppercase tracking-widest border border-jence-green/30 shadow-[0_0_10px_rgba(34,197,94,0.1)] select-none ${className}`}
        >
            <CheckCircle2 size={12} className="fill-jence-green/20 stroke-jence-green" />
            OG
        </span>
    )
}
