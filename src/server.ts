import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { listSectorsSchema, handleListSectors } from "./tools/list-sectors.js";
import { listActivitiesSchema, handleListActivities } from "./tools/list-activities.js";
import { listCompaniesSchema, handleListCompanies } from "./tools/list-companies.js";
import { searchCompanySchema, handleSearchCompany } from "./tools/search-company.js";
import { getCompanyProfileSchema, handleGetCompanyProfile } from "./tools/get-company-profile.js";
import { getCompanyCriteriaSchema, handleGetCompanyCriteria } from "./tools/get-company-criteria.js";
import { compareCompaniesSchema, handleCompareCompanies } from "./tools/compare-companies.js";
import { getActivityRankingSchema, handleGetActivityRanking } from "./tools/get-activity-ranking.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "zei-world",
    version: "1.0.0",
  });

  server.tool(
    "list_sectors",
    "List all ESG/CSR sectors available on Zei World. Returns sector names and slugs.",
    listSectorsSchema.shape,
    handleListSectors
  );

  server.tool(
    "list_activities",
    "List activities (sub-categories) within a given sector. Requires a sector slug from list_sectors.",
    listActivitiesSchema.shape,
    handleListActivities
  );

  server.tool(
    "list_companies_by_activity",
    "List companies ranked within a specific activity. Supports pagination. Returns company names and IDs. Also includes unscored companies (listed on the site but without an ESG profile yet).",
    listCompaniesSchema.shape,
    handleListCompanies
  );

  server.tool(
    "search_company",
    "Search for a company by name across all brands on Zei World. Returns matching companies with their IDs.",
    searchCompanySchema.shape,
    handleSearchCompany
  );

  server.tool(
    "get_company_profile",
    "Get a company's ESG profile including E/S/G scores, classifications, sector, activity, and verification date.",
    getCompanyProfileSchema.shape,
    handleGetCompanyProfile
  );

  server.tool(
    "get_company_criteria",
    "Get detailed evaluation criteria for a company in a specific ESG category (Environnement, Social, or Gouvernance). Returns criterion names, coefficients, and scores.",
    getCompanyCriteriaSchema.shape,
    handleGetCompanyCriteria
  );

  server.tool(
    "compare_companies",
    "Compare 2-5 companies side by side. Returns ESG scores, classifications, and metadata for each company.",
    compareCompaniesSchema.shape,
    handleCompareCompanies
  );

  server.tool(
    "get_activity_ranking",
    "Get the ranking of all companies within the same activity as the specified company. Optionally filter by ESG category.",
    getActivityRankingSchema.shape,
    handleGetActivityRanking
  );

  return server;
}
