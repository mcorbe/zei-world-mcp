import { z } from "zod";
import { fetchBrandIndex } from "../scraper/companies.js";
import type { CompanyListEntry } from "../types.js";

export const searchCompanySchema = z.object({
  query: z.string().min(1).describe("Search query (company name)"),
});

function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function handleSearchCompany(args: z.infer<typeof searchCompanySchema>) {
  const brands = await fetchBrandIndex();
  const query = normalize(args.query);

  // Score each brand for relevance
  const scored: { brand: CompanyListEntry; score: number }[] = [];

  for (const brand of brands) {
    const normalizedName = normalize(brand.name);
    if (normalizedName === query) {
      scored.push({ brand, score: 3 }); // exact match
    } else if (normalizedName.startsWith(query)) {
      scored.push({ brand, score: 2 }); // starts with
    } else if (normalizedName.includes(query)) {
      scored.push({ brand, score: 1 }); // contains
    }
  }

  // Sort by score desc, then name asc
  scored.sort((a, b) => b.score - a.score || a.brand.name.localeCompare(b.brand.name));

  const results = scored.map((s) => s.brand);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ query: args.query, results, count: results.length }, null, 2),
      },
    ],
  };
}
