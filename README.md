# SpecPilot

AI-powered project planning assistant. Turn a rough project idea into a concrete
plan — requirements, recommended tech stack, milestones, timeline, effort
estimate, risks, and next steps.

**Live demo:** https://specpilot.vercel.app _(replace with your URL)_

## Features

- Analyze a project idea from a text prompt
- Upload a supporting document (PDF, DOCX, TXT, MD) to enrich the analysis
- Structured, actionable report: goals, functional/non-functional requirements,
  tech stack, timeline, milestones, effort, risks, recommendations, next steps
- Multi-provider AI (Groq primary, Gemini fallback) with automatic retry
- Rate limiting (per-IP + per-user daily cap) and abuse protection
- Save projects, shareable public links (`/p/{id}`)
- Export to Markdown and PDF (client-side, no server load)
- Dark/light mode, responsive, accessible

## Tech stack (and why)

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript 5 | Full-stack in one repo; free Vercel hosting; Server/Client components |
| Styling | Tailwind CSS v4 + shadcn/ui (base-nova) | Utility-first, owned components (not a dep), professional look |
| Validation | Zod | Single schema = AI contract = DB shape = UI types |
| Database | Neon (Postgres) via Drizzle ORM | Free tier, serverless-friendly, lighter than Prisma |
| Auth | Neon Auth (Managed Better Auth) | Zero auth infra, branches with DB, modern features |
| AI (primary) | Groq — `openai/gpt-oss-120b` | Free tier, very fast, OpenAI-compatible |
| AI (fallback) | Google Gemini (`gemini-3.8-flash`) | Free tier, different provider for resilience |
| Rate limiting | Upstash Redis (in-memory fallback) | Free tier, serverless-friendly |
| File parsing | `unpdf` (PDF), `mammoth` (DOCX) | Node/serverless-friendly (avoids pdf-parse's DOMMatrix issue) |
| PDF export | `@react-pdf/renderer` | Free, client-side, no server load |
| SEO | Metadata API, robots.txt, sitemap.xml, JSON-LD, dynamic OG image | Google-indexable |

## Architecture

```
Browser (Vercel)
  |
  +-- Next.js App Router
        |-- Server Components (landing, projects, shared report)
        |-- Client Components (analyze form, report view, export)
        +-- Route Handlers (/api/*)
              |-- /api/analyze   -> Groq -> Gemini fallback -> Zod validate
              |-- /api/upload    -> PDF/DOCX/TXT/MD -> text
              |-- /api/projects  -> Drizzle -> Neon Postgres (auth-gated)
              +-- /api/auth/*    -> Neon Auth (Managed Better Auth)
```

Key design decisions:
- **Single Zod contract** drives the AI prompt spec, API validation, DB persistence, and UI rendering.
- **Prompt-injection defense**: user/doc text wrapped in XML delimiters; system prompt treats them as data.
- **Graceful degradation**: app runs with missing env vars (DB, auth, AI, rate limiter all fall back).
- **Per-user data scoping**: `projects.userId` filtered by session; shared links (`/p/{id}`) stay public.
- **Client-side PDF**: no server load, works offline.

## Getting started

### Prerequisites

- Node.js 22+
- A free Groq API key (https://console.groq.com/keys) — or Gemini (https://aistudio.google.com/apikey)
- A free Neon database (https://neon.tech) — optional, for saving projects

### Install & run

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run db:push               # create tables (if using Neon)
npm run dev                   # http://localhost:3000
```

### Verify

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Environment variables

See `.env.example`. At minimum, set one AI provider key. Full list:

| Variable | Required for | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | Branding | Override app name (default: SpecPilot) |
| `NEXT_PUBLIC_APP_URL` | SEO/sharing | Your deployed URL |
| `GROQ_API_KEY` | Analysis | Free at console.groq.com |
| `GEMINI_API_KEY` | Fallback | Free at aistudio.google.com |
| `GROQ_MODEL` / `GEMINI_MODEL` | Override | Leave blank for auto-discovery |
| `DATABASE_URL` | Saving/sharing | Neon pooled connection string |
| `NEON_AUTH_BASE_URL` | Auth | From Neon console |
| `NEON_AUTH_COOKIE_SECRET` | Auth | `openssl rand -base64 32` |
| `NEON_AUTH_JWKS_URL` | Auth | From Neon console |
| `UPSTASH_REDIS_REST_URL` | Rate limiting | Optional; in-memory fallback |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting | Optional |

## Authentication (Neon Auth)

SpecPilot uses Neon's Managed Better Auth. To enable:

1. Neon Console → **Auth** → **Enable** (requires AWS region, no IP Allow/Private Networking)
2. Copy `NEON_AUTH_BASE_URL` and `NEON_AUTH_JWKS_URL` (or `neon env pull`)
3. Generate `NEON_AUTH_COOKIE_SECRET`: `openssl rand -base64 32`
4. Add all three to `.env.local`, restart dev server
5. Run `npm run db:push` to add the `userId` column

Auth pages: `/auth/sign-in`, `/auth/sign-up`. Trusted domains for production:
`neon neon-auth domain add https://your-app.vercel.app`

## Project structure

```
specpilot/
  app/                  # Next.js App Router (pages + API routes)
    analyze/            # Idea form + report + save + export
    projects/           # Saved projects list (auth-gated)
    p/[id]/             # Shared report view (public)
    auth/[path]/        # Better Auth UI
    api/                # Route handlers (analyze, upload, projects, auth)
    robots.ts / sitemap.ts / opengraph-image.tsx
  components/           # UI (shadcn/ui + custom)
  config/site.ts        # Single source of truth for app identity
  lib/
    ai/                 # Groq, Gemini, prompt templates
    db/                 # Drizzle schema + client
    export/             # Markdown generator
    rate-limit.ts       # Upstash + in-memory + daily cap
    validators.ts       # Zod schemas (single contract)
  proxy.ts              # Next 16 middleware (auth)
  next.config.ts        # Security headers
```

## Security

- **SQL injection:** Drizzle ORM + parameterized queries (no string concat)
- **DDoS/abuse:** Upstash sliding window (10/min per IP) + per-user daily cap (10/day) + input size caps + request timeouts
- **Prompt injection:** user/doc text in XML delimiters; system prompt treats as data
- **Secrets:** server-side only (never exposed to client)
- **Headers:** CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **File upload:** 5MB cap, MIME + extension allowlist, no execution of uploaded content
- **Graceful degradation:** app runs with missing env vars

## Deployment (Vercel)

1. Push to GitHub
2. Import repo on https://vercel.com/new (Next.js, root = `.`)
3. Set environment variables (see table above)
4. Redeploy
5. `neon neon-auth domain add https://your-app.vercel.app`
6. Submit sitemap to Google Search Console

CI runs on push/PR via `.github/workflows/ci.yml` (lint + typecheck + build).

## License

All rights reserved.