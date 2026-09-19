import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";

// In Next.js 16 the file is `proxy.ts` (formerly `middleware.ts`).
// next-intl still exports `createMiddleware` — same function, new home.
export default createMiddleware(routing);

export const config = {
  // Match application paths while bypassing system routes and any dotted path.
  // The latter keeps every public/static file out of locale negotiation, while
  // assertLocale guards dynamic page segments that do reach the app layer.
  matcher: "/((?!(?:api|trpc|_next|_vercel)(?:/|$)|.*\\..*).*)",
};
