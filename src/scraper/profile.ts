import * as cheerio from "cheerio";
import { fetchPage } from "../fetcher.js";
import { TTLCache, TTL } from "../cache.js";
import type { CompanyProfile } from "../types.js";

const profileCache = new TTLCache<CompanyProfile>();

export async function fetchCompanyProfile(companyId: number): Promise<CompanyProfile> {
  const cached = profileCache.get(String(companyId));
  if (cached) return cached;

  const html = await fetchPage(`/pro/${companyId}`);
  const $ = cheerio.load(html);

  // Company name from breadcrumb last item or h1
  const name =
    $("h1.title").first().text().trim() ||
    $(".breadcrumb li").last().text().trim() ||
    `Company ${companyId}`;

  // Sector and activity from breadcrumb links
  let sector: string | undefined;
  let activity: string | undefined;
  $(".breadcrumb a").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const text = $(el).text().trim();
    if (href.includes("/ranking/sector/")) {
      sector = text;
    } else if (href.includes("/ranking/activity/")) {
      activity = text;
    }
  });

  // Verification date
  let verificationDate: string | undefined;
  const bodyText = $("body").text();
  const dateMatch = bodyText.match(/Profil vérifié le\s+(\d{2}\/\d{2}\/\d{4})/);
  if (dateMatch) {
    verificationDate = dateMatch[1];
  }

  // E/S/G scores from span.score__value
  const scoreValues: (number | null)[] = [];
  $("span.score__value").each((_, el) => {
    const text = $(el).text().trim();
    const numMatch = text.match(/(\d+)/);
    scoreValues.push(numMatch ? parseInt(numMatch[1], 10) : null);
  });

  // Classifications from score-bar__notation
  const classifications: (string | null)[] = [];
  $(".score-bar__notation").each((_, el) => {
    const text = $(el).text().trim();
    classifications.push(text || null);
  });

  // Extract react_data.categoryScores from script tags
  let categoryScores: Record<string, unknown>[] | undefined;
  $("script").each((_, el) => {
    const scriptContent = $(el).html() ?? "";
    const reactDataMatch = scriptContent.match(/window\.react_data\s*=\s*(\{[\s\S]*?\});/);
    if (reactDataMatch) {
      try {
        const reactData = JSON.parse(reactDataMatch[1]);
        if (reactData.categoryScores) {
          categoryScores = reactData.categoryScores;
        }
      } catch {
        // ignore parse errors
      }
    }
  });

  const profile: CompanyProfile = {
    name,
    proId: companyId,
    sector,
    activity,
    verificationDate,
    scores: {
      environnement: scoreValues[0] ?? null,
      social: scoreValues[1] ?? null,
      gouvernance: scoreValues[2] ?? null,
    },
    classifications: {
      environnement: classifications[0] ?? null,
      social: classifications[1] ?? null,
      gouvernance: classifications[2] ?? null,
    },
    categoryScores,
  };

  profileCache.set(String(companyId), profile, TTL.PROFILE);
  return profile;
}
