"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { ProjectPlan } from "@/lib/validators";
import { siteConfig } from "@/config/site";
import { ReportView } from "@/components/report-view";
import { Button } from "@/components/ui/button";

type Status = "idle" | "loading" | "success" | "error";

export default function AnalyzePage() {
  const [idea, setIdea] = useState("");
  const [constraints, setConstraints] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<ProjectPlan | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (idea.trim().length < 10) {
      setError("Please describe your idea in at least 10 characters.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError(null);
    setPlan(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: idea.trim(),
          constraints: constraints.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }
      setPlan(data.plan as ProjectPlan);
      setProvider(data.provider ?? null);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analyze an idea</h1>
        <p className="mt-2 text-muted-foreground">
          Describe your project idea. {siteConfig.name} will turn it into a concrete
          plan — requirements, tech stack, milestones, timeline, and risks.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="idea" className="mb-1.5 block text-sm font-medium">
            Project idea
          </label>
          <textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g. A multi-tenant task board with real-time updates and CSV export…"
            rows={6}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={status === "loading"}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {idea.length}/4000 characters
          </p>
        </div>

        <div>
          <label htmlFor="constraints" className="mb-1.5 block text-sm font-medium">
            Constraints (optional)
          </label>
          <input
            id="constraints"
            type="text"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="e.g. Budget: $0, team of 2, must use Postgres"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={status === "loading"}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={status === "loading"} className="gap-2">
            {status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                <Sparkles className="size-4" /> Generate plan
              </>
            )}
          </Button>
          {status === "loading" && (
            <span className="text-sm text-muted-foreground">
              This can take 10–30 seconds.
            </span>
          )}
        </div>
      </form>

      {status === "error" && error && (
        <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {status === "success" && plan && (
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Generated{provider ? ` via ${provider}` : ""}.
            </p>
          </div>
          <ReportView plan={plan} />
        </div>
      )}
    </div>
  );
}