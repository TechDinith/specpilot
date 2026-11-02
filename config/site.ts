// Single source of truth for app identity.
// Rename the app by changing `name` here (and optionally the env override).
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "SpecPilot",
  shortName: "SP",
  description:
    "Turn a rough project idea into a concrete plan — requirements, tech stack, milestones, timeline, and risks — powered by AI.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  links: {
    github: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;