import { getFlowAccessNode } from './relayer.js'

// USDC contract address on Flow Mainnet (Circle's FiatToken)
export const USDC_CONTRACT_ADDRESS = process.env.FLOW_USDC_CONTRACT_ADDRESS || '0xb19436aae4d94622'
export const USDC_DECIMALS = 8 // Flow USDC uses 8 decimals

export function toUsdcMinorUnits(amount: number) {
    return Math.round(amount * 10 ** USDC_DECIMALS)
}

export function fromUsdcMinorUnits(amount: number) {
    return amount / 10 ** USDC_DECIMALS
}

/**
 * Query the USDC balance for a Flow account address.
 * Uses Flow's REST API to execute a Cadence script.
 */
export async function getUsdcBalance(address: string): Promise<number> {
    const accessNode = getFlowAccessNode()

    const cadenceScript = `
        import FungibleToken from 0xf233dcee88fe0abe
        import FiatToken from ${USDC_CONTRACT_ADDRESS}

        access(all) fun main(address: Address): UFix64 {
            let account = getAccount(address)
            let vaultRef = account.capabilities
                .borrow<&{FungibleToken.Balance}>(/public/USDCVaultBalance)

            if vaultRef == nil {
                return 0.0
            }

            return vaultRef!.balance
        }
    `

    try {
        const response = await fetch(`${accessNode}/v1/scripts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                script: Buffer.from(cadenceScript).toString('base64'),
                arguments: [
                    Buffer.from(JSON.stringify({ type: 'Address', value: address })).toString('base64'),
                ],
            }),
        })

        if (!response.ok) {
            console.error(`Flow script execution failed: ${response.status}`)
            return 0
        }

        const result = await response.json() as any
        // Flow returns base64-encoded JSON value
        const decoded = JSON.parse(Buffer.from(result.value, 'base64').toString('utf-8'))
        return parseFloat(decoded.value || '0')
    } catch (error) {
        console.error('Failed to query USDC balance:', error)
        return 0
    }
}
