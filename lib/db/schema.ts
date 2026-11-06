import { pgTable, uuid, text, timestamp, jsonb, integer, primaryKey } from "drizzle-orm/pg-core";

export const usage = pgTable(
  "usage",
  {
    userId: text("user_id").notNull(),
    day: text("day").notNull(), // YYYY-MM-DD
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  title: text("title").notNull(),
  idea: text("idea").notNull(),
  constraints: text("constraints"),
  documentText: text("document_text"),
  plan: jsonb("plan").notNull(),
  provider: text("provider"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;