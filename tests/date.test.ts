import { describe, expect, it } from "vitest";

import { daysSincePosted, freshnessCutoff, FRESHNESS_DAYS } from "@/lib/date";

describe("freshnessCutoff", () => {
  it("returns today minus 60 days by default", () => {
    expect(freshnessCutoff(new Date("2026-05-13T00:00:00Z"))).toBe(
      "2026-03-14",
    );
  });

  it("accepts a custom days window", () => {
    expect(freshnessCutoff(new Date("2026-05-13T00:00:00Z"), 7)).toBe(
      "2026-05-06",
    );
  });

  it("uses FRESHNESS_DAYS=60 as the canonical window", () => {
    expect(FRESHNESS_DAYS).toBe(60);
  });
});

describe("daysSincePosted", () => {
  it("returns the floor of the day diff", () => {
    expect(
      daysSincePosted("2026-05-10", new Date("2026-05-13T00:00:00Z")),
    ).toBe(3);
  });

  it("clamps future dates to 0", () => {
    expect(
      daysSincePosted("2026-05-14", new Date("2026-05-13T00:00:00Z")),
    ).toBe(0);
  });
});
