import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

// Image metadata
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Koreer";

/**
 * Dynamic Open Graph image. Generated per-locale at request time via Next.js
 * `next/og`. Keeps the brand mark, a display tagline in the active locale,
 * and a confident accent dot in the corner.
 */
export default async function OpengraphImage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "app" });

  const isKo = locale === "ko";
  const title = t("name");
  const tagline = t("tagline");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fafaf7",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          fontFamily:
            "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
          color: "#141311",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 999,
              background: "#1c2b2b",
            }}
          />
          <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.3 }}>
            {title}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 32,
              color: "#6f6d67",
              letterSpacing: isKo ? -0.2 : -0.5,
              textTransform: "uppercase",
            }}
          >
            {isKo ? "지금 열린 기회" : "Fresh jobs"}
          </div>
          <div
            style={{
              fontSize: isKo ? 84 : 92,
              lineHeight: 1.02,
              fontWeight: 600,
              letterSpacing: isKo ? -1 : -2.4,
              maxWidth: 1000,
            }}
          >
            {tagline}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
