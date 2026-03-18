import { useEffect, useMemo, useState } from 'react'
import { DollarSign, Loader2, X } from 'lucide-react'

interface TipModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (amountUsdc: number) => Promise<void>
    isSubmitting: boolean
    title: string
    description: string
    confirmLabel?: string
    balance?: number
    error?: string
}

export function TipModal({
    isOpen,
    onClose,
    onConfirm,
    isSubmitting,
    title,
    description,
    confirmLabel = 'Send tip',
    balance,
    error,
}: TipModalProps) {
    const [amount, setAmount] = useState('')
    const [localError, setLocalError] = useState('')

    useEffect(() => {
        if (!isOpen) {
            setAmount('')
            setLocalError('')
        }
    }, [isOpen])

    const parsedAmount = useMemo(() => Number(amount), [amount])
    const balanceExceeded = balance !== undefined && balance !== null && parsedAmount > balance

    if (!isOpen) return null

    const handleSubmit = async () => {
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setLocalError('Enter a valid tip amount.')
            return
        }

        if (balanceExceeded) {
            setLocalError('You do not have enough USDC in your wallet.')
            return
        }

        setLocalError('')
        await onConfirm(parsedAmount)
    }

    const validationMessage = error || localError

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-2xl border border-border overflow-hidden shadow-2xl">
                <div className="p-6 pb-0 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-3 bg-jence-gold/10 rounded-full text-jence-gold">
                            <DollarSign size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">{title}</h2>
                            <p className="text-sm text-muted-foreground mt-1">{description}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Tip amount (USDC)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value)
                                    if (localError) setLocalError('')
                                }}
                                className="input-field !pl-7 font-mono text-sm"
                                placeholder="0.00"
                            />
                        </div>
                        {balance !== undefined && balance !== null && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Available balance: {balance.toFixed(2)} USDC
                            </p>
                        )}
                    </div>

                    {validationMessage && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {validationMessage}
                        </div>
                    )}
                </div>

                <div className="p-6 pt-0 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-lg font-medium text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60"
                    >
                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
