import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { routing } from "@/lib/i18n/routing";
import { cn } from "@/lib/cn";

// Latin typeface — used for English content and numeric UI.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("name"),
      template: `%s — ${t("name")}`,
    },
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ko: "/ko",
        en: "/en",
        "x-default": "/ko",
      },
    },
    openGraph: {
      title: t("name"),
      description: t("description"),
      type: "website",
      locale: locale === "ko" ? "ko_KR" : "en_US",
      siteName: t("name"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  // Pretendard-compatible system stack prioritises Korean glyphs without
  // adding a webfont dependency that would block first render. Next step can
  // swap in `next/font/local` + Pretendard if desired.
  const koreanStack =
    "Pretendard, 'Pretendard Variable', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Nanum Gothic', sans-serif";
  const latinStack =
    "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  return (
    <html
      lang={locale}
      className={cn(geistSans.variable, "h-full antialiased")}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-bg text-ink"
        style={
          {
            "--font-sans":
              locale === "ko"
                ? `${koreanStack}, ${latinStack}`
                : `${latinStack}, ${koreanStack}`,
            "--font-display":
              locale === "ko"
                ? `${koreanStack}`
                : `${latinStack}, ${koreanStack}`,
          } as React.CSSProperties
        }
      >
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-ink focus:shadow"
          >
            {/* Localised at runtime by the Header component too */}
          </a>
          <Header />
          <main id="main" className="flex flex-1 flex-col">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
