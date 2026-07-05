import type { Metadata } from "next";
import MundialHub from "@/components/mundial/MundialHub";
import { getDict } from "@/lib/i18n";
import { asLocale, SITE_URL } from "@/lib/site";
import { LOCALES, type Locale } from "@/lib/types";
import { currentPhase, liveMatches, todayMatches } from "@/lib/worldcup";

export const revalidate = 3600;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = asLocale((await params).lang);
  const dict = getDict(lang);
  return {
    title: dict.meta.mundialTitle,
    description: dict.meta.mundialDesc,
    alternates: {
      canonical: `/${lang}/mundial`,
      languages: { es: "/es/mundial", en: "/en/mundial", "x-default": "/es/mundial" },
    },
    openGraph: { title: dict.meta.mundialTitle, description: dict.meta.mundialDesc, url: `/${lang}/mundial` },
  };
}

function Chip({ label, value, live = false }: { label: string; value: string; live?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-faint">{label}</dt>
      <dd className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-ink">
        {live && <span className="live-dot" aria-hidden />}
        {value}
      </dd>
    </div>
  );
}

export default async function MundialPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = asLocale((await params).lang) as Locale;
  const dict = getDict(lang);

  const now = new Date();
  const phase = currentPhase(now);
  const today = todayMatches(now);
  const live = liveMatches(now);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: lang === "es" ? "Copa Mundial de la FIFA 2026" : "FIFA World Cup 2026",
    sport: "Soccer",
    startDate: "2026-06-11",
    endDate: "2026-07-19",
    eventStatus: "https://schema.org/EventScheduled",
    location: [
      { "@type": "Country", name: "México" },
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "Canada" },
    ],
    url: `${SITE_URL}/${lang}/mundial`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="mundial-glow border-b border-line-soft">
        <div className="container-page flex flex-col gap-8 py-10 sm:py-14 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="kicker flex items-center gap-2">
              <span aria-hidden>🏆</span>
              {dict.mundial.kicker}
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              {dict.mundial.title}
            </h1>
          </div>
          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            <Chip label={dict.mundial.phase} value={lang === "es" ? phase.labelEs : phase.labelEn} />
            <Chip
              label={dict.mundial.today}
              value={today.length > 0 ? `${today.length} ${dict.mundial.matches}` : dict.mundial.none}
            />
            <Chip
              label={dict.mundial.liveNow}
              value={live.length > 0 ? `${live.length} ${dict.mundial.matches}` : dict.mundial.none}
              live={live.length > 0}
            />
          </dl>
        </div>
      </section>

      <div className="container-page py-8 sm:py-10">
        <MundialHub lang={lang} currentPhaseId={phase.id} />
      </div>
    </>
  );
}
