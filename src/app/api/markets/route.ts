import { NextResponse } from "next/server";
import { fetchMarkets } from "@/services/panta";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const limit = Number(searchParams.get("limit") || "50");
  const apiKey = process.env.PANTA_API_KEY;

  const markets = await fetchMarkets({ category, limit, apiKey });
  return NextResponse.json({ markets });
}
