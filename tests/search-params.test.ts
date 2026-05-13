import { describe, expect, it } from "vitest";

import {
  hasActiveFilters,
  parseListParams,
  toggleInList,
  toQueryString,
} from "@/lib/url/search-params";

describe("parseListParams", () => {
  it("normalises state to uppercase", () => {
    expect(parseListParams({ location_state: "ca" }).location_state).toBe("CA");
  });

  it("drops unknown sort and language values", () => {
    const p = parseListParams({ sort: "bogus", language: "martian" });
    expect(p.sort).toBeUndefined();
    expect(p.language).toBeUndefined();
  });

  it("clamps limit between 1 and 100", () => {
    expect(parseListParams({ limit: "-3" }).limit).toBe(1);
    expect(parseListParams({ limit: "500" }).limit).toBe(100);
    expect(parseListParams({ limit: "50" }).limit).toBe(50);
  });

  it("returns arrays when multiple values are provided", () => {
    const p = parseListParams({ source: ["indeed", "linkedin"] });
    expect(p.source).toEqual(["indeed", "linkedin"]);
  });

  it("keeps only valid ISO date strings for post_date_from/to", () => {
    const p = parseListParams({
      post_date_from: "2026-01-15",
      post_date_to: "not-a-date",
    });
    expect(p.post_date_from).toBe("2026-01-15");
    expect(p.post_date_to).toBeUndefined();
  });
});

describe("toQueryString", () => {
  it("repeats multi-valued keys", () => {
    const qs = toQueryString({ source: ["indeed", "linkedin"] });
    expect(qs).toContain("source=indeed");
    expect(qs).toContain("source=linkedin");
  });

  it("omits the default limit", () => {
    expect(toQueryString({ limit: 20 })).not.toContain("limit=");
  });

  it("round-trips an arbitrary parsed input", () => {
    const parsed = parseListParams({
      q: "nurse",
      source: ["indeed"],
      language: "korean",
      sort: "newest",
      location_state: "ca",
    });
    const reparsed = parseListParams(
      Object.fromEntries(new URLSearchParams(toQueryString(parsed))),
    );
    expect(reparsed.q).toBe("nurse");
    expect(reparsed.source).toEqual(["indeed"]);
    expect(reparsed.language).toBe("korean");
    expect(reparsed.sort).toBe("newest");
    expect(reparsed.location_state).toBe("CA");
  });
});

describe("toggleInList", () => {
  it("removes a present value", () => {
    const parsed = parseListParams({ source: ["indeed", "linkedin"] });
    const qs = toggleInList(parsed, "source", "indeed");
    expect(qs).not.toContain("source=indeed");
    expect(qs).toContain("source=linkedin");
  });

  it("adds a missing value", () => {
    const parsed = parseListParams({ source: "indeed" });
    const qs = toggleInList(parsed, "source", "linkedin");
    expect(qs).toContain("source=indeed");
    expect(qs).toContain("source=linkedin");
  });
});

describe("hasActiveFilters", () => {
  it("returns true when q is set", () => {
    expect(hasActiveFilters({ q: "nurse" })).toBe(true);
  });

  it("returns false for only pagination params", () => {
    expect(hasActiveFilters({ limit: 20, cursor: "x" })).toBe(false);
  });
});
