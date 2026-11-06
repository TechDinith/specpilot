"use client";

import dynamic from "next/dynamic";
import type { ProjectPlan } from "@/lib/validators";

const ExportButtons = dynamic(
  () => import("./export-buttons").then((m) => m.ExportButtons),
  { ssr: false, loading: () => null },
);

export function ExportButtonsLazy({ plan, title }: { plan: ProjectPlan; title: string }) {
  return <ExportButtons plan={plan} title={title} />;
}