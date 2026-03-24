/**
 * Flow blockchain integration for Jence frontend.
 *
 * This module provides client-side utilities for interacting with
 * Flow via FCL (Flow Client Library). Currently used for:
 * - Building subscription transactions (client-side preview only)
 * - USDC balance display helpers
 *
 * Note: All actual transaction signing and submission is handled
 * server-side via the embedded wallet and gas sponsorship relayer.
 * The frontend only needs to call API endpoints.
 */

// Flow USDC uses 8 decimals
export const USDC_DECIMALS = 8

// Flow block explorer
export const FLOW_EXPLORER_URL = 'https://flowscan.io'

/**
 * Format a USDC amount for display.
 */
export function formatUsdc(amount: number): string {
    return `$${amount.toFixed(2)}`
}

/**
 * Get a Flowscan transaction URL.
 */
export function getTransactionUrl(txId: string): string {
    return `${FLOW_EXPLORER_URL}/transaction/${txId}`
}

/**
 * Get a Flowscan account URL.
 */
export function getAccountUrl(address: string): string {
    return `${FLOW_EXPLORER_URL}/account/${address}`
}
