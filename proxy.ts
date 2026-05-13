import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";

// In Next.js 16 the file is `proxy.ts` (formerly `middleware.ts`).
// next-intl still exports `createMiddleware` — same function, new home.
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - `/api`, `/trpc`, `/_next`, `/_vercel` system routes
  // - any pathname containing a dot (e.g. `favicon.ico`, `robots.txt`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
