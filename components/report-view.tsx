import type { ProjectPlan } from "@/lib/validators";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const priorityVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  must: "destructive",
  should: "default",
  could: "secondary",
  wont: "outline",
};

const severityVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

export function ReportView({ plan }: { plan: ProjectPlan }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{plan.title}</h2>
        <p className="mt-2 text-muted-foreground">{plan.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">{plan.timeline.totalWeeks} weeks</Badge>
          <Badge variant="secondary">{plan.effort.personDays} person-days</Badge>
          <Badge variant="secondary">Team of {plan.effort.teamSize}</Badge>
        </div>
      </div>

      <Separator />

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {plan.goals.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Requirements */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Functional requirements</CardTitle>
            <CardDescription>{plan.requirements.functional.length} items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.requirements.functional.map((r) => (
              <div key={r.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{r.title}</p>
                  <Badge variant={priorityVariant[r.priority] ?? "outline"}>{r.priority}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Non-functional requirements</CardTitle>
            <CardDescription>{plan.requirements.nonFunctional.length} items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.requirements.nonFunctional.map((r) => (
              <div key={r.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{r.title}</p>
                  <Badge variant={priorityVariant[r.priority] ?? "outline"}>{r.priority}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Tech stack */}
      <Card>
        <CardHeader>
          <CardTitle>Tech stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {plan.techStack.map((t, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t.layer}
                </p>
                <p className="mt-1 font-semibold">{t.choice}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.rationale}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline + milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline &amp; milestones</CardTitle>
          <CardDescription>
            {plan.timeline.totalWeeks} weeks total · {plan.effort.notes}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {plan.timeline.phases.map((p, i) => (
              <Badge key={i} variant="outline">
                {p.name} · {p.weeks}w
              </Badge>
            ))}
          </div>
          <Separator />
          <div className="space-y-3">
            {plan.milestones.map((m, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{m.name}</p>
                  <Badge variant="secondary">{m.durationWeeks}w</Badge>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {m.deliverables.map((d, j) => (
                    <li key={j}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risks */}
      <Card>
        <CardHeader>
          <CardTitle>Risks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan.risks.map((r, i) => (
            <div key={i} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{r.risk}</p>
                <Badge variant={severityVariant[r.severity] ?? "outline"}>{r.severity}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{r.mitigation}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations + next steps */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {plan.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              {plan.nextSteps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}