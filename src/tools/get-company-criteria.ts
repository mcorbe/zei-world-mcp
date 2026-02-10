import { z } from "zod";
import { CategoryEnum } from "../types.js";
import { fetchCriteria } from "../scraper/criteria.js";

export const getCompanyCriteriaSchema = z.object({
  companyId: z.number().int().positive().describe("Company pro ID"),
  category: CategoryEnum.describe("ESG category: Environnement, Social, or Gouvernance"),
});

export async function handleGetCompanyCriteria(args: z.infer<typeof getCompanyCriteriaSchema>) {
  const result = await fetchCriteria(args.companyId, args.category);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
