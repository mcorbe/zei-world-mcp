import { z } from "zod";
import { fetchActivities } from "../scraper/sectors.js";

export const listActivitiesSchema = z.object({
  sectorSlug: z.string().describe("Slug of the sector (from list_sectors)"),
});

export async function handleListActivities(args: z.infer<typeof listActivitiesSchema>) {
  const activities = await fetchActivities(args.sectorSlug);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ sectorSlug: args.sectorSlug, activities, count: activities.length }, null, 2),
      },
    ],
  };
}
