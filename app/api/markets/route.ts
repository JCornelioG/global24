import { NextResponse } from "next/server";
import { getMarketQuotes } from "@/lib/markets";

export const revalidate = 300;

export async function GET() {
  const quotes = await getMarketQuotes();
  return NextResponse.json({ quotes });
}
