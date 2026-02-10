import { z } from "zod";
import { fetchSectors } from "../scraper/sectors.js";

export const listSectorsSchema = z.object({});

export async function handleListSectors() {
  const sectors = await fetchSectors();
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ sectors, count: sectors.length }, null, 2),
      },
    ],
  };
}
