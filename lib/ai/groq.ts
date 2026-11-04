const GROQ_BASE = "https://api.groq.com/openai/v1";
const TIMEOUT_MS = 60_000;

function apiKey(): string {
  const k = process.env.GROQ_API_KEY;
  if (!k) throw new Error("GROQ_API_KEY is not set");
  return k;
}

async function listModels(): Promise<string[]> {
  const res = await fetch(`${GROQ_BASE}/models`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { data?: { id: string }[] };
  return (data.data ?? []).map((m) => m.id);
}

const EXCLUDED = [
  "guard", "whisper", "tts", "embed", "moderation", "prompt-guard",
  "audio", "vision-preview", "orpheus", "canopylabs", "playai", "canary",
];

const PREFERRED = [
  // Free-tier chat models (see Groq rate-limits docs)
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3-8b",
  "qwen/qwen3-32b",
  // Paid/legacy (may not be available on free tier)
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

function pickModel(available: string[]): string {
  const chat = available.filter(
    (id) => !EXCLUDED.some((x) => id.toLowerCase().includes(x)),
  );
  const pool = chat.length ? chat : available;

  // Prefer exact known-good chat models first.
  for (const p of PREFERRED) {
    const m = pool.find((id) => id.toLowerCase() === p.toLowerCase() || id.toLowerCase().includes(p.toLowerCase()));
    if (m) return m;
  }
  // Then keyword preference.
  const prefs = ["gpt-oss-120b", "gpt-oss-20b", "gpt-oss", "qwen", "versatile", "70b", "instant", "8b", "mixtral", "gemma", "llama", "deepseek"];
  for (const p of prefs) {
    const m = pool.find((id) => id.toLowerCase().includes(p));
    if (m) return m;
  }
  return pool[0] ?? "";
}

async function chat(model: string, system: string, user: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey()}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(`Groq error ${res.status}: ${text.slice(0, 300)}`);
      // attach status for caller decisions
      (err as Error & { status?: number }).status = res.status;
      throw err;
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Groq returned empty content");
    return content;
  } finally {
    clearTimeout(timer);
  }
}

export async function callGroq(system: string, user: string): Promise<string> {
  const configured = process.env.GROQ_MODEL;
  const candidates: string[] = [];

  if (configured) candidates.push(configured);

  // Try configured/default first.
  const initial = configured || "openai/gpt-oss-120b";
  try {
    return await chat(initial, system, user);
  } catch (e) {
    const status = (e as Error & { status?: number }).status;
    const msg = e instanceof Error ? e.message : String(e);
    // If model not found (or no access), discover available models and retry.
    if (status === 404 || /model_not_found|does not exist/i.test(msg)) {
      let available = await listModels();
      if (!available.length) {
        available = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];
      }
      const discovered = pickModel(available);
      if (discovered && discovered !== initial) {
        try {
          return await chat(discovered, system, user);
        } catch (e2) {
          throw new Error(
            `Groq: configured model "${initial}" not found; tried "${discovered}" but failed: ${
              e2 instanceof Error ? e2.message : String(e2)
            }`,
          );
        }
      }
    }
    throw e;
  }
}