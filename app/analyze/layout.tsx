import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Analyze a project idea",
  description:
    "Turn a rough project idea into a concrete plan: requirements, recommended tech stack, milestones, timeline, effort estimate, risks, and next steps — powered by AI.",
  alternates: { canonical: "/analyze" },
  openGraph: {
    title: `Analyze a project idea · ${siteConfig.name}`,
    description:
      "Generate a structured project plan from a prompt or uploaded document.",
    url: `${siteConfig.url}/analyze`,
  },
};

export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
  return children;
}