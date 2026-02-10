import * as cheerio from "cheerio";
import { fetchPage } from "../fetcher.js";
import { TTLCache, TTL } from "../cache.js";
import type { Sector, Activity } from "../types.js";

const sectorsCache = new TTLCache<Sector[]>();
const activitiesCache = new TTLCache<Activity[]>();

export async function fetchSectors(): Promise<Sector[]> {
  const cached = sectorsCache.get("all");
  if (cached) return cached;

  const html = await fetchPage("/ranking/sectors");
  const $ = cheerio.load(html);
  const sectors: Sector[] = [];

  $('a[href^="/ranking/sector/"]').each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const slug = href.replace("/ranking/sector/", "").replace(/\/$/, "");
    const name = $(el).text().trim();
    if (slug && name) {
      sectors.push({ name, slug });
    }
  });

  sectorsCache.set("all", sectors, TTL.SECTORS);
  return sectors;
}

export async function fetchActivities(sectorSlug: string): Promise<Activity[]> {
  const cached = activitiesCache.get(sectorSlug);
  if (cached) return cached;

  const html = await fetchPage(`/ranking/sector/${sectorSlug}`);
  const $ = cheerio.load(html);
  const activities: Activity[] = [];

  $('a[href^="/ranking/activity/"]').each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const slug = href.replace("/ranking/activity/", "").replace(/\/$/, "");
    const name = $(el).text().trim();
    if (slug && name) {
      activities.push({ name, slug });
    }
  });

  activitiesCache.set(sectorSlug, activities, TTL.ACTIVITIES);
  return activities;
}
