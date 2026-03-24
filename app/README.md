# Jence

**Robotics & Hardware Engineering Publication**

Deep technical articles, hardware teardowns, market intelligence, and developer community from credited engineers — firmware to manufacturing.

## Architecture

```
jence/
├── app/          # React + Vite frontend (TypeScript, Tailwind CSS)
├── server/       # Hono API server (TypeScript, Drizzle ORM, PostgreSQL)
└── audits/       # System readiness audits
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, GSAP |
| Backend | Hono (Node.js), Drizzle ORM, PostgreSQL |
| Auth | Better Auth (email/password + Google OAuth) |
| Payments | Flow blockchain (USDC) with gas-sponsored embedded wallets |
| Hosting | jence.xyz |

## Features

### Content (Media)
- **10 engineering verticals**: Embedded, Robotics Software, Hardware Security, Industrial/OT, Drones, Humanoids, Sensors, Power/Thermal, Mechanical/DFM, Research
- **Credited authorship**: Real names, verified credentials, disclosure-first publishing
- **Article types**: Deep technical articles, hardware teardowns, field notes, lab experiments

### Launch Notes
- Community-driven product launch submissions
- **Admin approval workflow** — all submissions start as `pending` and must be reviewed
- Users can track their submission status (pending / approved / rejected)
- Admins can approve or reject inline

### Community
- Forum-style Q&A with posts, voting, comments, and tags
- Creator badges and reputation
- Real-time notifications

### Payments & Tipping (Flow USDC)
- **Gas-sponsored USDC transactions** on Flow blockchain
- Embedded wallets (P-256 keypairs, AES-256-GCM encrypted, server-managed)
- **Gasless for users** — the platform relayer pays all transaction fees using Flow's native payer role
- Direct USDC tips to creators on articles, posts, and launch notes
- Creator subscriptions with automated recurring billing (30-day cycles)
- Split payments between creators and platform with configurable revenue share

### First-Time Onboarding
- Gamified 5-step welcome flow at `/welcome` for new visitors
- Pick Your Stack (select verticals) → Choose Role → Personalized Feed Preview → Join/Explore
- Mobile-first, swipeable, with GSAP animations
- Persisted via `localStorage` (shows only once)

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- `.env` file in `server/` with `DATABASE_URL`

### Server
```bash
cd server
npm install
npx drizzle-kit push    # Apply schema to database
npm run dev              # Start API on port 8080
```

### Frontend
```bash
cd app
npm install
npm run dev              # Start Vite dev server on port 5173
```

### Environment Variables

**Server** (`server/.env`):
```
DATABASE_URL=postgresql://user:pass@localhost:5432/jence

# Wallet encryption
WALLET_ENCRYPTION_KEY=<32-byte-key-for-wallet-encryption>

# Flow blockchain
FLOW_ACCESS_NODE=https://rest-mainnet.onflow.org
FLOW_RELAYER_ADDRESS=<your-flow-relayer-account-address>
FLOW_RELAYER_PRIVATE_KEY=<hex-encoded-p256-private-key>
FLOW_RELAYER_KEY_INDEX=0
FLOW_PLATFORM_WALLET=<your-flow-platform-wallet-address>
FLOW_USDC_CONTRACT_ADDRESS=0xb19436aae4d94622

# Payments
VITE_CREATOR_PAYOUT_PERCENT=80

# Optional
RESEND_API_KEY=<optional-for-email-notifications>
```

**Frontend** (`app/.env`):
```
VITE_API_URL=http://localhost:3001
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/posts` | GET | Latest published articles |
| `/api/posts` | POST | Create article (creator only) |
| `/api/verticals` | GET | List all verticals |
| `/api/verticals/:slug` | GET | Vertical detail + posts |
| `/api/creators` | GET | List all creators |
| `/api/creators/u/:username` | GET | Creator profile + posts |
| `/api/community/posts` | GET/POST | Community forum posts |
| `/api/launches` | GET | Approved launches (public) |
| `/api/launches` | POST | Submit a launch (auth required) |
| `/api/launches/my` | GET | User's own submissions |
| `/api/launches/:id/review` | PUT | Admin approve/reject |
| `/api/stats/global` | GET | Platform statistics |
| `/api/wallet/me` | GET | User's wallet address + USDC balance |
| `/api/wallet/create` | POST | Create embedded Flow wallet |
| `/api/wallet/export` | GET | Export private key |
| `/api/tips` | POST | Send USDC tip to a creator |
| `/api/subscriptions` | POST | Subscribe to a creator |
| `/api/notifications` | GET | User notifications |

## Flow Blockchain Integration

Jence uses Flow's native multi-role transaction signing for gasless USDC transfers:

- **Proposer & Payer**: Platform relayer account (pays all FLOW gas fees)
- **Authorizer**: User's embedded wallet (authorizes USDC movement)

This means users **never need to hold FLOW tokens** — the platform sponsors all transaction costs. Transactions use Cadence smart contracts to interact with Circle's USDC (FiatToken) deployed on Flow mainnet.

### How It Works
1. User creates an account → server generates a P-256 keypair, encrypts private key with AES-256-GCM
2. User tips a creator → server decrypts user's key, builds a Cadence transaction, signs as authorizer
3. Relayer signs as payer → transaction submitted to Flow Access Node → USDC transferred instantly
4. User sees confirmation → no gas fees, no crypto UX friction

## Database Migrations

Generate a new migration after changing `server/src/db/schema.ts`:

```bash
cd server
npx drizzle-kit generate
npx drizzle-kit push     # Apply to database
```

## License

Private — All rights reserved.
