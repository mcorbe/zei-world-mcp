import * as cheerio from "cheerio";
import { fetchPage } from "../fetcher.js";
import { TTLCache, TTL } from "../cache.js";
import type { CompanyListEntry } from "../types.js";

const companiesCache = new TTLCache<{ companies: CompanyListEntry[]; unscoredCompanies: string[]; hasNextPage: boolean }>();
const brandsCache = new TTLCache<CompanyListEntry[]>();

export async function fetchCompaniesByActivity(
  activitySlug: string,
  page: number = 1
): Promise<{ companies: CompanyListEntry[]; unscoredCompanies: string[]; hasNextPage: boolean }> {
  const cacheKey = `${activitySlug}:${page}`;
  const cached = companiesCache.get(cacheKey);
  if (cached) return cached;

  const html = await fetchPage(`/ranking/activity/${activitySlug}?page=${page}`);
  const $ = cheerio.load(html);
  const companies: CompanyListEntry[] = [];
  const unscoredCompanies: string[] = [];

  $("tr.ranking-row").each((_, el) => {
    const row = $(el);
    const name = row.find(".ranking-row__title").text().trim();
    if (!name) return;

    const link = row.find('a.ranking-row__link[href^="/pro/"]').attr("href") ?? "";
    const match = link.match(/\/pro\/(\d+)/);
    if (match) {
      companies.push({ name, proId: parseInt(match[1], 10) });
    } else {
      unscoredCompanies.push(name);
    }
  });

  // Detect pagination: check for page links beyond current page
  let hasNextPage = false;
  $('a.page-element__item[href*="page="]').each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const pageMatch = href.match(/page=(\d+)/);
    if (pageMatch) {
      const linkedPage = parseInt(pageMatch[1], 10);
      if (linkedPage > page) {
        hasNextPage = true;
      }
    }
  });

  const result = { companies, unscoredCompanies, hasNextPage };
  companiesCache.set(cacheKey, result, TTL.COMPANIES);
  return result;
}

export async function fetchBrandIndex(): Promise<CompanyListEntry[]> {
  const cached = brandsCache.get("all");
  if (cached) return cached;

  const html = await fetchPage("/ranking/brands");
  const $ = cheerio.load(html);
  const brands: CompanyListEntry[] = [];

  $('a.nav__item[href^="/pro/"]').each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const match = href.match(/\/pro\/(\d+)/);
    const name = $(el).text().trim();
    if (name && match) {
      brands.push({ name, proId: parseInt(match[1], 10) });
    }
  });

  brandsCache.set("all", brands, TTL.BRANDS);
  return brands;
}
