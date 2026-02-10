import { z } from "zod";
import { CategoryEnum } from "../types.js";
import type { Category, ActivityRankingEntry } from "../types.js";
import { fetchCompanyProfile } from "../scraper/profile.js";

export const getActivityRankingSchema = z.object({
  companyId: z
    .number()
    .int()
    .positive()
    .describe("Company pro ID (used to identify the activity)"),
  category: CategoryEnum.optional().describe(
    "ESG category to rank by. If omitted, ranks by average of all 3 scores."
  ),
});

export async function handleGetActivityRanking(
  args: z.infer<typeof getActivityRankingSchema>
) {
  const profile = await fetchCompanyProfile(args.companyId);

  if (!profile.categoryScores || profile.categoryScores.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              error: "No activity ranking data available for this company.",
              companyId: args.companyId,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  const scoreKey = args.category
    ? getScoreKey(args.category)
    : null;

  const ranking: ActivityRankingEntry[] = profile.categoryScores.map((entry: Record<string, unknown>) => {
    const name = (entry.name as string) ?? "Unknown";
    const proId = Number(entry.id ?? entry.proId ?? 0);

    let score: number | null;
    if (scoreKey) {
      score = parseScore(entry[scoreKey]);
    } else {
      // Average of all 3 scores
      const e = parseScore(entry.environnement ?? entry.environment);
      const s = parseScore(entry.social);
      const g = parseScore(entry.gouvernance ?? entry.governance);
      const validScores = [e, s, g].filter((v): v is number => v !== null);
      score = validScores.length > 0
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
        : null;
    }

    return { name, proId, score };
  });

  // Sort by score descending (nulls last)
  ranking.sort((a, b) => {
    if (a.score === null && b.score === null) return 0;
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    return b.score - a.score;
  });

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            activity: profile.activity,
            category: args.category ?? "overall",
            ranking,
            count: ranking.length,
          },
          null,
          2
        ),
      },
    ],
  };
}

function getScoreKey(category: Category): string {
  switch (category) {
    case "Environnement":
      return "environnement";
    case "Social":
      return "social";
    case "Gouvernance":
      return "gouvernance";
  }
}

function parseScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}
