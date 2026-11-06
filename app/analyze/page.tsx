"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { ProjectPlan } from "@/lib/validators";
import { siteConfig } from "@/config/site";
import { ReportView } from "@/components/report-view";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

export default function AnalyzePage() {
  const [idea, setIdea] = useState("");
  const [constraints, setConstraints] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<ProjectPlan | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Upload failed (${res.status})`);
      setDocumentText(data.text);
      setFileName(data.filename);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setDocumentText("");
      setFileName(null);
    } finally {
      setUploading(false);
      // reset input so same file can be re-selected
      e.target.value = "";
    }
  }

  async function handleSave() {
    if (!plan) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: plan.title,
          idea: idea.trim(),
          constraints: constraints.trim() || undefined,
          documentText: documentText || undefined,
          plan,
          provider: provider ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Save failed (${res.status})`);
      setSavedId(data.project.id);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

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
    setSavedId(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: idea.trim(),
          constraints: constraints.trim() || undefined,
          documentText: documentText || undefined,
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

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Supporting document (optional)
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <label
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-muted"
            >
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md,.markdown"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading || status === "loading"}
              />
              {uploading ? "Uploading…" : "Choose file"}
            </label>
            {fileName && (
              <span className="text-sm text-muted-foreground">
                {fileName} ({documentText.length} chars extracted)
              </span>
            )}
            {fileName && (
              <button
                type="button"
                className="text-sm text-muted-foreground underline hover:text-foreground"
                onClick={() => {
                  setDocumentText("");
                  setFileName(null);
                }}
              >
                Remove
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF, DOCX, TXT, or Markdown — max 5 MB.
          </p>
          {uploadError && (
            <p className="mt-1 text-xs text-destructive">{uploadError}</p>
          )}
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Generated{provider ? ` via ${provider}` : ""}.
            </p>
            <div className="flex items-center gap-2">
              {savedId ? (
                <Link
                  href={`/p/${savedId}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  View shared link
                </Link>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save project"}
                </Button>
              )}
            </div>
          </div>
          {saveError && (
            <p className="mb-4 text-sm text-destructive">
              {saveError.includes("Unauthorized") ? (
                <>
                  Please{" "}
                  <Link href="/auth/sign-in" className="underline">
                    sign in
                  </Link>{" "}
                  to save projects.
                </>
              ) : (
                saveError
              )}
            </p>
          )}
          {savedId && (
            <p className="mb-4 text-sm text-muted-foreground">
              Saved. Shareable link:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                /p/{savedId}
              </code>
            </p>
          )}
          <ReportView plan={plan} />
        </div>
      )}
    </div>
  );
}