# Koreer / 코리어

A fast, no-auth job-search website for Korean speakers in the US. Ships only listings posted within the last 60 days and talks to the `koreaJobApiV2` REST API.

- **Stack:** Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript · next-intl · zod
- **Locales:** `ko` (default) and `en`, prefix routing (`/ko/...`, `/en/...`)
- **API:** [`koreaJobApiV2`](https://github.com/dwk601/koreaJobApiV2) (read-only, FastAPI + Meilisearch + Postgres)

## Getting started

```bash
cp .env.example .env.local
# fill in API_BASE_URL + NEXT_PUBLIC_SITE_URL

npm install
npm run dev
```

Open `http://localhost:3000` — redirects to `/ko`.

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Run the production server from `.next` |
| `npm run lint` | ESLint (`eslint-config-next`) |
| `npm test` | Vitest unit suite |
| `npm run test:watch` | Vitest watch mode |

### Environment variables

See [`.env.example`](./.env.example).

| Var | Required | Notes |
|-----|----------|-------|
| `API_BASE_URL` | yes | Server-only base URL for `koreaJobApiV2`. |
| `NEXT_PUBLIC_SITE_URL` | yes (prod) | Absolute site URL — used for canonical links, sitemap, OG tags. |

## Project structure

```
app/
  [locale]/
    layout.tsx, page.tsx          # locale layout + home hero
    jobs/page.tsx, loading.tsx    # list + filters + pagination
    jobs/[id]/page.tsx            # detail + JSON-LD + apply
    error.tsx                     # locale-level error boundary
    opengraph-image.tsx           # dynamic OG image
  api/suggest/route.ts            # /api/suggest proxy
  robots.ts, sitemap.ts           # locale-aware SEO
  global-error.tsx, not-found.tsx
components/
  layout/   header, header-nav, footer, locale-switcher
  search/   search-bar (combobox), filter-sidebar, sort-select, active-filter-chips
  jobs/     job-card, pagination
  ui/       chip (language), empty-state
lib/
  api/      client (fetch wrapper), schemas (zod), jobs (typed callers)
  i18n/     routing, request, navigation
  url/      search-params (parse / serialize / toggle)
  date.ts, format.ts, salary-bucket.ts, cn.ts
messages/   ko.json, en.json
proxy.ts    next-intl routing (Next.js 16 replaces middleware.ts)
tests/      vitest unit suites
```

## Deploy to Coolify (Nixpacks)

Coolify's Nixpacks provider auto-detects this Next.js app — no Dockerfile needed. It runs `npm ci`, `npm run build`, and starts the server with `npm start`.

### Deploy steps

1. **Create the application** — Coolify UI → `+ New` → **Application** → *Public/Private Git* (or from a connected provider). Point at this repo, branch `main`. Build pack: **Nixpacks**. Install, build, and start commands are auto-detected.

2. **Environment variables** — under the app's **Environment** tab. Mark `NEXT_PUBLIC_SITE_URL` as _"Available at build time"_ so it is baked into the client bundle.

   | Variable | Value | Build-time? |
   |----------|-------|-------------|
   | `API_BASE_URL` | Internal URL for apiV2 (e.g. `http://api:8000` on the shared Coolify network, or the managed resource's internal host) | runtime |
   | `NEXT_PUBLIC_SITE_URL` | Public site URL (e.g. `https://jobs.yourdomain.com`) | **build** |
   | `SERVICE_FQDN_WEB_3000` | Your public domain — leave blank for a generated `*.sslip.io` | runtime |
   | `NODE_VERSION` | `24` (optional; Nixpacks defaults are usually fine) | build |

3. **Deploy** — Coolify runs Nixpacks, builds the app, starts `npm start` on `:3000`, and Traefik auto-provisions TLS.

4. **Verify:**

   ```bash
   curl -s https://<domain>/         # redirects to /ko
   curl -sI https://<domain>/robots.txt
   curl -s  https://<domain>/sitemap.xml | head -20
   ```

### Local smoke test

```bash
cp .env.example .env.local
npm run build
npm start
# then
curl -sI http://localhost:3000/        # 307 -> /ko
curl -s  http://localhost:3000/robots.txt
```

### Notes

- The `/api/suggest` route handler proxies the upstream `/api/v1/jobs/suggest` so the public API base URL is never exposed to the client.
- **Freshness enforcement:** Every `listJobs` and `getFacets` request silently injects `post_date_from = today − 60 days` unless the caller explicitly overrides it. This is enforced at the API-client layer, so every page in the app benefits. `getJob`, `getStats`, and `suggestJobs` are unaffected.
- **Count behavior:** The home page hero count (`stats.total_jobs`) is the full-corpus count. The `/jobs` page count (`list.total_estimated`) is filter- and freshness-aware. This is intentional — the hero showcases the full database size, while the list reflects what users can actually find.
- **Performance:** The `/jobs` page calls `listJobs` once (sidebar and results share the response via Next's fetch cache) instead of making a separate `getFacets` call.
- Sitemap includes up to 200 freshest detail URLs with full `<xhtml:link rel="alternate" hreflang="..."/>` pairs and `x-default` → `/ko`.

## License

Proprietary — not for redistribution.
