import {
    Connection,
    PublicKey,
    Transaction,
} from '@solana/web3.js'
import {
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
} from '@solana/spl-token'

// USDC mint on Solana Mainnet
export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
export const USDC_DECIMALS = 6

const RPC_URL = 'https://api.mainnet-beta.solana.com'

export function getConnection() {
    return new Connection(RPC_URL, 'confirmed')
}

/**
 * Build a USDC transfer transaction that splits payment between creator and platform.
 * If price is 0, returns null (free subscription, no tx needed).
 */
export async function buildSubscriptionTransaction({
    payerPublicKey,
    creatorWalletAddress,
    priceUsdc,
    creatorSharePercent,
}: {
    payerPublicKey: PublicKey
    creatorWalletAddress: string
    priceUsdc: number
    creatorSharePercent: number
}): Promise<Transaction | null> {
    if (priceUsdc <= 0) return null

    const platformWallet = import.meta.env.VITE_PLATFORM_WALLET

    const totalAmount = Math.round(priceUsdc * 10 ** USDC_DECIMALS) // Convert to minor units
    const creatorAmount = Math.round(totalAmount * (creatorSharePercent / 100))
    const platformAmount = totalAmount - creatorAmount // Remainder to avoid rounding issues

    const connection = getConnection()
    const creatorPubkey = new PublicKey(creatorWalletAddress)

    const transaction = new Transaction()

    // Payer's USDC token account (source)
    const payerAta = getAssociatedTokenAddressSync(USDC_MINT, payerPublicKey)

    // Creator's USDC token account (destination)
    const creatorAta = getAssociatedTokenAddressSync(USDC_MINT, creatorPubkey)

    // Check if creator ATA exists, create if not
    const creatorAtaInfo = await connection.getAccountInfo(creatorAta)
    if (!creatorAtaInfo) {
        transaction.add(
            createAssociatedTokenAccountInstruction(
                payerPublicKey,
                creatorAta,
                creatorPubkey,
                USDC_MINT,
            )
        )
    }

    // Transfer to creator
    if (creatorAmount > 0) {
        transaction.add(
            createTransferInstruction(
                payerAta,
                creatorAta,
                payerPublicKey,
                creatorAmount,
            )
        )
    }

    // Transfer to platform (if there's a platform share)
    if (platformAmount > 0 && platformWallet) {
        const platformPubkey = new PublicKey(platformWallet)
        const platformAta = getAssociatedTokenAddressSync(USDC_MINT, platformPubkey)

        const platformAtaInfo = await connection.getAccountInfo(platformAta)
        if (!platformAtaInfo) {
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    payerPublicKey,
                    platformAta,
                    platformPubkey,
                    USDC_MINT,
                )
            )
        }

        transaction.add(
            createTransferInstruction(
                payerAta,
                platformAta,
                payerPublicKey,
                platformAmount,
            )
        )
    }

    // Set recent blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = payerPublicKey

    return transaction
}
