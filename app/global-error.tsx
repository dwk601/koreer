"use client";

/**
 * Replaces the entire document when the root layout itself throws.
 * Must contain its own html/body because it swaps the layout.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="ko">
      <body
        style={{
          fontFamily:
            "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
          background: "#faf9f5",
          color: "#16140f",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          margin: 0,
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#6f6c64",
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
            style={{
              marginTop: "1.5rem",
              borderRadius: "9999px",
              background: "#1a2a28",
              color: "#f6f5ef",
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
