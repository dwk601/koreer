import { z } from "zod";

import { apiErrorSchema } from "./schemas";

/**
 * Typed, server-only wrapper around `fetch` for the koreaJobApiV2 REST API.
 *
 *   - Reads the base URL from `API_BASE_URL`.
 *   - Parses the documented error envelope (`{error: {code, message, detail}}`).
 *   - Echoes `X-Request-ID` on outgoing requests so logs are correlatable.
 *   - Retries once on HTTP 429 honouring the `Retry-After` header (seconds).
 *
 * Do **not** import this module from a Client Component; it is server-side.
 */

const DEFAULT_BASE_URL =
  "https://api-srku356jbc5fqtrtwff3j3pd.50.146.245.162.sslip.io";

/** Structured error thrown for any non-2xx response. */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly detail?: unknown;
  readonly requestId?: string;

  constructor(args: {
    status: number;
    message: string;
    code?: string;
    detail?: unknown;
    requestId?: string;
  }) {
    super(args.message);
    this.name = "ApiError";
    this.status = args.status;
    this.code = args.code;
    this.detail = args.detail;
    this.requestId = args.requestId;
  }
}

export function getApiBaseUrl(): string {
  return (process.env.API_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function newRequestId(): string {
  // Avoid pulling in a UUID dep — short random hex is enough for correlation.
  // globalThis.crypto is available in all runtimes we target (Node 20+, edge).
  const bytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export interface ApiFetchOptions {
  /**
   * Query parameters. Arrays are serialized as repeated keys (e.g.
   * `source=linkedin&source=indeed`), matching FastAPI's default behaviour.
   * `undefined` and empty string values are omitted.
   */
  query?: Record<
    string,
    string | number | boolean | string[] | null | undefined
  >;
  /** Next.js fetch cache control. Defaults to 60s revalidation. */
  revalidate?: number | false;
  /** Tag the cache entry for on-demand revalidation. */
  tags?: string[];
  /** Allow the caller to abort. */
  signal?: AbortSignal;
}

/**
 * Low-level fetch helper. Prefer the named functions in `./jobs.ts`.
 */
export async function apiFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  options: ApiFetchOptions = {},
): Promise<T> {
  const base = getApiBaseUrl();
  const url = buildUrl(base, path, options.query);
  const requestId = newRequestId();

  const init: RequestInit & { next?: { revalidate?: number; tags?: string[] } } =
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-request-id": requestId,
      },
      signal: options.signal,
      next: {
        revalidate:
          options.revalidate === false
            ? undefined
            : (options.revalidate ?? 60),
        ...(options.tags ? { tags: options.tags } : {}),
      },
    };
  // When caller explicitly disables caching, translate that to `no-store`.
  if (options.revalidate === false) {
    (init as RequestInit).cache = "no-store";
    delete init.next;
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    throw new ApiError({
      status: 0,
      message: `Network error reaching ${url}: ${(e as Error).message}`,
      requestId,
    });
  }

  // One-shot retry on 429, honouring Retry-After (seconds, capped at 5s).
  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("retry-after") ?? "1");
    const waitMs = Math.min(
      Number.isFinite(retryAfter) ? retryAfter * 1000 : 1000,
      5000,
    );
    await new Promise((r) => setTimeout(r, waitMs));
    res = await fetch(url, init);
  }

  if (!res.ok) {
    await throwApiError(res, requestId);
  }

  const body = await res.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError({
      status: res.status,
      message: `Invalid response shape from ${path}`,
      code: "SCHEMA_MISMATCH",
      detail: parsed.error.issues,
      requestId,
    });
  }
  return parsed.data;
}

async function throwApiError(res: Response, requestId: string): Promise<never> {
  let message = `Request failed with ${res.status}`;
  let code: string | undefined;
  let detail: unknown;
  try {
    const body = await res.json();
    const parsed = apiErrorSchema.safeParse(body);
    if (parsed.success) {
      message = parsed.data.error.message ?? message;
      code = parsed.data.error.code;
      detail = parsed.data.error.detail;
    }
  } catch {
    // body wasn't JSON — fall back to status-only error
  }
  throw new ApiError({
    status: res.status,
    message,
    code,
    detail,
    requestId: res.headers.get("x-request-id") ?? requestId,
  });
}

function buildUrl(
  base: string,
  path: string,
  query: ApiFetchOptions["query"],
): string {
  const url = new URL(path.replace(/^\/+/, "/"), base.endsWith("/") ? base : base + "/");
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        for (const v of value) {
          if (v === undefined || v === null || v === "") continue;
          url.searchParams.append(key, String(v));
        }
      } else if (value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}
