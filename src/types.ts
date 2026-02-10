import { z } from "zod";

// --- Zod Schemas ---

export const SectorSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export const ActivitySchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export const CompanyListEntrySchema = z.object({
  name: z.string(),
  proId: z.number(),
});

export const CategoryEnum = z.enum(["Environnement", "Social", "Gouvernance"]);

export const CompanyProfileSchema = z.object({
  name: z.string(),
  proId: z.number(),
  sector: z.string().optional(),
  activity: z.string().optional(),
  verificationDate: z.string().optional(),
  scores: z.object({
    environnement: z.number().nullable(),
    social: z.number().nullable(),
    gouvernance: z.number().nullable(),
  }),
  classifications: z.object({
    environnement: z.string().nullable(),
    social: z.string().nullable(),
    gouvernance: z.string().nullable(),
  }),
  categoryScores: z.array(z.record(z.unknown())).optional(),
});

export const EvaluationCriterionSchema = z.object({
  name: z.string(),
  coefficient: z.number(),
  scorePercent: z.number().nullable(),
  indicatorUrl: z.string().nullable(),
});

export const CompanyCriteriaSchema = z.object({
  companyId: z.number(),
  category: CategoryEnum,
  criteria: z.array(EvaluationCriterionSchema),
});

export const ActivityRankingEntrySchema = z.object({
  name: z.string(),
  proId: z.number(),
  score: z.number().nullable(),
});

// --- TypeScript Types ---

export type Sector = z.infer<typeof SectorSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type CompanyListEntry = z.infer<typeof CompanyListEntrySchema>;
export type Category = z.infer<typeof CategoryEnum>;
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;
export type EvaluationCriterion = z.infer<typeof EvaluationCriterionSchema>;
export type CompanyCriteria = z.infer<typeof CompanyCriteriaSchema>;
export type ActivityRankingEntry = z.infer<typeof ActivityRankingEntrySchema>;

// Category name to load number mapping
export const CATEGORY_LOAD_MAP: Record<Category, number> = {
  Environnement: 1,
  Social: 2,
  Gouvernance: 3,
};
