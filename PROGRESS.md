# SpecPilot — Progress Notes

AI-powered project planning assistant. Portfolio project.
Zero budget: everything runs on free tiers.

## Plan (v1)

- Analyze a project idea (text or uploaded doc) → structured report:
  requirements, tech stack, milestones, timeline, effort, risks, next steps.
- Save analyses, shareable links, export to Markdown **and PDF**.
- Auth (Auth.js), Postgres (Neon), rate limiting (Upstash).
- Stack: Next.js 16 + React 19 + TS + Tailwind v4 + shadcn/ui + Drizzle.
- AI: Groq (Llama 3.3 70B) primary, Gemini 2.0 Flash fallback.

## Build order

1. Skeleton — **DONE**
2. AI integration (Groq + Gemini fallback, Zod contract, prompt) — **DONE**
3. Report UI — **DONE** (folded into Phase 2)
4. Document upload (PDF/DOCX/TXT/MD) — **DONE**
5. Persistence + sharing (Neon + Drizzle) — **DONE**
6. Auth (Neon Auth / Managed Better Auth) — **DONE (code)**
3. Report UI
4. Document upload (PDF/DOCX/TXT)
5. Persistence + sharing (Neon + Drizzle)
6. Auth (Auth.js)
7. Rate limiting (Upstash) + security hardening
8. Export (Markdown + PDF)
9. Polish & deploy (Vercel + Neon)

## Security

- SQL injection: Drizzle ORM + parameterized queries (no raw string concat).
- DDoS/abuse: Upstash rate limit per IP + per user daily cap + input size caps + request timeouts.
- Prompt injection: user/doc text wrapped in delimiters; model instructed to treat as data.
- Secrets server-side only; security headers (CSP, HSTS, X-Frame-Options).
- File upload: MIME + size validation.

## Environment facts

- Next.js 16.3.8, React 19.2.8, Tailwind CSS v4, TypeScript 5, ESLint 9 flat config.
- Shell quirk: use `npm.cmd` / `npx.cmd` (PowerShell blocks `.ps1` shims).
- shadcn base-nova uses `@base-ui/react` (no `asChild`; use `buttonVariants` or `render`).

## Phase 2 — files added

- `lib/validators.ts` — Zod schemas: `ProjectPlanSchema` (single contract for AI/DB/UI), `AnalyzeInputSchema`, types.
- `lib/ai/prompt.ts` — `buildSystemPrompt` (role + strict JSON spec + anti-injection rules), `buildUserPrompt` (delimited `<idea>`/`<document>`/`<constraints>`).
- `lib/ai/groq.ts` — Groq client (OpenAI-compatible, JSON mode, timeout).
- `lib/ai/gemini.ts` — Gemini fallback client (responseMimeType JSON, timeout).
- `lib/rate-limit.ts` — Upstash sliding window (10/min) with in-memory fallback + per-user daily cap.
- `app/api/analyze/route.ts` — POST endpoint: size guard, IP rate limit, Zod input validation, Groq→Gemini fallback, JSON parse + Zod output validation with one retry, 503/502/429/400 errors.
- `components/report-view.tsx` — renders a ProjectPlan (goals, requirements, tech stack, timeline/milestones, risks, recommendations, next steps).
- `app/analyze/page.tsx` — client form (idea + constraints) + loading/error states + report render.

## Verification (Phase 2)

- `tsc --noEmit`: clean
- `eslint .`: clean
- `next build`: success; routes `/`, `/analyze`, `/projects`, `/_not-found` static; `/api/analyze` dynamic.
- Manual: validation (400), no-provider (503), rate limit (429) all confirmed via curl against dev server. Full AI flow working with Groq free tier (gpt-oss-120b).

## Phase 3 — files added

- `app/api/upload/route.ts` — POST: multipart file, size cap (5MB), MIME/ext allowlist (PDF/DOCX/TXT/MD), text extraction (unpdf for PDF, mammoth for DOCX, plain read for text), whitespace normalization, 8K char cap, returns `{ filename, chars, text }`.
- `app/analyze/page.tsx` — file picker + upload progress + filename/char count + remove; passes `documentText` to `/api/analyze`.

## Verification (Phase 3)

- `tsc --noEmit`: clean
- `eslint .`: clean
- `next build`: success; routes include `/api/upload` (dynamic).
- Manual: TXT, PDF (extracted "Dummy PDF file"), DOCX (extracted 8972 chars) all confirmed via curl.

## Phase 4 — files added

- `lib/db/schema.ts` — `projects` table (uuid, title, idea, constraints, document_text, plan jsonb, provider, timestamps).
- `lib/db/index.ts` — Drizzle client over Neon HTTP; null when DATABASE_URL unset (graceful degradation).
- `drizzle.config.ts` — drizzle-kit config.
- `app/api/projects/route.ts` — GET list / POST create (Zod validation).
- `app/api/projects/[id]/route.ts` — GET one.
- `app/p/[id]/page.tsx` — public shareable report view (force-dynamic).
- `app/projects/page.tsx` — saved projects list (force-dynamic, empty/no-DB states).
- `app/analyze/page.tsx` — "Save project" button + shareable link after save.

## Verification (Phase 4)

- `tsc --noEmit`: clean
- `eslint .`: clean
- `next build`: success; routes include `/api/projects`, `/api/projects/[id]`, `/p/[id]`, `/projects`.
- Manual (no DB): `/api/projects` → 503 "Database not configured"; graceful degradation confirmed.
- Full save/share flow requires a Neon DATABASE_URL (see README).

## Phase 5 — files added (Neon Auth)

- `lib/auth/server.ts` — `createNeonAuth` (lazy, env-guarded) via Proxy.
- `lib/auth/client.ts` — `createAuthClient()` from `@neon/auth/next`.
- `app/api/auth/[...path]/route.ts` — auth handler (GET/POST/PUT/DELETE/PATCH).
- `proxy.ts` — Next 16 middleware using `auth.middleware()` (public routes: /, /analyze, /projects, /p).
- `components/auth-providers.tsx` — QueryClientProvider + AuthProvider (Better Auth UI).
- `app/auth/[path]/page.tsx` — Better Auth UI `<Auth path={path} />`.
- `components/site-header.tsx` — server component, shows user email + SignOutButton or Sign in link.
- `components/sign-out-button.tsx` — client sign-out.
- `lib/db/schema.ts` — added `userId` column to `projects`.
- `app/api/projects/route.ts` — GET filtered by userId, POST requires session + stores userId.
- `app/projects/page.tsx` — shows user's projects; prompts sign-in if not logged in.

## Verification (Phase 5)

- `tsc --noEmit`: clean
- `eslint .`: clean
- `next build`: success; routes include `/auth/[path]`, proxy middleware.
- Runtime requires `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` (and DB for saving).