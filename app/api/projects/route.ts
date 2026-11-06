import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { auth } from "@/lib/auth/server";
import { desc, eq } from "drizzle-orm";
import { ProjectPlanSchema } from "@/lib/validators";

const CreateProjectSchema = z.object({
  title: z.string().min(1).max(200),
  idea: z.string().min(1).max(4000),
  constraints: z.string().max(1000).optional(),
  documentText: z.string().max(8000).optional(),
  plan: ProjectPlanSchema,
  provider: z.string().optional(),
});

export async function GET() {
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  let session: { user?: { id: string } } | null = null;
  if (process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET) {
    try {
      const r = await auth.getSession();
      session = r.data ?? null;
    } catch {
      session = null;
    }
  }
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, session.user.id))
    .orderBy(desc(projects.createdAt));

  return NextResponse.json({ projects: rows });
}

export async function POST(req: Request) {
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  let session2: { user?: { id: string } } | null = null;
  if (process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET) {
    try {
      const r = await auth.getSession();
      session2 = r.data ?? null;
    } catch {
      session2 = null;
    }
  }
  if (!session2?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: z.flattenError(parsed.error) },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const [created] = await db
    .insert(projects)
    .values({
      title: data.title,
      idea: data.idea,
      constraints: data.constraints,
      documentText: data.documentText,
      plan: data.plan,
      provider: data.provider,
      userId: session2!.user!.id,
    })
    .returning();

  return NextResponse.json({ project: created }, { status: 201 });
}