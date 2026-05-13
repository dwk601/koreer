import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="ko">
      <body
        style={{
          fontFamily:
            "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
          background: "#fafaf7",
          color: "#141311",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          margin: 0,
        }}
      >
        <div style={{ maxWidth: "28rem" }}>
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#6f6d67",
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
            style={{
              marginTop: "1rem",
              color: "#3b3a37",
            }}
          >
            삭제되었거나 이동된 페이지일 수 있습니다.
          </p>
          <Link
            href="/ko"
            style={{
              marginTop: "1.5rem",
              display: "inline-block",
              borderRadius: "9999px",
              background: "#1c2b2b",
              color: "#f6f5ef",
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
