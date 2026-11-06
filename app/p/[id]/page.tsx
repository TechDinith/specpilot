import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ReportView } from "@/components/report-view";
import type { ProjectPlan } from "@/lib/validators";

export default async function SharedProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!db) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-bold">Database not configured</h1>
        <p className="mt-2 text-muted-foreground">
          This instance does not have a database connected.
        </p>
      </div>
    );
  }

  const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!row) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{row.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Shared project plan · {new Date(row.createdAt).toLocaleDateString()}
        </p>
      </div>
      <ReportView plan={row.plan as ProjectPlan} />
    </div>
  );
}