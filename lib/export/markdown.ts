import type { ProjectPlan } from "@/lib/validators";

export function planToMarkdown(plan: ProjectPlan): string {
  const lines: string[] = [];
  lines.push(`# ${plan.title}`);
  lines.push("");
  lines.push(plan.summary);
  lines.push("");
  lines.push(`**Timeline:** ${plan.timeline.totalWeeks} weeks · **Effort:** ${plan.effort.personDays} person-days · **Team:** ${plan.effort.teamSize}`);
  lines.push("");

  lines.push("## Goals");
  lines.push("");
  for (const g of plan.goals) lines.push(`- ${g}`);
  lines.push("");

  lines.push("## Requirements");
  lines.push("");
  lines.push("### Functional");
  lines.push("");
  lines.push("| ID | Title | Priority | Description |");
  lines.push("|---|---|---|---|");
  for (const r of plan.requirements.functional) {
    lines.push(`| ${r.id} | ${r.title} | ${r.priority} | ${r.description.replace(/\|/g, "\\|")} |`);
  }
  lines.push("");
  lines.push("### Non-functional");
  lines.push("");
  lines.push("| ID | Title | Priority | Description |");
  lines.push("|---|---|---|---|");
  for (const r of plan.requirements.nonFunctional) {
    lines.push(`| ${r.id} | ${r.title} | ${r.priority} | ${r.description.replace(/\|/g, "\\|")} |`);
  }
  lines.push("");

  lines.push("## Tech stack");
  lines.push("");
  for (const t of plan.techStack) {
    lines.push(`- **${t.layer}** — ${t.choice}: ${t.rationale}`);
  }
  lines.push("");

  lines.push("## Timeline & milestones");
  lines.push("");
  lines.push(`Total: **${plan.timeline.totalWeeks} weeks**`);
  lines.push("");
  lines.push("### Phases");
  lines.push("");
  for (const p of plan.timeline.phases) {
    lines.push(`- **${p.name}** (${p.weeks}w) — ${p.focus}`);
  }
  lines.push("");
  lines.push("### Milestones");
  lines.push("");
  for (const m of plan.milestones) {
    lines.push(`- **${m.name}** (${m.durationWeeks}w)`);
    for (const d of m.deliverables) lines.push(`  - ${d}`);
  }
  lines.push("");

  lines.push("## Effort");
  lines.push("");
  lines.push(`- Person-days: ${plan.effort.personDays}`);
  lines.push(`- Team size: ${plan.effort.teamSize}`);
  lines.push(`- Notes: ${plan.effort.notes}`);
  lines.push("");

  lines.push("## Risks");
  lines.push("");
  for (const r of plan.risks) {
    lines.push(`- **[${r.severity}] ${r.risk}** — ${r.mitigation}`);
  }
  lines.push("");

  lines.push("## Recommendations");
  lines.push("");
  for (const r of plan.recommendations) lines.push(`- ${r}`);
  lines.push("");

  lines.push("## Next steps");
  lines.push("");
  plan.nextSteps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  lines.push("");

  return lines.join("\n");
}