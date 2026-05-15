"use client";

import { tokens } from "@/lib/tokens";

/**
 * Replaces the entire document when the root layout itself throws.
 * Must contain its own html/body because it swaps the layout.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
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
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <p
            data-tone="ink-mute"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: tokens.colors.inkMute,
            }}
          >
            500
          </p>
          <h1
            style={{
              marginTop: "1rem",
              fontSize: "2rem",
              lineHeight: 1.1,
              fontWeight: 600,
            }}
          >
            잠시 문제가 발생했어요 / Something went wrong
          </h1>
          <button
            type="button"
            onClick={reset}
            data-tone="accent"
            style={{
              marginTop: "1.5rem",
              borderRadius: "9999px",
              background: tokens.colors.accent,
              color: tokens.colors.accentInk,
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: 0,
              cursor: "pointer",
            }}
          >
            다시 시도 / Retry
          </button>
        </div>
      </body>
    </html>
  );
}
