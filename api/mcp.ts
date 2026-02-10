import type { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "../src/server.js";

export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse
) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-session-id");
  res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");

  // Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Stateless mode: only POST is supported
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed. Only POST is supported in stateless mode." }));
    return;
  }

  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
    enableJsonResponse: true,      // JSON instead of SSE (Vercel doesn't support true streaming)
  });

  await server.connect(transport);

  // Clean up on response close
  res.on("close", () => {
    transport.close();
    server.close();
  });

  // req.body is already parsed by Vercel; pass it as the 3rd argument
  // so the transport doesn't try to re-read the consumed stream
  await transport.handleRequest(req, res, req.body as Record<string, unknown>);
}
