# Jence: Public Goods & Impact for Hardware Engineering

**Jence** is a decentralized media and funding network designed to solve a critical coordination failure: **Deep technical intelligence in the physical sciences (hardware, robotics, embedded, and materials sensing) is chronically underfunded and siloed.** 

While software engineering has robust open-source funding ecosystems, hardware engineers sharing schematics, reverse-engineering tears-downs, and vital R&D often do so without compensation, leading to abandoned projects and siloed knowledge.

Jence leverages **Flow Blockchain** to provide a consumer-friendly coordination layer where builders can publish, peer-review, and retroactively fund public goods in the physical sciences.

---

## The Coordination Problem

1. **High Overhead for Hardware R&D**: Hardware research requires physical components, lab space, and fabrication, unlike software. 
2. **Broken Incentives**: Creators of deep tech writeups, teardowns, and sensor analyses receive no direct value capture, discouraging knowledge sharing.
3. **Friction in Crypto-Funding**: Existing Web3 funding platforms force users to understand wallets, gas, and bridging before they can contribute.

## Jence's Solution (Public Goods & Impact)

Jence functions as a **Programmable Treasury and Impact Attestation System** tailored for the DeSci (Decentralized Science) and Hardware communities.

- **Gasless Micro-Funding**: Using Flow's native account abstraction and multi-party signing, Jence acts as the exacted `payer` for gas fees. 
- **Creator Impact Scores**: Every piece of engineering research published acts as an on-chain attestation of impact. As community members fund the research, the creator builds an immutable "Impact Score".
- **Transparent Treasuries**: The platform maintains an open-source, programmatic split of all funding (80% to the researcher, 20% to the protocol treasury), driving sustainable, retroactive public goods funding.

## Current MVP Architecture & Trade-offs

To optimize for immediate consumer onboarding where users don't need a wallet extension, the **MVP Version 1** utilizes a server-managed custodial flow:
* **Blockchain**: Flow Network
* **Smart Contracts**: Cadence (`FiatToken` / Circle USDC)
* **Backend**: Node.js + Hono, Drizzle ORM, PostgreSQL
* **Custodial Keys**: Server-side AES-256-GCM encrypted P-256 ECDSA keypairs (managed entirely by Jence)
* **Multi-Role Auth**: Jence backend acts as both the transaction `authorizer` (via decrypted keys) and the fuel `payer`.

*(Note: We recognize the centralization risks of holding raw private keys on a Node.js server. This MVP architecture serves strictly to validate product-market fit for consumer-friendly hardware funding. See our V2 Roadmap below for the transition to true decentralized custody.)*

---

## V2 Roadmap: Hybrid Custody & New Funding Workflows

In upcoming releases, Jence will migrate from V1 server-managed keys to **Flow's Native Hybrid Custody** and true **Flow Client Library (FCL)** integration. This positions Jence firmly within Web3 best practices without sacrificing the frictionless consumer UX.

### Upcoming Release: How Users Will Easily Fund Projects

1. **Walletless Onboarding (Blocto/Lilico via FCL)**
   - A new user lands on a teardown article. When they click **"Fund this Research"**, FCL intercepts the action.
   - Users simply log in via email or Google (powered by Blocto or native Flow account abstraction). No seed phrases required.
   
2. **Fiat-to-USDC In-App (Stripe/Wyre via FCL Plugins)**
   - Currently, users must possess USDC to fund. In the upcoming V2 release, users can check out directly with Apple Pay or credit cards.
   - The fiat is instantly converted to Flow USDC via a liquidity provider, bridging the Web2 funding gap seamlessly to the creator.

3. **Hybrid Custody Delegation**
   - The user's freshly created FCL wallet delegates signing authority to Jence's platform relayer for specific constraints (e.g., "Only allow tipping/subscriptions up to 10 USDC per day").
   - Jence acts as the hybrid-custodial application layer, automatically sponsoring gas (`payer`) while the user retains sovereign ownership of their parent account.

### Hackathon Evaluation Notes
We understand that an impact platform's integrity relies on decentralization. By moving to Hybrid Custody in the forthcoming release, Jence will guarantee that:
- Centralized server breaches cannot compromise user funds.
- Creators hold sovereign custody of their treasury payouts.
- Impact scores and funding history remain truly trustless and immutable.

---

## Running Locally (V1)

### 1. Database & Server
```bash
cd server
npm install
npx drizzle-kit push  # Sync schema to Postgres
npm run dev
```

### 2. Client Application
```bash
cd app
npm install
npm run dev
```


Built for the builders of the physical world. MIT - License
