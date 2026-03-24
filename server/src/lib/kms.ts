import crypto from 'crypto'

// AES-256-GCM settings
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

// Flow uses ECDSA_P256 by default for account keys
const FLOW_KEY_CURVE = 'prime256v1' // NIST P-256

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

export interface FlowKeyPair {
    publicKey: string   // Hex-encoded public key (uncompressed, without 04 prefix)
    privateKey: string  // Hex-encoded private key
}

export interface EncryptedWallet {
    publicKey: string           // Hex-encoded Flow public key
    encryptedPrivateKey: string // AES-256-GCM encrypted private key (hex)
    iv: string                  // Initialization vector (hex)
    authTag: string             // GCM auth tag (hex)
}

/**
 * Generate a P-256 keypair for Flow and return the public
 * key in the format Flow expects (uncompressed point, no 04 prefix).
 */
export function generateFlowKeyPair(): FlowKeyPair {
    const ecdh = crypto.createECDH(FLOW_KEY_CURVE)
    ecdh.generateKeys()

    // Flow expects the uncompressed public key without the leading 04 byte
    const uncompressedPubKey = ecdh.getPublicKey('hex')
    const publicKey = uncompressedPubKey.startsWith('04')
        ? uncompressedPubKey.slice(2)
        : uncompressedPubKey

    const privateKey = ecdh.getPrivateKey('hex')

    return { publicKey, privateKey }
}

export function generateAndEncryptWallet(): EncryptedWallet {
    const { publicKey, privateKey } = generateFlowKeyPair()

    const masterKey = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)

    const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv)
    let encrypted = cipher.update(privateKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()

    return {
        publicKey,
        encryptedPrivateKey: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
    }
}

/**
 * Decrypt a stored private key and return the raw hex private key string.
 * This is used by FCL authorization functions to sign transactions.
 */
export function decryptPrivateKey(
    encryptedPrivateKeyHex: string,
    ivHex: string,
    authTagHex: string
): string {
    const masterKey = getEncryptionKey()
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encryptedPrivateKeyHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
}
