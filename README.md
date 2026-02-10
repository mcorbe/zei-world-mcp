# zei-world-mcp

An [MCP](https://modelcontextprotocol.io/) server that exposes ESG/CSR data from [Zei World](https://zei.world/) to LLMs. Browse sectors, search companies, compare ESG scores, and explore detailed evaluation criteria — all through natural language.

## Tools

| Tool | Description |
|------|-------------|
| `list_sectors` | List all ESG/CSR sectors |
| `list_activities` | List activities (sub-categories) within a sector |
| `list_companies_by_activity` | List ranked companies in an activity (paginated) |
| `search_company` | Search for a company by name |
| `get_company_profile` | Get a company's ESG profile (E/S/G scores, classifications) |
| `get_company_criteria` | Get detailed evaluation criteria for a company in a category |
| `compare_companies` | Compare 2–5 companies side by side |
| `get_activity_ranking` | Get the full ranking within an activity, optionally by category |

## Quick start

```bash
npm install
npm run build
```

### Stdio (local MCP client)

```bash
npm start
```

Use with any MCP-compatible client (e.g. Claude Desktop). Add to your client config:

```json
{
  "mcpServers": {
    "zei-world": {
      "command": "node",
      "args": ["/absolute/path/to/zei-world-mcp/build/index.js"]
    }
  }
}
```

### HTTP (local testing)

```bash
npm run start:http
```

Server listens on `http://localhost:3000/mcp`. Stateless mode — every POST gets a fresh server instance.

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"0.1"}}}'
```

### Docker

```bash
npm run build
docker build -t zei-world-mcp .
docker run -p 3000:3000 zei-world-mcp
```

### Vercel

The project includes a serverless handler at `api/mcp.ts` with a `vercel.json` config. Deploy by connecting the repo to Vercel — the endpoint will be available at `/mcp`.

## Project structure

```
src/
  index.ts          # Stdio entry point
  server.ts         # createServer() factory (shared by stdio + HTTP)
  local-http.ts     # Local HTTP server for testing
  types.ts          # Zod schemas and TypeScript types
  cache.ts          # In-memory cache
  fetcher.ts        # HTTP fetcher for zei.world
  tools/            # One file per MCP tool
  scraper/          # HTML scrapers for zei.world pages
api/
  mcp.ts            # Vercel serverless handler
```

## Disclaimer

This server works by scraping the public [zei.world](https://zei.world/) website. It relies heavily on the current HTML structure of the site and may break without warning if Zei World changes their pages. This project is not affiliated with or endorsed by Zei World.

## License

MIT
