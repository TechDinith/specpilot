"use client";

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Download, FileText } from "lucide-react";
import type { ProjectPlan } from "@/lib/validators";
import { planToMarkdown } from "@/lib/export/markdown";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#111" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  subtitle: { fontSize: 10, color: "#555", marginBottom: 12 },
  h2: { fontSize: 13, fontWeight: "bold", marginTop: 14, marginBottom: 4, color: "#222" },
  h3: { fontSize: 11, fontWeight: "bold", marginTop: 8, marginBottom: 2 },
  p: { marginBottom: 6, lineHeight: 1.4 },
  bullet: { marginBottom: 3, paddingLeft: 10 },
  row: { flexDirection: "row", marginBottom: 2 },
  label: { fontWeight: "bold", width: 90 },
  value: { flex: 1 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ccc", paddingBottom: 2, marginBottom: 2 },
  tableRow: { flexDirection: "row", marginBottom: 2 },
  cell: { flex: 1, fontSize: 9 },
});

function PdfReport({ plan }: { plan: ProjectPlan }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{plan.title}</Text>
        <Text style={styles.subtitle}>{plan.summary}</Text>
        <Text style={styles.subtitle}>
          Timeline: {plan.timeline.totalWeeks} weeks · Effort: {plan.effort.personDays} person-days · Team: {plan.effort.teamSize}
        </Text>

        <Text style={styles.h2}>Goals</Text>
        {plan.goals.map((g, i) => (
          <Text key={i} style={styles.bullet}>• {g}</Text>
        ))}

        <Text style={styles.h2}>Functional requirements</Text>
        {plan.requirements.functional.map((r) => (
          <View key={r.id} style={{ marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>
              {r.title} <Text style={{ color: "#888", fontSize: 9 }}>({r.priority})</Text>
            </Text>
            <Text style={styles.p}>{r.description}</Text>
          </View>
        ))}

        <Text style={styles.h2}>Non-functional requirements</Text>
        {plan.requirements.nonFunctional.map((r) => (
          <View key={r.id} style={{ marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>
              {r.title} <Text style={{ color: "#888", fontSize: 9 }}>({r.priority})</Text>
            </Text>
            <Text style={styles.p}>{r.description}</Text>
          </View>
        ))}

        <Text style={styles.h2}>Tech stack</Text>
        {plan.techStack.map((t, i) => (
          <View key={i} style={{ marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>{t.layer}: {t.choice}</Text>
            <Text style={styles.p}>{t.rationale}</Text>
          </View>
        ))}

        <Text style={styles.h2}>Timeline & milestones</Text>
        <Text style={styles.p}>Total: {plan.timeline.totalWeeks} weeks</Text>
        {plan.timeline.phases.map((p, i) => (
          <Text key={i} style={styles.bullet}>• {p.name} ({p.weeks}w) — {p.focus}</Text>
        ))}
        {plan.milestones.map((m, i) => (
          <View key={i} style={{ marginTop: 4, marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>{m.name} ({m.durationWeeks}w)</Text>
            {m.deliverables.map((d, j) => (
              <Text key={j} style={styles.bullet}>  • {d}</Text>
            ))}
          </View>
        ))}

        <Text style={styles.h2}>Effort</Text>
        <Text style={styles.p}>Person-days: {plan.effort.personDays} · Team: {plan.effort.teamSize}</Text>
        <Text style={styles.p}>{plan.effort.notes}</Text>

        <Text style={styles.h2}>Risks</Text>
        {plan.risks.map((r, i) => (
          <View key={i} style={{ marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>[{r.severity}] {r.risk}</Text>
            <Text style={styles.p}>{r.mitigation}</Text>
          </View>
        ))}

        <Text style={styles.h2}>Recommendations</Text>
        {plan.recommendations.map((r, i) => (
          <Text key={i} style={styles.bullet}>• {r}</Text>
        ))}

        <Text style={styles.h2}>Next steps</Text>
        {plan.nextSteps.map((s, i) => (
          <Text key={i} style={styles.bullet}>{i + 1}. {s}</Text>
        ))}
      </Page>
    </Document>
  );
}

export function ExportButtons({ plan, title }: { plan: ProjectPlan; title: string }) {
  function downloadMarkdown() {
    const md = planToMarkdown(plan);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(title)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={downloadMarkdown}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
      >
        <FileText className="size-4" /> Markdown
      </button>
      <PDFDownloadLink
        document={<PdfReport plan={plan} />}
        fileName={`${slugify(title)}.pdf`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
      >
        {({ loading }) => (
          <>
            <Download className="size-4" />
            {loading ? "Preparing PDF…" : "PDF"}
          </>
        )}
      </PDFDownloadLink>
    </div>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "specpilot-plan";
}