import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";

// In Next.js 16 the file is `proxy.ts` (formerly `middleware.ts`).
// next-intl still exports `createMiddleware` — same function, new home.
export default createMiddleware(routing);

export const config = {
  // Match application paths while bypassing system routes and common files.
  // Keep dotted, non-file paths in the match: next-intl must redirect them so
  // they cannot reach the `[locale]` segment as an unvalidated locale.
  matcher:
    "/((?!api|trpc|_next|_vercel|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:css|js|mjs|map|json|txt|xml|ico|png|jpg|jpeg|gif|webp|svg|woff2?|ttf|eot|avif)$).*)",
};
