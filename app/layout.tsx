import "./globals.css";

/**
 * Root layout.
 *
 * The `<html>` / `<body>` tags live in `app/[locale]/layout.tsx` because the
 * `lang` attribute must reflect the active locale. This layout is a
 * pass-through so Next.js still has a root and so that `not-found.tsx` and
 * similar files outside the locale segment can render.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
