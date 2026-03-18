import { Connection, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { getRpcConnection } from './relayer.js'

export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
export const USDC_DECIMALS = 6

export function getUsdcAta(owner: PublicKey | string) {
    const ownerPubkey = typeof owner === 'string' ? new PublicKey(owner) : owner
    return getAssociatedTokenAddressSync(USDC_MINT, ownerPubkey)
}

export function toUsdcMinorUnits(amount: number) {
    return Math.round(amount * 10 ** USDC_DECIMALS)
}

export async function getUsdcBalance(owner: PublicKey | string, connection: Connection = getRpcConnection()) {
    const ata = getUsdcAta(owner)

    try {
        const balance = await connection.getTokenAccountBalance(ata)
        const uiAmount = balance.value.uiAmount

        if (typeof uiAmount === 'number') {
            return uiAmount
        }

        const rawAmount = Number(balance.value.amount || '0')
        return rawAmount / 10 ** USDC_DECIMALS
    } catch (error) {
        return 0
    }
}
