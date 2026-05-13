import { NextResponse } from "next/server";

import { suggestJobs } from "@/lib/api/jobs";

export const dynamic = "force-dynamic";

/**
 * Thin passthrough so client code never needs to know the API base URL or
 * worry about CORS. Mirrors the upstream contract one-to-one.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const limitRaw = Number(url.searchParams.get("limit") ?? "8");
  const limit = Math.min(Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 8), 12);

  if (q.length < 2) {
    return NextResponse.json({ items: [] }, {
      headers: { "cache-control": "public, max-age=30" },
    });
  }

  try {
    const data = await suggestJobs(q, {
      limit,
      signal: request.signal,
    });
    return NextResponse.json(data, {
      headers: { "cache-control": "public, max-age=30" },
    });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
