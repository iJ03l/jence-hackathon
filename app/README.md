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
| Payments | Solana (USDC) with embedded wallets |
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
ENCRYPTION_KEY=<32-byte-hex-key-for-wallet-encryption>
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
| `/api/subscriptions` | POST | Subscribe to a creator |
| `/api/notifications` | GET | User notifications |

## Database Migrations

Generate a new migration after changing `server/src/db/schema.ts`:

```bash
cd server
npx drizzle-kit generate
npx drizzle-kit push     # Apply to database
```

## License

Private — All rights reserved.
