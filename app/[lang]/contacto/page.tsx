import type { Metadata } from "next";
import { asLocale, CONTACT_EMAIL, SITE_NAME } from "@/lib/site";
import type { Locale } from "@/lib/types";

interface ContactContent {
  title: string;
  intro: string;
  reasonsTitle: string;
  reasons: { label: string; detail: string }[];
  cta: string;
  note: string;
}

const CONTENT: Record<Locale, ContactContent> = {
  es: {
    title: "Contacto",
    intro: `¿Tenés una consulta, una corrección o una propuesta? El equipo de ${SITE_NAME} lee todos los mensajes.`,
    reasonsTitle: "Escribinos por",
    reasons: [
      { label: "Correcciones", detail: "Errores en titulares, síntesis o datos del Mundial." },
      {
        label: "Derechos de autor",
        detail:
          "Si sos un medio y preferís que tu contenido no aparezca agregado acá, lo retiramos a la brevedad.",
      },
      { label: "Publicidad y patrocinios", detail: "Espacios publicitarios y patrocinio de secciones." },
      { label: "Prensa y general", detail: "Cualquier otra consulta sobre el sitio." },
    ],
    cta: "Escribir un correo",
    note: "Respondemos generalmente dentro de las 48 horas hábiles.",
  },
  en: {
    title: "Contact",
    intro: `Got a question, a correction or a proposal? The ${SITE_NAME} team reads every message.`,
    reasonsTitle: "Write to us about",
    reasons: [
      { label: "Corrections", detail: "Errors in headlines, briefs or World Cup data." },
      {
        label: "Copyright",
        detail:
          "If you are an outlet and prefer your content not to be aggregated here, we will remove it promptly.",
      },
      { label: "Advertising & sponsorships", detail: "Ad placements and section sponsorships." },
      { label: "Press & general", detail: "Anything else about the site." },
    ],
    cta: "Send an email",
    note: "We usually reply within 48 business hours.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = asLocale((await params).lang);
  return {
    title: CONTENT[lang].title,
    description: CONTENT[lang].intro.slice(0, 160),
    alternates: {
      canonical: `/${lang}/contacto`,
      languages: { es: "/es/contacto", en: "/en/contacto", "x-default": "/es/contacto" },
    },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLocale((await params).lang);
  const content = CONTENT[lang];

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">{content.title}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">{content.intro}</p>

        <section className="mt-8 rounded-xl border border-line bg-panel p-6 sm:p-8">
          <h2 className="kicker">{content.reasonsTitle}</h2>
          <ul className="mt-5 flex flex-col gap-4">
            {content.reasons.map((reason) => (
              <li key={reason.label} className="flex gap-3">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <p className="text-[15px] leading-relaxed text-muted">
                  <span className="font-semibold text-ink">{reason.label}: </span>
                  {reason.detail}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-start gap-3">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="rounded-full bg-gold px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-black transition-colors hover:bg-gold-bright"
            >
              ✉️ {content.cta}
            </a>
            <p className="text-sm text-gold">{CONTACT_EMAIL}</p>
            <p className="text-xs text-faint">{content.note}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
