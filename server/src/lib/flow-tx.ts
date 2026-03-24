import { getFlowAccessNode, getRelayerAddress, getRelayerPrivateKey, getRelayerKeyIndex } from './relayer.js'
import { USDC_CONTRACT_ADDRESS } from './usdc.js'

/**
 * Build and send a USDC transfer transaction on Flow.
 *
 * Flow's multi-role transaction signing:
 * - Proposer: relayer (provides sequence number)
 * - Payer:    relayer (pays gas fees — gasless for user)
 * - Authorizer: sender (their private key authorizes the USDC withdrawal)
 *
 * Returns the transaction ID on success.
 */
export async function sendUsdcTransfer(params: {
    senderAddress: string
    senderPrivateKey: string
    senderKeyIndex: number
    recipientAddress: string
    amount: string  // UFix64 formatted string e.g. "1.50000000"
}): Promise<string> {
    const { senderAddress, senderPrivateKey, senderKeyIndex, recipientAddress, amount } = params
    const accessNode = getFlowAccessNode()

    // Cadence transaction for USDC transfer with separate payer
    const cadenceTransaction = `
        import FungibleToken from 0xf233dcee88fe0abe
        import FiatToken from ${USDC_CONTRACT_ADDRESS}

        transaction(amount: UFix64, recipient: Address) {
            let sentVault: @{FungibleToken.Vault}

            prepare(signer: auth(BorrowValue) &Account) {
                let vaultRef = signer.storage
                    .borrow<auth(FungibleToken.Withdraw) &FiatToken.Vault>(from: /storage/USDCVault)
                    ?? panic("Could not borrow USDC vault reference")

                self.sentVault <- vaultRef.withdraw(amount: amount)
            }

            execute {
                let recipientAccount = getAccount(recipient)
                let receiverRef = recipientAccount.capabilities
                    .borrow<&{FungibleToken.Receiver}>(/public/USDCVaultReceiver)
                    ?? panic("Could not borrow receiver reference")

                receiverRef.deposit(from: <- self.sentVault)
            }
        }
    `

    // Build the transaction payload using Flow's REST API
    // Step 1: Get the relayer's account to get the sequence number
    const relayerAddress = getRelayerAddress()
    const relayerPrivateKey = getRelayerPrivateKey()
    const relayerKeyIndex = getRelayerKeyIndex()

    // Get the latest sealed block for reference
    const blockRes = await fetch(`${accessNode}/v1/blocks?height=sealed&n=1`)
    const blocks = await blockRes.json() as any[]
    const referenceBlockId = blocks[0].header.id

    // Get proposer sequence number
    const accountRes = await fetch(`${accessNode}/v1/accounts/${relayerAddress}?expand=keys`)
    const accountData = await accountRes.json() as any
    const sequenceNumber = accountData.keys[relayerKeyIndex].sequence_number

    // Build the transaction body for the Flow REST API
    const txBody = {
        script: Buffer.from(cadenceTransaction).toString('base64'),
        arguments: [
            Buffer.from(JSON.stringify({ type: 'UFix64', value: amount })).toString('base64'),
            Buffer.from(JSON.stringify({ type: 'Address', value: recipientAddress })).toString('base64'),
        ],
        reference_block_id: referenceBlockId,
        gas_limit: '999',
        proposal_key: {
            address: relayerAddress,
            key_index: relayerKeyIndex,
            sequence_number: sequenceNumber,
        },
        payer: relayerAddress,
        authorizers: [senderAddress],
    }

    // Sign the transaction envelope
    // For Flow, we need to sign the payload (as authorizer) and the envelope (as payer)
    const { signWithKey } = await import('./relayer.js')

    // Create payload signature (sender as authorizer)
    const payloadMessage = buildFlowPayloadMessage(txBody)
    const payloadSig = signWithKey(senderPrivateKey, payloadMessage)

    // Create envelope signature (relayer as payer)
    const envelopeMessage = buildFlowEnvelopeMessage(txBody, [{
        address: senderAddress,
        key_index: senderKeyIndex,
        signature: payloadSig.toString('hex'),
    }])
    const envelopeSig = signWithKey(relayerPrivateKey, envelopeMessage)

    // Submit the transaction
    const submitBody = {
        ...txBody,
        payload_signatures: [{
            address: senderAddress,
            key_index: senderKeyIndex,
            signature: Buffer.from(payloadSig).toString('base64'),
        }],
        envelope_signatures: [{
            address: relayerAddress,
            key_index: relayerKeyIndex,
            signature: Buffer.from(envelopeSig).toString('base64'),
        }],
    }

    const txRes = await fetch(`${accessNode}/v1/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitBody),
    })

    if (!txRes.ok) {
        const errText = await txRes.text()
        throw new Error(`Flow transaction submission failed: ${txRes.status} - ${errText}`)
    }

    const txResult = await txRes.json() as any
    return txResult.id
}

/**
 * Send USDC with a platform split (for tips/subscriptions).
 * Splits the amount between creator and platform, both in a single transaction.
 */
export async function sendUsdcWithSplit(params: {
    senderAddress: string
    senderPrivateKey: string
    senderKeyIndex: number
    creatorAddress: string
    platformAddress: string | undefined
    totalUsdc: number
    creatorSharePercent: number
}): Promise<string> {
    const { senderAddress, senderPrivateKey, senderKeyIndex, creatorAddress, platformAddress, totalUsdc, creatorSharePercent } = params

    const creatorAmount = totalUsdc * (creatorSharePercent / 100)
    const platformAmount = totalUsdc - creatorAmount

    const accessNode = getFlowAccessNode()
    const relayerAddress = getRelayerAddress()
    const relayerPrivateKey = getRelayerPrivateKey()
    const relayerKeyIndex = getRelayerKeyIndex()

    // Cadence transaction that splits payment between creator and platform
    const hasPlatformSplit = platformAmount > 0 && platformAddress

    const cadenceTransaction = hasPlatformSplit ? `
        import FungibleToken from 0xf233dcee88fe0abe
        import FiatToken from ${USDC_CONTRACT_ADDRESS}

        transaction(creatorAmount: UFix64, platformAmount: UFix64, creatorAddr: Address, platformAddr: Address) {
            let creatorVault: @{FungibleToken.Vault}
            let platformVault: @{FungibleToken.Vault}

            prepare(signer: auth(BorrowValue) &Account) {
                let vaultRef = signer.storage
                    .borrow<auth(FungibleToken.Withdraw) &FiatToken.Vault>(from: /storage/USDCVault)
                    ?? panic("Could not borrow USDC vault reference")

                self.creatorVault <- vaultRef.withdraw(amount: creatorAmount)
                self.platformVault <- vaultRef.withdraw(amount: platformAmount)
            }

            execute {
                let creatorAccount = getAccount(creatorAddr)
                let creatorReceiver = creatorAccount.capabilities
                    .borrow<&{FungibleToken.Receiver}>(/public/USDCVaultReceiver)
                    ?? panic("Creator cannot receive USDC")
                creatorReceiver.deposit(from: <- self.creatorVault)

                let platformAccount = getAccount(platformAddr)
                let platformReceiver = platformAccount.capabilities
                    .borrow<&{FungibleToken.Receiver}>(/public/USDCVaultReceiver)
                    ?? panic("Platform cannot receive USDC")
                platformReceiver.deposit(from: <- self.platformVault)
            }
        }
    ` : `
        import FungibleToken from 0xf233dcee88fe0abe
        import FiatToken from ${USDC_CONTRACT_ADDRESS}

        transaction(amount: UFix64, recipient: Address) {
            let sentVault: @{FungibleToken.Vault}

            prepare(signer: auth(BorrowValue) &Account) {
                let vaultRef = signer.storage
                    .borrow<auth(FungibleToken.Withdraw) &FiatToken.Vault>(from: /storage/USDCVault)
                    ?? panic("Could not borrow USDC vault reference")

                self.sentVault <- vaultRef.withdraw(amount: amount)
            }

            execute {
                let recipientAccount = getAccount(recipient)
                let receiverRef = recipientAccount.capabilities
                    .borrow<&{FungibleToken.Receiver}>(/public/USDCVaultReceiver)
                    ?? panic("Could not borrow receiver reference")

                receiverRef.deposit(from: <- self.sentVault)
            }
        }
    `

    const args = hasPlatformSplit ? [
        Buffer.from(JSON.stringify({ type: 'UFix64', value: formatUFix64(creatorAmount) })).toString('base64'),
        Buffer.from(JSON.stringify({ type: 'UFix64', value: formatUFix64(platformAmount) })).toString('base64'),
        Buffer.from(JSON.stringify({ type: 'Address', value: creatorAddress })).toString('base64'),
        Buffer.from(JSON.stringify({ type: 'Address', value: platformAddress })).toString('base64'),
    ] : [
        Buffer.from(JSON.stringify({ type: 'UFix64', value: formatUFix64(totalUsdc) })).toString('base64'),
        Buffer.from(JSON.stringify({ type: 'Address', value: creatorAddress })).toString('base64'),
    ]

    // Get block and sequence number
    const blockRes = await fetch(`${accessNode}/v1/blocks?height=sealed&n=1`)
    const blocks = await blockRes.json() as any[]
    const referenceBlockId = blocks[0].header.id

    const accountRes = await fetch(`${accessNode}/v1/accounts/${relayerAddress}?expand=keys`)
    const accountData = await accountRes.json() as any
    const sequenceNumber = accountData.keys[relayerKeyIndex].sequence_number

    const txBody = {
        script: Buffer.from(cadenceTransaction).toString('base64'),
        arguments: args,
        reference_block_id: referenceBlockId,
        gas_limit: '999',
        proposal_key: {
            address: relayerAddress,
            key_index: relayerKeyIndex,
            sequence_number: sequenceNumber,
        },
        payer: relayerAddress,
        authorizers: [senderAddress],
    }

    const { signWithKey } = await import('./relayer.js')

    const payloadMessage = buildFlowPayloadMessage(txBody)
    const payloadSig = signWithKey(senderPrivateKey, payloadMessage)

    const envelopeMessage = buildFlowEnvelopeMessage(txBody, [{
        address: senderAddress,
        key_index: senderKeyIndex,
        signature: payloadSig.toString('hex'),
    }])
    const envelopeSig = signWithKey(relayerPrivateKey, envelopeMessage)

    const submitBody = {
        ...txBody,
        payload_signatures: [{
            address: senderAddress,
            key_index: senderKeyIndex,
            signature: Buffer.from(payloadSig).toString('base64'),
        }],
        envelope_signatures: [{
            address: relayerAddress,
            key_index: relayerKeyIndex,
            signature: Buffer.from(envelopeSig).toString('base64'),
        }],
    }

    const txRes = await fetch(`${accessNode}/v1/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitBody),
    })

    if (!txRes.ok) {
        const errText = await txRes.text()
        throw new Error(`Flow transaction failed: ${txRes.status} - ${errText}`)
    }

    const txResult = await txRes.json() as any
    return txResult.id
}

