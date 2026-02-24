import crypto from 'crypto'
import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

// AES-256-GCM settings
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

// Require a strong master key via environment variable
function getEncryptionKey(): Buffer {
    let keyStr = process.env.WALLET_ENCRYPTION_KEY
    if (!keyStr) {
        if (process.env.NODE_ENV !== 'production') {
            // Provide a dummy key in dev if not set (must be 32 bytes)
            keyStr = 'dev-encryption-key-0123456789abc'
        } else {
            throw new Error('WALLET_ENCRYPTION_KEY is required in production')
        }
    }
    // Must be exactly 32 bytes for AES-256
    const key = Buffer.from(keyStr, 'utf-8')
    if (key.length !== 32) {
        throw new Error('WALLET_ENCRYPTION_KEY must be exactly 32 bytes')
    }
    return key
}

export interface EncryptedWallet {
    publicKey: string
    encryptedPrivateKey: string
    iv: string
    authTag: string
}

export function generateAndEncryptWallet(): EncryptedWallet {
    const keypair = Keypair.generate()
    const secretKeyStr = bs58.encode(keypair.secretKey)

    const masterKey = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)

    const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv)
    let encrypted = cipher.update(secretKeyStr, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()

    return {
        publicKey: keypair.publicKey.toBase58(),
        encryptedPrivateKey: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
    }
}

export function decryptWallet(
    encryptedPrivateKeyHex: string,
    ivHex: string,
    authTagHex: string
): Keypair {
    const masterKey = getEncryptionKey()
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encryptedPrivateKeyHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    const secretKeyBytes = bs58.decode(decrypted)
    return Keypair.fromSecretKey(secretKeyBytes)
}
