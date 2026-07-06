import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import "../globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MarketTickerBar from "@/components/ticker/MarketTickerBar";
import { getDict } from "@/lib/i18n";
import { ADSENSE_CLIENT, SITE_NAME, SITE_URL } from "@/lib/site";
import { LOCALES, type Locale } from "@/lib/types";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

function asLocale(raw: string): Locale {
  return (LOCALES as readonly string[]).includes(raw) ? (raw as Locale) : "es";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = asLocale((await params).lang);
  const dict = getDict(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: dict.meta.homeTitle, template: `%s · ${SITE_NAME}` },
    description: dict.meta.homeDesc,
    applicationName: SITE_NAME,
    alternates: {
      canonical: `/${lang}`,
      languages: { es: "/es", en: "/en", "x-default": "/es" },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: lang === "es" ? "es_ES" : "en_US",
      url: `/${lang}`,
      title: dict.meta.homeTitle,
      description: dict.meta.homeDesc,
    },
    twitter: { card: "summary_large_image", title: dict.meta.homeTitle, description: dict.meta.homeDesc },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    // Verificación de propiedad: pegá el código en las env vars y redeploy.
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      other: process.env.BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
        : {},
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0906",
  width: "device-width",
  initialScale: 1,
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const raw = (await params).lang;
  if (!(LOCALES as readonly string[]).includes(raw)) notFound();
  const lang = raw as Locale;

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
  };
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: lang,
  };

  return (
    <html lang={lang} data-scroll-behavior="smooth" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen bg-bg font-body text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([orgJsonLd, siteJsonLd]) }}
        />
        {ADSENSE_CLIENT && (
          <Script
            id="adsense-loader"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          />
        )}
        <MarketTickerBar lang={lang} />
        <Header lang={lang} />
        <main id="contenido">{children}</main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