/**
 * Format a number as UFix64 string (8 decimal places).
 */
export function formatUFix64(amount: number): string {
    return amount.toFixed(8)
}

// ---- Flow transaction message encoding helpers ----
// These build the canonical byte representations that Flow expects for signing

function buildFlowPayloadMessage(txBody: any): Buffer {
    // Simplified: encode the transaction payload as a deterministic byte string
    // In production, this should use RLP encoding per Flow's transaction spec
    const payload = JSON.stringify({
        script: txBody.script,
        arguments: txBody.arguments,
        reference_block_id: txBody.reference_block_id,
        gas_limit: txBody.gas_limit,
        proposal_key: txBody.proposal_key,
        payer: txBody.payer,
        authorizers: txBody.authorizers,
    })
    // Flow prefixes the payload with a domain tag
    const domainTag = Buffer.from('FLOW-V0.0-transaction'.padEnd(32, '\0'))
    return Buffer.concat([domainTag, Buffer.from(payload)])
}

function buildFlowEnvelopeMessage(txBody: any, payloadSignatures: any[]): Buffer {
    const envelope = JSON.stringify({
        script: txBody.script,
        arguments: txBody.arguments,
        reference_block_id: txBody.reference_block_id,
        gas_limit: txBody.gas_limit,
        proposal_key: txBody.proposal_key,
        payer: txBody.payer,
        authorizers: txBody.authorizers,
        payload_signatures: payloadSignatures,
    })
    const domainTag = Buffer.from('FLOW-V0.0-transaction'.padEnd(32, '\0'))
    return Buffer.concat([domainTag, Buffer.from(envelope)])
}
