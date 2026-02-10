import { z } from "zod";
import { fetchCompanyProfile } from "../scraper/profile.js";

export const getCompanyProfileSchema = z.object({
  companyId: z.number().int().positive().describe("Company pro ID (from search or listing)"),
});

export async function handleGetCompanyProfile(args: z.infer<typeof getCompanyProfileSchema>) {
  const profile = await fetchCompanyProfile(args.companyId);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(profile, null, 2),
      },
    ],
  };
}
