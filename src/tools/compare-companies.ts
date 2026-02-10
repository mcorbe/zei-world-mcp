import { z } from "zod";
import { fetchCompanyProfile } from "../scraper/profile.js";

export const compareCompaniesSchema = z.object({
  companyIds: z
    .array(z.number().int().positive())
    .min(2)
    .max(5)
    .describe("Array of 2-5 company pro IDs to compare"),
});

export async function handleCompareCompanies(args: z.infer<typeof compareCompaniesSchema>) {
  const profiles = await Promise.all(
    args.companyIds.map((id) => fetchCompanyProfile(id))
  );

  const comparison = profiles.map((p) => ({
    name: p.name,
    proId: p.proId,
    sector: p.sector,
    activity: p.activity,
    scores: p.scores,
    classifications: p.classifications,
    verificationDate: p.verificationDate,
  }));

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ companies: comparison, count: comparison.length }, null, 2),
      },
    ],
  };
}
