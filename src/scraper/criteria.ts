import * as cheerio from "cheerio";
import { fetchPage } from "../fetcher.js";
import { TTLCache, TTL } from "../cache.js";
import type { EvaluationCriterion, Category, CompanyCriteria } from "../types.js";
import { CATEGORY_LOAD_MAP } from "../types.js";

const criteriaCache = new TTLCache<CompanyCriteria>();

export async function fetchCriteria(
  companyId: number,
  category: Category
): Promise<CompanyCriteria> {
  const cacheKey = `${companyId}:${category}`;
  const cached = criteriaCache.get(cacheKey);
  if (cached) return cached;

  const loadNum = CATEGORY_LOAD_MAP[category];
  const html = await fetchPage(`/pro/${companyId}/load/${loadNum}`, { xhr: true });
  const $ = cheerio.load(html);

  const criteria: EvaluationCriterion[] = [];

  $("article.invest-widget2").each((_, el) => {
    const article = $(el);

    const name = article.find("h1.invest-widget2__title").text().trim();

    // Coefficient
    const coeffText = article.find(".invest-widget2__coeff").text().trim();
    const coeffMatch = coeffText.match(/(\d+)/);
    const coefficient = coeffMatch ? parseInt(coeffMatch[1], 10) : 0;

    // Score percentage from data-percentage attribute
    const progressEl = article.find("[data-percentage]");
    const percentStr = progressEl.attr("data-percentage");
    const scorePercent = percentStr ? parseFloat(percentStr) : null;

    // Indicator URL from data-modal-ajax
    const indicatorUrl = article.attr("data-modal-ajax") ?? null;

    if (name) {
      criteria.push({ name, coefficient, scorePercent, indicatorUrl });
    }
  });

  const result: CompanyCriteria = {
    companyId,
    category,
    criteria,
  };

  criteriaCache.set(cacheKey, result, TTL.CRITERIA);
  return result;
}
