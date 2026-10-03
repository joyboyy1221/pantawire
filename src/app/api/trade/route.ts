import { NextResponse } from "next/server";

const PANTA_BASE = "https://live-api.panta.market/api/v1";
const API_KEY = process.env.PANTA_API_KEY || "";

// POST /api/trade — Quote + Build a primary buy
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet, marketId, side, amountUsdc, action } = body;

    if (!API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Step 1: Quote
    if (action === "quote") {
      const res = await fetch(`${PANTA_BASE}/primaryorderquote/`, {
        method: "POST",
        headers: {
          "X-Api-Key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet,
          marketId,
          side,
          amountUsdc: String(amountUsdc),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ error: data.error || data.detail || "Quote failed", raw: data }, { status: res.status });
      }
      return NextResponse.json(data);
    }

    // Step 2: Build transaction from quote
    if (action === "build") {
      const { quoteId, maxSlippageBps } = body;
      const res = await fetch(`${PANTA_BASE}/primaryorderbuild/`, {
        method: "POST",
        headers: {
          "X-Api-Key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteId,
          wallet,
          maxSlippageBps: maxSlippageBps || 300,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ error: data.error || data.detail || "Build failed", raw: data }, { status: res.status });
      }
      return NextResponse.json(data);
    }

    // Step 3: Submit signature after wallet signs
    if (action === "submit") {
      const { orderId, signature } = body;
      const res = await fetch(`${PANTA_BASE}/primaryordersubmit/`, {
        method: "POST",
        headers: {
          "X-Api-Key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, signature }),
      });
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ error: data.error || data.detail || "Submit failed", raw: data }, { status: res.status });
      }
      return NextResponse.json(data);
    }

    // Step 4: Verify order status
    if (action === "verify") {
      const { orderId, signature } = body;
      const res = await fetch(`${PANTA_BASE}/primaryorderverify/`, {
        method: "POST",
        headers: {
          "X-Api-Key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, signature }),
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}