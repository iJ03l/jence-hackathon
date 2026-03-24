import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export function JsonViewer({ url }: { url: string }) {
    const [data, setData] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        fetch(url)
            .then(res => res.text())
            .then(text => {
                try {
                    // Try to format it if it's minified
                    const parsed = JSON.parse(text)
                    setData(JSON.stringify(parsed, null, 2))
                } catch {
                    // Fallback to raw text
                    setData(text)
                }
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [url])

    if (loading) {
        return (
            <div className="w-full h-48 flex items-center justify-center bg-muted/20 border border-border/60 rounded-[20px]">
                <Loader2 className="animate-spin text-jence-gold" />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="w-full p-6 text-center bg-muted/20 border border-border/60 rounded-[20px]">
                <p className="text-red-400 text-sm">Failed to load JSON data.</p>
                <a href={url} target="_blank" rel="noreferrer" className="text-jence-gold hover:underline text-xs mt-2 inline-block">
                    View RAW JSON
                </a>
            </div>
        )
    }

    return (
        <div className="relative w-full rounded-[20px] overflow-hidden border border-border/60 bg-[#1e1e1e] shadow-sm">
            <div className="absolute top-0 left-0 w-full px-4 py-2.5 bg-black/40 border-b border-white/10 flex justify-between items-center z-10">
                <span className="text-xs font-mono text-gray-400">JSON Schematic Data</span>
                <a href={url} target="_blank" rel="noreferrer" className="text-xs text-jence-gold hover:text-jence-gold/80 hover:underline">
                    Download RAW
                </a>
            </div>
            <div className="p-4 pt-14 max-h-[500px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                <pre className="text-[13px] leading-relaxed font-mono text-[#4ec9b0] whitespace-pre-wrap break-words">
                    {data}
                </pre>
            </div>
        </div>
    )
}
