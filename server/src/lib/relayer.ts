import { Keypair, Connection, VersionedTransaction } from '@solana/web3.js'
import bs58 from 'bs58'

export function getRelayerKeypair(): Keypair {
    let keyStr = process.env.RELAYER_PRIVATE_KEY
    if (!keyStr) {
        if (process.env.NODE_ENV !== 'production') {
            // Provide a dummy deterministic relayer in dev if not set
            // WARNING: DO NOT USE IN PRODUCTION
            keyStr = '2zZk9vQh33jM9Rk9vQh33jM9Rk9vQh33jM9Rk9vQh33jM9Rk9vQh33jM9Rk9vQh33jM9Rk9vQh33jM9'
        } else {
            throw new Error('RELAYER_PRIVATE_KEY is required in production')
        }
    }

    try {
        const secretKeyBytes = bs58.decode(keyStr)
        return Keypair.fromSecretKey(secretKeyBytes)
    } catch {
        // If it's not base58, it might be a JSON array (sometimes used in Solana CLI)
        try {
            const secretKeyBytes = Uint8Array.from(JSON.parse(keyStr))
            return Keypair.fromSecretKey(secretKeyBytes)
        } catch (e) {
            throw new Error('RELAYER_PRIVATE_KEY is invalid format. Expected base58 or JSON array.')
        }
    }
}

export function getRpcConnection(): Connection {
    const endpoint = process.env.VITE_RPC_URL || process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    return new Connection(endpoint, 'confirmed')
}

/**
 * Helper to take an assembled VersionedTransaction, sign it with the relayer,
 * and ensure the relayer is the fee payer. 
 * Note: The transaction must have been constructed with the relayer as the feePayer.
 */
export function signWithRelayer(transaction: VersionedTransaction): VersionedTransaction {
    const relayer = getRelayerKeypair()
    transaction.sign([relayer])
    return transaction
}
