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
- Manual: validation (400), no-provider (503), rate limit (429) all confirmed via curl against dev server. Full AI flow pending a real `GROQ_API_KEY`.