import { NextResponse } from "next/server";
import { z } from "zod";
import { AnalyzeInputSchema } from "@/lib/validators";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompt";
import { callGroq } from "@/lib/ai/groq";
import { callGemini } from "@/lib/ai/gemini";
import { getRateLimiter } from "@/lib/rate-limit";
import { ProjectPlanSchema } from "@/lib/validators";

const MAX_BODY_BYTES = 50_000;

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }

  const ip = getClientIp(req);
  const limiter = getRateLimiter();
  const { success, remaining } = await limiter.limit(`ip:${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = AnalyzeInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: z.flattenError(parsed.error) },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const system = buildSystemPrompt();
  const user = buildUserPrompt(input);

  const errors: { provider: string; error: string }[] = [];
  let raw: string | null = null;
  let provider = "";

  // 1. Groq (primary)
  if (process.env.GROQ_API_KEY) {
    provider = "groq";
    try {
      raw = await callGroq(system, user);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[analyze] groq failed:", msg);
      errors.push({ provider: "groq", error: msg });
      raw = null;
    }
  } else {
    errors.push({ provider: "groq", error: "GROQ_API_KEY not set" });
  }

  // 2. Gemini (fallback)
  if (!raw && process.env.GEMINI_API_KEY) {
    provider = "gemini";
    try {
      raw = await callGemini(system, user);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[analyze] gemini failed:", msg);
      errors.push({ provider: "gemini", error: msg });
      raw = null;
    }
  } else if (!raw && !process.env.GEMINI_API_KEY) {
    errors.push({ provider: "gemini", error: "GEMINI_API_KEY not set" });
  }

  if (!raw) {
    return NextResponse.json(
      {
        error: "AI provider unavailable",
        details: errors,
      },
      { status: 503 },
    );
  }

  // Validate output; retry once on failure.
  let plan: unknown = null;
  let attempts = 0;
  while (attempts < 2 && plan === null) {
    attempts += 1;
    try {
      const json = JSON.parse(raw);
      const validated = ProjectPlanSchema.safeParse(json);
      if (validated.success) {
        plan = validated.data;
        break;
      }
      if (attempts < 2) {
        const correction = `${user}\n\nYour previous output failed validation: ${JSON.stringify(
          validated.error.issues.slice(0, 5),
        )}. Return corrected JSON only.`;
        if (provider === "groq") {
          raw = await callGroq(system, correction);
        } else {
          raw = await callGemini(system, correction);
        }
      }
    } catch {
      if (attempts < 2) {
        const correction = `${user}\n\nYour previous output was not valid JSON. Return valid JSON only.`;
        if (provider === "groq") {
          raw = await callGroq(system, correction);
        } else {
          raw = await callGemini(system, correction);
        }
      }
    }
  }

  if (!plan) {
    return NextResponse.json(
      { error: "AI returned invalid output after retry" },
      { status: 502 },
    );
  }

  return NextResponse.json({ plan, provider }, { status: 200 });
}