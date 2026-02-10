import { z } from "zod";
import { fetchCompaniesByActivity } from "../scraper/companies.js";

export const listCompaniesSchema = z.object({
  activitySlug: z.string().describe("Slug of the activity (from list_activities)"),
  page: z.number().int().min(1).default(1).describe("Page number (default: 1)"),
});

export async function handleListCompanies(args: z.infer<typeof listCompaniesSchema>) {
  const result = await fetchCompaniesByActivity(args.activitySlug, args.page);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            activitySlug: args.activitySlug,
            page: args.page,
            companies: result.companies,
            count: result.companies.length,
            unscoredCompanies: result.unscoredCompanies,
            unscoredCount: result.unscoredCompanies.length,
            hasNextPage: result.hasNextPage,
          },
          null,
          2
        ),
      },
    ],
  };
}
