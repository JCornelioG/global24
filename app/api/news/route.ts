import { NextResponse, type NextRequest } from "next/server";
import { getNewsByCategory, getTopNews } from "@/lib/news";
import { asLocale } from "@/lib/site";
import { CATEGORY_SLUGS, type CategorySlug } from "@/lib/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lang = asLocale(params.get("lang") ?? "es");
  const rawCategory = params.get("category");
  const limit = Math.min(Math.max(Number(params.get("limit")) || 20, 1), 50);

  if (rawCategory && !(CATEGORY_SLUGS as readonly string[]).includes(rawCategory)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }

  const articles = rawCategory
    ? await getNewsByCategory(lang, rawCategory as CategorySlug, limit)
    : await getTopNews(lang, limit);

  return NextResponse.json(
    { articles },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" } },
  );
}
