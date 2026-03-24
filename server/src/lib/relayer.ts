import crypto from 'crypto'
import { SHA3 } from 'sha3'

// Flow access node endpoint
const FLOW_ACCESS_NODE = process.env.FLOW_ACCESS_NODE || 'https://rest-mainnet.onflow.org'

// Relayer account details (the platform account that pays gas fees)
const RELAYER_ADDRESS = process.env.FLOW_RELAYER_ADDRESS || ''
const RELAYER_PRIVATE_KEY = process.env.FLOW_RELAYER_PRIVATE_KEY || ''
const RELAYER_KEY_INDEX = parseInt(process.env.FLOW_RELAYER_KEY_INDEX || '0', 10)

/**
 * Get the Flow access node URL.
 */
export function getFlowAccessNode(): string {
    return FLOW_ACCESS_NODE
}

/**
 * Get the relayer (payer) account address.
 */
export function getRelayerAddress(): string {
    if (!RELAYER_ADDRESS && process.env.NODE_ENV === 'production') {
        throw new Error('FLOW_RELAYER_ADDRESS is required in production')
    }
    return RELAYER_ADDRESS
}

/**
 * Get the relayer private key (hex).
 */
export function getRelayerPrivateKey(): string {
    if (!RELAYER_PRIVATE_KEY && process.env.NODE_ENV === 'production') {
        throw new Error('FLOW_RELAYER_PRIVATE_KEY is required in production')
    }
    return RELAYER_PRIVATE_KEY
}

/**
 * Get the relayer key index on the Flow account.
 */
export function getRelayerKeyIndex(): number {
    return RELAYER_KEY_INDEX
}

/**
 * Sign a message using an ECDSA P-256 private key.
 * Flow requires DER-encoded signatures, and the message must be
 * hashed with SHA-3 (256) before signing.
 */
export function signWithKey(privateKeyHex: string, message: Buffer): Buffer {
    // Flow uses SHA3-256 for hashing the message envelope
    const sha3Hash = new SHA3(256)
    sha3Hash.update(message)
    const hashedMessage = sha3Hash.digest()

    const key = crypto.createPrivateKey({
        key: Buffer.concat([
            // PKCS8 prefix for P-256 private keys
            Buffer.from('30770201010420', 'hex'),
            Buffer.from(privateKeyHex, 'hex'),
            Buffer.from('a00a06082a8648ce3d030107a14403420004', 'hex'),
            // We don't have the public key here, but we can derive it
            // For signing, we only need the private key portion
        ]),
        format: 'der',
        type: 'pkcs8',
    })

    const sign = crypto.createSign('SHA256')
    sign.update(hashedMessage)
    const derSig = sign.sign(key)

    // Convert DER signature to raw r || s format (64 bytes) that Flow expects
    return derToRaw(derSig)
}

/**
 * Convert a DER-encoded ECDSA signature to raw r||s format.
 */
function derToRaw(derSig: Buffer): Buffer {
    // DER format: 30 <len> 02 <rlen> <r> 02 <slen> <s>
    let offset = 2 // skip 30 <len>
    if (derSig[1] & 0x80) offset += (derSig[1] & 0x7f) // long form length

    // Read r
    offset++ // skip 02
    const rLen = derSig[offset++]
    const r = derSig.subarray(offset, offset + rLen)
    offset += rLen

    // Read s
    offset++ // skip 02
    const sLen = derSig[offset++]
    const s = derSig.subarray(offset, offset + sLen)

    // Pad or trim to 32 bytes each
    const rPadded = Buffer.alloc(32)
    const sPadded = Buffer.alloc(32)
    r.copy(rPadded, Math.max(0, 32 - r.length), Math.max(0, r.length - 32))
    s.copy(sPadded, Math.max(0, 32 - s.length), Math.max(0, s.length - 32))

    return Buffer.concat([rPadded, sPadded])
}
