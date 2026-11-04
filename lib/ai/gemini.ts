const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const TIMEOUT_MS = 60_000;

function apiKey(): string {
  const k = process.env.GEMINI_API_KEY;
  if (!k) throw new Error("GEMINI_API_KEY is not set");
  return k;
}

async function listModels(): Promise<string[]> {
  const res = await fetch(
    `${GEMINI_BASE}/models?key=${encodeURIComponent(apiKey())}`,
  );
  if (!res.ok) return [];
  const data = (await res.json()) as {
    models?: { name: string; supportedGenerationMethods?: string[] }[];
  };
  return (data.models ?? [])
    .filter((m) =>
      (m.supportedGenerationMethods ?? []).includes("generateContent"),
    )
    .map((m) => m.name.replace(/^models\//, ""));
}

function pickModel(available: string[]): string {
  const prefs = ["flash", "pro"];
  for (const p of prefs) {
    const m = available.find((id) => id.toLowerCase().includes(p));
    if (m) return m;
  }
  return available[0] ?? "";
}

async function chat(
  model: string,
  system: string,
  user: string,
): Promise<string> {
  const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey())}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(
        `Gemini error ${res.status}: ${text.slice(0, 300)}`,
      );
      (err as Error & { status?: number }).status = res.status;
      throw err;
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error("Gemini returned empty content");
    return content;
  } finally {
    clearTimeout(timer);
  }
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function callGemini(
  system: string,
  user: string,
): Promise<string> {
  const configured = process.env.GEMINI_MODEL;
  const initial = configured || "gemini-3.5-flash-lite";

  // Attempt 1: configured/default model, with one retry on 503.
  try {
    return await chat(initial, system, user);
  } catch (e) {
    const status = (e as Error & { status?: number }).status;
    const msg = e instanceof Error ? e.message : String(e);

    // Retry once on high demand.
    if (status === 503) {
      await sleep(2000);
      try {
        return await chat(initial, system, user);
      } catch {
        // fall through to discovery
      }
    }

    // If model not found (or repeated failure), discover available models.
    if (
      status === 404 ||
      /not found|does not exist|no longer available/i.test(msg)
    ) {
      let available = await listModels();
      if (!available.length) {
        // Discovery failed; try known models.
        available = ["gemini-3.8-flash", "gemini-2.5-pro", "gemini-2.5-flash"];
      }
      const discovered = pickModel(available);
      if (discovered && discovered !== initial) {
        try {
          return await chat(discovered, system, user);
        } catch (e2) {
          throw new Error(
            `Gemini: configured model "${initial}" not found; tried "${discovered}" but failed: ${
              e2 instanceof Error ? e2.message : String(e2)
            }`,
          );
        }
      }
    }

    // If still failing on 503, try a discovered/known model as last resort.
    if (status === 503) {
      let available = await listModels();
      if (!available.length) {
        available = ["gemini-3.8-flash", "gemini-2.5-pro", "gemini-2.5-flash"];
      }
      const discovered = pickModel(available);
      if (discovered && discovered !== initial) {
        await sleep(1000);
        try {
          return await chat(discovered, system, user);
        } catch {
          throw e;
        }
      }
    }

    throw e;
  }
}
