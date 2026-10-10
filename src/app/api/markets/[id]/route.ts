import { NextResponse } from "next/server";
import { fetchMarket } from "@/services/panta";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const apiKey = process.env.PANTA_API_KEY;
  const market = await fetchMarket(id, apiKey);

  if (!market) {
    return NextResponse.json({ error: "Market not found" }, { status: 404 });
  }

  return NextResponse.json({ market });
}
