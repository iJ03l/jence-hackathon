import { AlertTriangle, Loader2, X } from 'lucide-react'

interface DeleteModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isDeleting: boolean
    title?: string
    description?: string
}

export function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    title = 'Delete Post',
    description = 'Are you sure you want to delete this post? This action cannot be undone.'
}: DeleteModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-2xl border border-border overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 pb-0 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">{title}</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {description}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Footer Actions */}
                <div className="p-6 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 rounded-lg font-medium text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="btn-primary bg-red-500 hover:bg-red-600 border-none shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60"
                    >
                        {isDeleting && <Loader2 size={16} className="animate-spin" />}
                        Delete Post
                    </button>
                </div>
            </div>
        </div>
    )
}
