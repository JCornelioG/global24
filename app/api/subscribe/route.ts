import { NextResponse, type NextRequest } from "next/server";
import { subscribeEmail, type SubscribeOutcome } from "@/lib/newsletter";
import { asLocale } from "@/lib/site";

const STATUS_BY_OUTCOME: Record<SubscribeOutcome, number> = {
  ok: 200,
  already: 200,
  invalid: 400,
  not_configured: 503,
  error: 502,
};

export async function POST(request: NextRequest) {
  let email = "";
  let lang = "es";
  try {
    const body = (await request.json()) as { email?: unknown; lang?: unknown };
    email = typeof body.email === "string" ? body.email : "";
    lang = asLocale(typeof body.lang === "string" ? body.lang : "es");
  } catch {
    return NextResponse.json({ outcome: "invalid" }, { status: 400 });
  }

  const result = await subscribeEmail(email, asLocale(lang));
  return NextResponse.json(result, { status: STATUS_BY_OUTCOME[result.outcome] });
}
