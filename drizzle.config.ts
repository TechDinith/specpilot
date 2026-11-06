import { defineConfig } from "drizzle-kit";

// Load .env.local so DATABASE_URL is available when running drizzle-kit directly.
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local may not exist; fall back to process env.
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});