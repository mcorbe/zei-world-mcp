# Zei World MCP Server — Product Requirements Document

## Overview

An MCP (Model Context Protocol) server that wraps Zei World's public pages (`zei-world.com`) so an LLM can answer natural-language ESG/CSR questions — from high-level ("List all sectors") down to granular criteria ("Who has the best 'score de produits alimentaires durables' in 'commerce alimentaire'?").

No API keys required — we scrape public HTML endpoints.

## Endpoints

| Endpoint | Header | Returns |
|----------|--------|---------|
| `GET /ranking/sectors` | — | HTML: 32 sector tiles with slugs |
| `GET /ranking/sector/{slug}` | — | HTML: activity subcategories |
| `GET /ranking/activity/{slug}?page=N` | — | HTML: paginated company list (name + `/pro/{id}`) |
| `GET /ranking/brands` | — | HTML: all brands alphabetically (name + `/pro/{id}`) |
| `GET /pro/{id}` | — | HTML: profile with `window.react_data.scores`, `categoryScores`, sector, activity |
| `GET /pro/{id}/load/{1\|2\|3}` | `X-Requested-With: XMLHttpRequest` | HTML: all evaluation criteria (name, coef, score %, indicator URL) |
| `GET /pro/{id}/indicator/{indicator_id}` | `X-Requested-With: XMLHttpRequest` | HTML: individual criterion detail modal |

## Data Model

### Sector
- `name: string` — Display name
- `slug: string` — URL slug

### Activity
- `name: string` — Display name
- `slug: string` — URL slug
- `sectorSlug: string` — Parent sector slug

### CompanyListEntry
- `name: string` — Company name
- `proId: number | null` — Profile ID (from `/pro/{id}` URL)

### CompanyProfile
- `id: number`
- `name: string`
- `sector: string | null`
- `activity: string | null`
- `environmentScore: number | null` — 0-100%
- `socialScore: number | null` — 0-100%
- `governanceScore: number | null` — 0-100%
- `classification: string | null` — e.g. "À encourager"
- `certifications: string[]`
- `verificationDate: string | null`

### EvaluationCriterion
- `name: string` — e.g. "Score de produits alimentaires durables"
- `coefficient: number` — e.g. 120
- `scorePercent: number | null` — 0-100, null if not submitted
- `indicatorUrl: string` — e.g. "/pro/4559/indicator/233291"

### CompanyCriteria
- `companyId: number`
- `companyName: string`
- `category: "Environnement" | "Social" | "Gouvernance"`
- `criteria: EvaluationCriterion[]`

### ActivityRankingEntry
- `id: number` — org ID
- `name: string` — org name
- `scores: Record<string, number | null>` — { Environnement: 48, Social: 56, ... }

## 8 MCP Tools

| # | Tool | Input | Description |
|---|------|-------|-------------|
| 1 | `list_sectors` | _(none)_ | Returns 32 sector names + slugs |
| 2 | `list_activities` | `sectorSlug` | Returns activity subcategories for a sector |
| 3 | `list_companies_by_activity` | `activitySlug, page?` | Paginated company list (name + ID) |
| 4 | `search_company` | `query` | Fuzzy name search against brand index |
| 5 | `get_company_profile` | `companyId` | Top-level ESG scores, sector, activity, classification |
| 6 | `get_company_criteria` | `companyId, category` | All evaluation criteria for a company in a given ESG category |
| 7 | `compare_companies` | `companyIds[]` (2-5) | Side-by-side top-level ESG comparison |
| 8 | `get_activity_ranking` | `companyId, category?` | Ranking of ALL companies in same activity by ESG scores |

## Caching (in-memory TTL)

| Data | TTL | Rationale |
|------|-----|-----------|
| Sectors | 24h | Rarely change |
| Activities | 24h | Rarely change |
| Brand index | 6h | Large, semi-static |
| Activity page | 1h | Companies may shift |
| Company profile | 30min | Scores update |
| Criteria | 30min | Scores update |
| Activity ranking | 30min | Derived from profile |

## Scraping Strategy

- Node.js built-in `fetch()` with:
  - 500ms minimum delay between requests (polite rate limiting)
  - 2 retries with exponential backoff (1s, 2s)
  - 15s timeout via `AbortSignal.timeout()`
  - `Accept-Language: fr-FR` header
  - Configurable `X-Requested-With: XMLHttpRequest` header for criteria endpoints
- HTML parsing via cheerio

## Acceptance Criteria

1. `npm run build` compiles without errors
2. All 8 tools callable via MCP Inspector
3. `list_sectors` returns ~32 sectors
4. `search_company({ query: "NOUS ANTIGASPI" })` finds ID 4559
5. `get_company_profile({ companyId: 4559 })` returns ESG scores
6. `get_company_criteria({ companyId: 4559, category: "Environnement" })` returns criteria with coefficients
7. `get_activity_ranking({ companyId: 4559 })` returns ranked company list
8. `compare_companies({ companyIds: [4, 1212] })` returns comparison table
