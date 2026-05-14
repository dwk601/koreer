import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
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

// Korean-first typeface — Pretendard Variable covers the full weight range
// (45–920) in a single woff2 file (~2 MB uncompressed, served with swap).
const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
  style: "normal",
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

  return (
    <html
      lang={locale}
      className={cn(geistSans.variable, pretendard.variable, "h-full antialiased")}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-bg text-ink"
        style={
          {
            "--font-sans":
              locale === "ko"
                ? `var(--font-pretendard), -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif, var(--font-geist-sans)`
                : `var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif, var(--font-pretendard)`,
            "--font-display":
              locale === "ko"
                ? `var(--font-pretendard), -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`
                : `var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif, var(--font-pretendard)`,
          } as React.CSSProperties
        }
      >
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-ink focus:shadow"
          >
            {(await getTranslations("nav"))("skipToContent")}
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
