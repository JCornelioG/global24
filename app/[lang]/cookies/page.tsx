import type { Metadata } from "next";
import LegalLayout, { type LegalSection } from "@/components/LegalLayout";
import { asLocale, SITE_NAME } from "@/lib/site";
import type { Locale } from "@/lib/types";

interface LegalContent {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const CONTENT: Record<Locale, LegalContent> = {
  es: {
    title: "Política de cookies",
    updated: "Última actualización: julio de 2026",
    intro:
      "Las cookies son pequeños archivos que un sitio guarda en tu navegador para recordar información entre visitas. Acá te contamos cuáles usa este sitio y cómo controlarlas.",
    sections: [
      {
        heading: "1. Cookies propias",
        paragraphs: [
          `${SITE_NAME} no requiere inicio de sesión y, por defecto, no instala cookies propias de seguimiento ni de analítica. Leer noticias acá no deja rastros propios en tu navegador.`,
        ],
      },
      {
        heading: "2. Cookies de terceros (publicidad)",
        paragraphs: [
          "Si el sitio muestra anuncios de terceros (por ejemplo, Google AdSense), esos proveedores pueden instalar cookies para medir la audiencia de los anuncios y personalizarlos según tu navegación en este y otros sitios.",
          "Podés desactivar la personalización de anuncios de Google en adssettings.google.com, y gestionar proveedores adicionales en aboutads.info o youronlinechoices.eu.",
        ],
      },
      {
        heading: "3. Cómo gestionar o eliminar cookies",
        paragraphs: [
          "Todos los navegadores permiten ver, bloquear y borrar cookies desde su configuración de privacidad. Bloquear las cookies de terceros no afecta el funcionamiento de este sitio.",
        ],
        bullets: [
          "Chrome: Configuración → Privacidad y seguridad → Cookies de terceros.",
          "Firefox: Ajustes → Privacidad y seguridad → Cookies y datos del sitio.",
          "Safari: Preferencias → Privacidad.",
          "Edge: Configuración → Cookies y permisos del sitio.",
        ],
      },
      {
        heading: "4. Cambios a esta política",
        paragraphs: [
          "Si incorporamos nuevas cookies (por ejemplo, al activar analítica o nuevos formatos de publicidad), actualizaremos esta página con el detalle y su finalidad.",
        ],
      },
    ],
  },
  en: {
    title: "Cookie policy",
    updated: "Last updated: July 2026",
    intro:
      "Cookies are small files a website stores in your browser to remember information between visits. Here is what this site uses and how you can control it.",
    sections: [
      {
        heading: "1. First-party cookies",
        paragraphs: [
          `${SITE_NAME} requires no login and, by default, sets no first-party tracking or analytics cookies. Reading news here leaves no first-party traces in your browser.`,
        ],
      },
      {
        heading: "2. Third-party cookies (advertising)",
        paragraphs: [
          "If the site displays third-party ads (for example, Google AdSense), those providers may set cookies to measure ad audiences and personalize ads based on your browsing on this and other sites.",
          "You can disable Google ad personalization at adssettings.google.com, and manage additional vendors at aboutads.info or youronlinechoices.eu.",
        ],
      },
      {
        heading: "3. How to manage or delete cookies",
        paragraphs: [
          "Every browser lets you view, block and delete cookies from its privacy settings. Blocking third-party cookies does not affect how this site works.",
        ],
        bullets: [
          "Chrome: Settings → Privacy and security → Third-party cookies.",
          "Firefox: Settings → Privacy & Security → Cookies and Site Data.",
          "Safari: Preferences → Privacy.",
          "Edge: Settings → Cookies and site permissions.",
        ],
      },
      {
        heading: "4. Changes to this policy",
        paragraphs: [
          "If we add new cookies (for example, when enabling analytics or new ad formats), we will update this page with the details and their purpose.",
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
      canonical: `/${lang}/cookies`,
      languages: { es: "/es/cookies", en: "/en/cookies", "x-default": "/es/cookies" },
    },
  };
}

export default async function CookiesPage({ params }: { params: Promise<{ lang: string }> }) {
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
