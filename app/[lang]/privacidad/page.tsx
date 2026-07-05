import type { Metadata } from "next";
import LegalLayout, { type LegalSection } from "@/components/LegalLayout";
import { asLocale, CONTACT_EMAIL, SITE_NAME } from "@/lib/site";
import type { Locale } from "@/lib/types";

interface LegalContent {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const CONTENT: Record<Locale, LegalContent> = {
  es: {
    title: "Política de privacidad",
    updated: "Última actualización: julio de 2026",
    intro: `${SITE_NAME} es un agregador de noticias que no requiere registro ni cuenta de usuario. Recopilamos la mínima información posible para operar el sitio. Esta política explica qué datos se tratan, con qué finalidad y qué derechos tenés.`,
    sections: [
      {
        heading: "1. Responsable",
        paragraphs: [
          `El responsable del tratamiento de los datos es el equipo editorial de ${SITE_NAME}. Para cualquier consulta relacionada con esta política podés escribir a ${CONTACT_EMAIL}.`,
        ],
      },
      {
        heading: "2. Qué datos tratamos",
        bullets: [
          "Datos técnicos que todo servidor web registra automáticamente al servir una página: dirección IP, tipo de navegador, páginas visitadas y fecha/hora. Se usan con fines de seguridad, prevención de abuso y estadísticas agregadas.",
          "Tu dirección de correo, únicamente si te suscribís voluntariamente al boletín.",
          "No pedimos nombre, ubicación ni ningún otro dato personal para usar el sitio.",
        ],
      },
      {
        heading: "3. Finalidad y base legal",
        bullets: [
          "Operar y proteger el sitio (interés legítimo).",
          "Enviarte el boletín si te suscribiste (consentimiento, revocable en cualquier momento desde el propio correo).",
          "Mostrar publicidad, si está activa (consentimiento, gestionado según la sección siguiente).",
        ],
      },
      {
        heading: "4. Publicidad y terceros",
        paragraphs: [
          `${SITE_NAME} puede mostrar anuncios servidos por terceros (por ejemplo, Google AdSense). Esos proveedores pueden usar cookies e identificadores para medir audiencia y personalizar anuncios según tus visitas a este y otros sitios.`,
          "Podés desactivar la personalización de anuncios de Google en adssettings.google.com y conocer más opciones en aboutads.info. Nuestra política de cookies detalla cómo gestionarlas.",
        ],
      },
      {
        heading: "5. Enlaces a medios externos",
        paragraphs: [
          "Los titulares e imágenes pertenecen a sus medios originales y cada artículo enlaza a la fuente. Al visitar esos sitios aplican sus propias políticas de privacidad, sobre las que no tenemos control.",
        ],
      },
      {
        heading: "6. Conservación y seguridad",
        paragraphs: [
          "Los registros técnicos se conservan el tiempo mínimo que exige la operación y seguridad del servicio. El correo del boletín se conserva hasta que cancelás la suscripción. El sitio se sirve exclusivamente por HTTPS.",
        ],
      },
      {
        heading: "7. Tus derechos",
        paragraphs: [
          `Podés ejercer tus derechos de acceso, rectificación, supresión y oposición escribiendo a ${CONTACT_EMAIL}. Respondemos dentro de los plazos legales aplicables.`,
        ],
      },
      {
        heading: "8. Cambios a esta política",
        paragraphs: [
          "Si esta política cambia, publicaremos la versión actualizada en esta misma página con su nueva fecha de actualización.",
        ],
      },
    ],
  },
  en: {
    title: "Privacy policy",
    updated: "Last updated: July 2026",
    intro: `${SITE_NAME} is a news aggregator that requires no registration or user account. We collect as little information as possible to run the site. This policy explains what data is processed, why, and what your rights are.`,
    sections: [
      {
        heading: "1. Controller",
        paragraphs: [
          `The data controller is the ${SITE_NAME} editorial team. For any question related to this policy you can write to ${CONTACT_EMAIL}.`,
        ],
      },
      {
        heading: "2. What data we process",
        bullets: [
          "Technical data every web server logs automatically when serving a page: IP address, browser type, pages visited and date/time. It is used for security, abuse prevention and aggregate statistics.",
          "Your email address, only if you voluntarily subscribe to the newsletter.",
          "We do not ask for your name, location or any other personal data to use the site.",
        ],
      },
      {
        heading: "3. Purpose and legal basis",
        bullets: [
          "Operating and protecting the site (legitimate interest).",
          "Sending you the newsletter if you subscribed (consent, revocable at any time from the email itself).",
          "Showing advertising, when enabled (consent, managed as described in the next section).",
        ],
      },
      {
        heading: "4. Advertising and third parties",
        paragraphs: [
          `${SITE_NAME} may display ads served by third parties (for example, Google AdSense). Those providers may use cookies and identifiers to measure audiences and personalize ads based on your visits to this and other sites.`,
          "You can disable Google ad personalization at adssettings.google.com and find more options at aboutads.info. Our cookie policy explains how to manage cookies.",
        ],
      },
      {
        heading: "5. Links to external outlets",
        paragraphs: [
          "Headlines and images belong to their original outlets and every article links to the source. When you visit those sites, their own privacy policies apply, over which we have no control.",
        ],
      },
      {
        heading: "6. Retention and security",
        paragraphs: [
          "Technical logs are kept for the minimum time required to operate and secure the service. Newsletter emails are kept until you unsubscribe. The site is served exclusively over HTTPS.",
        ],
      },
      {
        heading: "7. Your rights",
        paragraphs: [
          `You can exercise your rights of access, rectification, erasure and objection by writing to ${CONTACT_EMAIL}. We reply within the applicable legal deadlines.`,
        ],
      },
      {
        heading: "8. Changes to this policy",
        paragraphs: [
          "If this policy changes, we will publish the updated version on this page with a new revision date.",
        ],
      },
    ],
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
      canonical: `/${lang}/privacidad`,
      languages: { es: "/es/privacidad", en: "/en/privacidad", "x-default": "/es/privacidad" },
    },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLocale((await params).lang);
  const content = CONTENT[lang];
  return (
    <LegalLayout
      title={content.title}
      updated={content.updated}
      intro={content.intro}
      sections={content.sections}
    />
  );
}
