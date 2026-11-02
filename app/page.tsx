import Link from "next/link";
import { ArrowRight, Sparkles, FileText, ListChecks, Clock, Shield } from "lucide-react";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: FileText,
    title: "From idea to spec",
    description:
      "Paste a prompt or upload a document. Get functional & non-functional requirements, scoped and structured.",
  },
  {
    icon: ListChecks,
    title: "Tech stack & milestones",
    description:
      "Concrete technology recommendations with rationale, plus milestones and deliverables for each phase.",
  },
  {
    icon: Clock,
    title: "Rough timeline & effort",
    description:
      "Phase-by-phase timeline in weeks and an effort estimate, so you can plan capacity and budget.",
  },
  {
    icon: Shield,
    title: "Risks & next steps",
    description:
      "Identified risks with mitigations and actionable next steps — not just a wall of text.",
  },
];

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5" />
          AI-powered project planning
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          Turn a rough idea into a{" "}
          <span className="text-primary">concrete project plan</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{siteConfig.description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/analyze"
            className={cn(buttonVariants({ size: "lg" }), "gap-2")}
          >
            Start analyzing <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/projects"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            View saved projects
          </Link>
        </div>
      </div>

      <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <f.icon className="size-4" />
            </div>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}