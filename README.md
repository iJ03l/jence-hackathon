# Jence: Public Goods & Impact for Hardware Engineering

![Jence Protocol](https://i.imgur.com/your-banner.png) <!-- Placeholder banner -->

**Jence** is a decentralized media and funding network designed to solve a critical coordination failure: **Deep technical intelligence in the physical sciences (hardware, robotics, embedded, and materials sensing) is chronically underfunded and siloed.** 

While software engineering has robust open-source funding ecosystems, hardware engineers sharing schematics, reverse-engineering tears-downs, and vital R&D often do so without compensation, leading to abandoned projects and siloed knowledge.

Jence leverages **Flow Blockchain** to provide a gasless, consumer-friendly coordination layer where builders can publish, peer-review, and retroactively fund public goods in the physical sciences.

---

## The Coordination Problem

1. **High Overhead for Hardware R&D**: Hardware research requires physical components, lab space, and fabrication, unlike software. 
2. **Broken Incentives**: Creators of deep tech writeups, teardowns, and sensor analyses receive no direct value capture, discouraging knowledge sharing.
3. **Friction in Crypto-Funding**: Existing Web3 funding platforms force users to understand wallets, gas, and bridging before they can contribute.

## Jence's Solution (Public Goods & Impact)

Jence functions as a **Programmable Treasury and Impact Attestation System** tailored for the DeSci (Decentralized Science) and Hardware communities.

- **Gasless Micro-Funding**: Using Flow's native account abstraction and multi-party signing, Jence acts as the exacted `payer` for gas fees. Users simply click "Fund" and USDC flows directly to the researcher.
- **Creator Impact Scores**: Every piece of engineering research published acts as an on-chain attestation of impact. As community members fund the research, the creator builds an immutable "Impact Score".
- **Transparent Treasuries**: The platform maintains an open-source, programmatic split of all funding (80% to the researcher, 20% to the protocol treasury), driving sustainable, retroactive public goods funding.

## Hackathon Track Alignment: Economic & Governance Systems

Jence directly tackles the **Public Goods & Impact** sub-track by introducing a novel coordination market:

* **Retroactive Funding Mechanisms:** Readers fund open-source hardware contributors natively in USDC based on the utility of their published research.
* **Impact Attestation Systems:** Engineering research is verified by credentialed peers, and financial backing serves as economic attestation of the work's validity.
* **Community Treasury Dashboards:** The platform provides transparent spending analytics and ROI tracking (`/api/stats/treasury`), explicitly detailing how value flows from consumers to public goods creators.

---

## Technical Architecture

Jence is built on a modern, high-performance stack prioritizing consumer UX:

* **Blockchain**: Flow Network (Native Account Abstraction, Gas Sponsorship)
* **Smart Contracts**: Cadence (`FiatToken` / Circle USDC)
* **Backend**: Node.js + Hono, Drizzle ORM, PostgreSQL
* **Security**: AES-256-GCM server-side enclaves for managed P-256 ECDSA keypairs
* **Frontend**: React 18, Vite, Tailwind CSS, GSAP for dynamic interfaces

## Features & Mechanisms

* **10 Deep Tech Verticals**: From Robotics Software and embedded to Humanoids and Power/Thermal systems.
* **Flow Client Library (FCL)**: Zero-friction onboarding. Users don't need a wallet extension. Jence provisions and manages their keys securely, acting as the gas relayer.
* **Multi-Role Auth**: Seamless Flow transaction authorization where the user is the `authorizer` and Jence is the `payer`.

## Running Locally

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

## Relevant API Endpoints
* `GET /api/stats/treasury`: Real-time view of community impact funding, MRR, and platform treasury.
* `POST /api/tips`: Programmable retroactive public goods funding (tipping researchers).
* `POST /api/subscriptions`: Recurring conviction funding for ongoing research.

---

Built for the builders of the physical world.
