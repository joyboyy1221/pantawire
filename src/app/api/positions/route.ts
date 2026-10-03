import { NextResponse } from "next/server";

const PANTA_BASE = "https://live-api.panta.market/api/v1";
const API_KEY = process.env.PANTA_API_KEY || "";

// GET /api/positions?wallet=xxx — Fetch on-chain positions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }
    if (!API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Fetch positions from Panta
    const posRes = await fetch(`${PANTA_BASE}/positions/?wallet=${wallet}`, {
      headers: { "X-Api-Key": API_KEY },
    });
    if (!posRes.ok) {
      const err = await posRes.json().catch(() => ({}));
      return NextResponse.json({ error: err.error || "Failed to fetch positions", positions: [] }, { status: posRes.status });
    }
    const posData = await posRes.json();
    const positions = posData.positions || [];

    // Enrich with market details (question, prices) for each unique marketId
    const marketIds = [...new Set(positions.map((p: any) => p.marketId))];
    const marketCache: Record<string, any> = {};

    await Promise.allSettled(
      marketIds.map(async (id: any) => {
        try {
          const res = await fetch(`${PANTA_BASE}/markets/${id}/`, {
            headers: { "X-Api-Key": API_KEY },
          });
          if (res.ok) marketCache[id] = await res.json();
        } catch {}
      })
    );

    // Combine position data with market info
    const enriched = positions.map((pos: any) => {
      const market = marketCache[pos.marketId] || {};
      const yesPrice = parseFloat(market.yesPrice || "0.5");
      const noPrice = parseFloat(market.noPrice || "0.5");
      const price = pos.side === "yes" ? yesPrice : noPrice;
      const shares = parseFloat(pos.shares || "0");
      const estValue = pos.outcome
        ? (pos.side === pos.outcome ? shares : 0)
        : shares * (price > 1 ? price / 1000000000 : price);

      return {
        marketId: pos.marketId,
        question: market.question || market.title || "Unknown Market",
        category: pos.category || market.category || "",
        side: pos.side,
        shares: pos.shares,
        phase: pos.phase,
        claimable: pos.claimable,
        claimed: pos.claimed,
        outcome: pos.outcome,
        yesPrice: yesPrice > 1 ? yesPrice / 1000000000 : yesPrice,
        noPrice: noPrice > 1 ? noPrice / 1000000000 : noPrice,
        estValueUsdc: estValue,
      };
    });

    return NextResponse.json({ wallet, positions: enriched });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, positions: [] }, { status: 500 });
  }
}