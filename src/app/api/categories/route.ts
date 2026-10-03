import { NextResponse } from "next/server";
import { fetchCategories } from "@/services/panta";

export async function GET() {
  const apiKey = process.env.PANTA_API_KEY;
  const categories = await fetchCategories(apiKey);
  return NextResponse.json({ categories });
}
