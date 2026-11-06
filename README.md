# SpecPilot

AI-powered project planning assistant. Turn a rough project idea into a concrete
plan — requirements, recommended tech stack, milestones, timeline, effort
estimate, risks, and next steps.

## Features

- Analyze a project idea from a text prompt
- Structured, actionable plan rendered as a report
- Multi-provider AI (Groq primary, Gemini fallback) with automatic retry
- Rate limiting and abuse protection
- Markdown & PDF export (coming soon)

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Styling:** Tailwind CSS v4, shadcn/ui (base-nova)
- **Validation:** Zod
- **Database:** Neon (Postgres) via Drizzle ORM
- **Auth:** Auth.js (NextAuth v5)
- **Rate limiting:** Upstash Redis
- **AI:** Groq (Llama 3.3 70B) + Google Gemini

## Getting started

### Prerequisites

- Node.js 22+
- (Optional) A free Groq API key from https://console.groq.com/keys
- (Optional) A free Gemini API key from https://aistudio.google.com/apikey

### Install

```bash
npm install
```

### Configure

Copy `.env.example` to `.env.local` and fill in the values you need:

```bash
cp .env.example .env.local
```

At minimum, set one AI provider key (`GROQ_API_KEY` or `GEMINI_API_KEY`) to use
the analyze feature.

To enable saving/sharing projects, create a free Neon database at
https://neon.tech and set `DATABASE_URL`. Then push the schema:

```bash
npm run db:push
```

### Authentication (Neon Auth)

SpecPilot uses Neon's Managed Better Auth. To enable:

1. In your Neon project, go to **Auth** → **Enable** (or run `neon neon-auth enable`).
   - Requires an AWS-region project without IP Allow / Private Networking.
2. Copy `NEON_AUTH_BASE_URL` and `NEON_AUTH_JWKS_URL` from the Auth page (or `neon env pull`).
3. Generate a cookie secret: `openssl rand -base64 32` → `NEON_AUTH_COOKIE_SECRET`.
4. Add all three to `.env.local`.
5. Restart the dev server.

Auth pages live at `/auth/sign-in` and `/auth/sign-up`.

Add these scripts to `package.json` if not present:

```json
"db:push": "drizzle-kit push",
"db:studio": "drizzle-kit studio"
```

### Run

```bash
npm run dev
```

Open http://localhost:3000.

### Verify

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Environment variables

See `.env.example` for the full list. AI provider keys are optional individually
but at least one is required for analysis.

## Project structure

```
specpilot/
├── app/                # Next.js App Router (pages + API routes)
├── components/         # UI components (shadcn/ui + custom)
├── config/             # App identity (site.ts)
├── lib/                # AI clients, validators, rate limiting
└── public/             # Static assets
```

## License

All rights reserved.