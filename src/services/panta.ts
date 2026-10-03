const PANTA_BASE = "https://live-api.panta.market/api/v1";

export interface PantaMarket {
  marketId: string;
  question: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  category?: string;
  phase: string;
  yesPrice?: number;
  noPrice?: number;
  volume?: number;
  createdAt: string;
  endTime?: string;
  status?: string;
  isReal: boolean;
  resolutionRule?: string;
}

function cleanQuestion(raw: string): string {
  // Remove corrupted unicode chars
  return raw.replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, "").replace(/\?+$/, "?").trim();
}

function mapMarketFromList(raw: any): { marketId: string; category: string; hasTitle: boolean } {
  return {
    marketId: raw.marketId || "",
    category: raw.category || "misc",
    hasTitle: !!(raw.title && raw.title.trim().length >= 5),
  };
}

function mapMarketFull(raw: any): PantaMarket {
  // Use question field (from detail) first, then title, then description
  const question = raw.question || raw.title || "";
  const cleaned = cleanQuestion(question);
  const resRule = raw.resolutionRule || "";

  const endTs = raw.endTime || raw.resolutionTime;
  const yp = parseFloat(raw.yesPrice || "0.5");
  const np = parseFloat(raw.noPrice || "0.5");

  return {
    marketId: raw.marketId || "",
    question: cleaned || "Untitled Market",
    description: raw.description || resRule.slice(0, 200) || "",
    imageUrl: raw.images?.[0] || "",
    images: raw.images || [],
    category: raw.category || "misc",
    phase: raw.phase || raw.status || "",
    yesPrice: yp > 1 ? yp / 1000000000 : yp,
    noPrice: np > 1 ? np / 1000000000 : np,
    volume: raw.totalVolumeUsdc ? parseFloat(raw.totalVolumeUsdc) : 0,
    createdAt: typeof raw.createdAt === "number" ? new Date(raw.createdAt * 1000).toISOString() : (raw.createdAt || new Date().toISOString()),
    endTime: endTs ? (typeof endTs === "number" ? new Date(endTs * 1000).toISOString() : endTs) : undefined,
    status: raw.status || raw.phase || "",
    isReal: true,
    resolutionRule: resRule,
  };
}

export const DEMO_MARKETS: PantaMarket[] = [];
export const DEMO_CATEGORIES = [
  { slug: "crypto", name: "Crypto" },
  { slug: "sports", name: "Sports" },
  { slug: "politics", name: "Politics" },
  { slug: "stocks", name: "Stocks" },
  { slug: "commodities", name: "Commodities" },
  { slug: "macroeconomics", name: "Macro" },
  { slug: "pop-culture", name: "Pop Culture" },
  { slug: "business", name: "Business" },
  { slug: "gaming", name: "Gaming" },
  { slug: "space-universe", name: "Space" },
  { slug: "world", name: "World" },
];

export async function fetchMarkets(params?: {
  category?: string;
  limit?: number;
  apiKey?: string;
}): Promise<PantaMarket[]> {
  if (!params?.apiKey) return [];
  try {
    // Step 1: Get market list (IDs)
    let allItems: any[] = [];
    let cursor: string | null = null;
    for (let page = 0; page < 10; page++) {
      const sp = new URLSearchParams();
      sp.set("limit", "100");
      if (params.category) sp.set("category", params.category);
      if (cursor) sp.set("cursor", cursor);
      const res = await fetch(`${PANTA_BASE}/markets/?${sp.toString()}`, {
        headers: { "X-Api-Key": params.apiKey, "Accept": "application/json" },
        next: { revalidate: 60 },
      });
      if (!res.ok) break;
      const data = await res.json();
      allItems = allItems.concat(data.items || []);
      if (!data.nextCursor) break;
      cursor = data.nextCursor;
    }

    // Step 2: Fetch full details for each market (has question + resolutionRule)
    const detailed = await Promise.allSettled(
      allItems.map(async (item) => {
        try {
          const res = await fetch(`${PANTA_BASE}/markets/${item.marketId}/`, {
            headers: { "X-Api-Key": params!.apiKey!, "Accept": "application/json" },
            next: { revalidate: 120 },
          });
          if (res.ok) {
            const data = await res.json();
            // Merge list data with detail data
            return { ...item, ...data };
          }
        } catch {}
        return item; // fallback to list data
      })
    );

    return detailed
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
      .map(r => mapMarketFull(r.value))
      .filter(m => m.question !== "Untitled Market" && m.question.length >= 5);
  } catch (e) {
    console.error("Panta API error:", e);
    return [];
  }
}

export async function fetchMarket(marketId: string, apiKey?: string): Promise<PantaMarket | null> {
  if (!apiKey) return null;
  try {
    const res = await fetch(`${PANTA_BASE}/markets/${marketId}/`, {
      headers: { "X-Api-Key": apiKey },
      next: { revalidate: 15 },
    });
    if (res.ok) return mapMarketFull(await res.json());
  } catch {}
  return null;
}

export async function fetchCategories(apiKey?: string) {
  return DEMO_CATEGORIES;
}