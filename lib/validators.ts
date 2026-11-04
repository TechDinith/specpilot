import { z } from "zod";

// Single source of truth for the AI output shape.
// Used by: prompt (describe), API (validate), DB (persist), UI (render).

export const RequirementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(["must", "should", "could", "wont"]),
});

export const TechStackItemSchema = z.object({
  layer: z.string(), // e.g. "Frontend", "Backend", "Database"
  choice: z.string(), // e.g. "Next.js 16"
  rationale: z.string(),
});

export const MilestoneSchema = z.object({
  name: z.string(),
  durationWeeks: z.number().min(0),
  deliverables: z.array(z.string()),
});

export const RiskSchema = z.object({
  risk: z.string(),
  mitigation: z.string(),
  severity: z.enum(["low", "medium", "high"]),
});

export const ProjectPlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  goals: z.array(z.string()).min(1),
  requirements: z.object({
    functional: z.array(RequirementSchema),
    nonFunctional: z.array(RequirementSchema),
  }),
  techStack: z.array(TechStackItemSchema),
  milestones: z.array(MilestoneSchema).min(1),
  timeline: z.object({
    totalWeeks: z.number().min(1),
    phases: z.array(
      z.object({
        name: z.string(),
        weeks: z.number().min(0),
        focus: z.string(),
      }),
    ),
  }),
  effort: z.object({
    personDays: z.number().min(0),
    teamSize: z.number().min(1),
    notes: z.string(),
  }),
  risks: z.array(RiskSchema),
  recommendations: z.array(z.string()).min(1),
  nextSteps: z.array(z.string()).min(1),
});

export type ProjectPlan = z.infer<typeof ProjectPlanSchema>;
export type Requirement = z.infer<typeof RequirementSchema>;
export type TechStackItem = z.infer<typeof TechStackItemSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;
export type Risk = z.infer<typeof RiskSchema>;

// Input validation for the analyze endpoint.
export const AnalyzeInputSchema = z.object({
  idea: z.string().min(10, "Idea must be at least 10 characters").max(4000, "Idea too long"),
  // Optional extracted document text (already parsed client-side or server-side).
  documentText: z.string().max(8000).optional(),
  constraints: z.string().max(1000).optional(),
});

export type AnalyzeInput = z.infer<typeof AnalyzeInputSchema>;