const BASE_URL = "https://zei-world.com";
const MIN_DELAY_MS = 500;
const TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

let lastRequestTime = 0;
let pending: Promise<void> = Promise.resolve();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface FetchOptions {
  xhr?: boolean;
}

async function doFetch(url: string, options: FetchOptions): Promise<string> {
  const headers: Record<string, string> = {
    "Accept-Language": "fr-FR",
    "User-Agent": "Mozilla/5.0 (compatible; ZeiWorldMCP/1.0)",
  };
  if (options.xhr) {
    headers["X-Requested-With"] = "XMLHttpRequest";
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      return await response.text();
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        await delay(1000 * Math.pow(2, attempt));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Unreachable");
}

export async function fetchPage(
  path: string,
  options: FetchOptions = {}
): Promise<string> {
  const url = `${BASE_URL}${path}`;

  // Queue requests to enforce rate limit
  const execute = pending.then(async () => {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < MIN_DELAY_MS) {
      await delay(MIN_DELAY_MS - elapsed);
    }
    lastRequestTime = Date.now();
    return doFetch(url, options);
  });

  // Chain next request after this one
  pending = execute.then(
    () => {},
    () => {}
  );

  return execute;
}
