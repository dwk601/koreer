import Link from "next/link";
import { tokens } from "@/lib/tokens";

export default function NotFound() {
  return (
    <html lang="ko">
      <body
        id="koreer-fallback"
        style={{
          fontFamily:
            "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
          background: tokens.colors.bg,
          color: tokens.colors.ink,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          margin: 0,
        }}
      >
        <style>{`
          @media (prefers-color-scheme: dark) {
            #koreer-fallback {
              background: #0c0b08;
              color: #f0ecdf;
            }
            #koreer-fallback [data-tone="ink-mute"] {
              color: #8b877b;
            }
            #koreer-fallback [data-tone="ink-soft"] {
              color: #d2cdbe;
            }
            #koreer-fallback [data-tone="accent"] {
              background: #f0ecdf;
              color: #0c0b08;
            }
          }
        `}</style>
        <div style={{ maxWidth: "28rem" }}>
          <p
            data-tone="ink-mute"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: tokens.colors.inkMute,
            }}
          >
            404
          </p>
          <h1
            style={{
              marginTop: "1rem",
              fontSize: "2.25rem",
              lineHeight: 1.1,
              fontWeight: 600,
            }}
          >
            페이지를 찾을 수 없습니다 / Page not found
          </h1>
          <p
            data-tone="ink-soft"
            style={{
              marginTop: "1rem",
              color: tokens.colors.inkSoft,
            }}
          >
            삭제되었거나 이동된 페이지일 수 있습니다.
          </p>
          <Link
            href="/ko"
            data-tone="accent"
            style={{
              marginTop: "1.5rem",
              display: "inline-block",
              borderRadius: "9999px",
              background: tokens.colors.accent,
              color: tokens.colors.accentInk,
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            홈으로 / Go home
          </Link>
        </div>
      </body>
    </html>
  );
}
