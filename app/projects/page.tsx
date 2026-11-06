import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let user: { id: string; email?: string | null } | null = null;
  if (process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET) {
    try {
      const { data: session } = await auth.getSession();
      user = session?.user ?? null;
    } catch {
      user = null;
    }
  }

  const rows =
    db && user
      ? await db
          .select()
          .from(projects)
          .where(eq(projects.userId, user.id))
          .orderBy(desc(projects.createdAt))
      : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved projects</h1>
          <p className="mt-2 text-muted-foreground">
            Your saved analyses and shared plans.
          </p>
        </div>
        <Link href="/analyze" className={cn(buttonVariants())}>
          New analysis
        </Link>
      </div>

      {!user && (
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <Link href="/auth/sign-in" className="underline">
            Sign in
          </Link>{" "}
          to see your saved projects.
        </div>
      )}

      {user && !db && (
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          Database not configured. Set <code>DATABASE_URL</code> to enable saving.
        </div>
      )}

      {user && db && rows.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No saved projects yet. Analyze an idea and save it to see it here.
        </div>
      )}

      <div className="space-y-3">
        {rows.map((p) => (
          <Link
            key={p.id}
            href={`/p/${p.id}`}
            className="block rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition hover:bg-muted/40"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">{p.title}</h2>
              <span className="text-xs text-muted-foreground">
                {new Date(p.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {p.idea}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}