import { describe, expect, it } from "vitest";

import {
  formatLocation,
  formatPostedRelative,
  formatSalary,
} from "@/lib/format";
import {
  bucketToRange,
  inferSalaryBucket,
  SALARY_BUCKETS,
} from "@/lib/salary-bucket";

describe("formatSalary", () => {
  it("returns null when no salary is listed", () => {
    expect(
      formatSalary({
        salary_min: null,
        salary_max: null,
        salary_unit: null,
        salary_currency: null,
      }),
    ).toBeNull();
  });

  it("renders a yearly range as $80K–$120K/yr", () => {
    expect(
      formatSalary({
        salary_min: 80000,
        salary_max: 120000,
        salary_unit: "yearly",
        salary_currency: "USD",
      }),
    ).toBe("$80K–$120K/yr");
  });

  it("renders an hourly single value with two digits and /hr", () => {
    expect(
      formatSalary({
        salary_min: 25,
        salary_max: 25,
        salary_unit: "hourly",
        salary_currency: "USD",
      }),
    ).toBe("$25/hr");
  });
});

describe("formatLocation", () => {
  it("joins city and state with a comma", () => {
    expect(
      formatLocation({ location_city: "Atlanta", location_state: "GA" }),
    ).toBe("Atlanta, GA");
  });

  it("handles missing city", () => {
    expect(
      formatLocation({ location_city: null, location_state: "GA" }),
    ).toBe("GA");
  });

  it("returns empty when both are missing", () => {
    expect(
      formatLocation({ location_city: null, location_state: null }),
    ).toBe("");
  });
});

describe("formatPostedRelative", () => {
  it("renders 'today' copy in en", () => {
    const s = formatPostedRelative(
      "2026-05-13",
      "en",
      new Date("2026-05-13T00:00:00Z"),
    );
    // Intl.RelativeTimeFormat returns "today" for 0 with numeric:auto
    expect(s?.toLowerCase()).toContain("today");
  });

  it("returns null when post_date is null", () => {
    expect(formatPostedRelative(null, "en")).toBeNull();
  });
});

describe("salary bucket mapping", () => {
  it("maps 40k_80k both directions", () => {
    const range = bucketToRange("40k_80k");
    expect(range).toEqual({ salary_min: 40_000, salary_max: 80_000 });
    expect(inferSalaryBucket(range)).toBe("40k_80k");
  });

  it("maps under_40k as an upper bound only", () => {
    const range = bucketToRange("under_40k");
    expect(range).toEqual({ salary_min: undefined, salary_max: 40_000 });
    expect(inferSalaryBucket(range)).toBe("under_40k");
  });

  it("exposes all buckets", () => {
    expect(SALARY_BUCKETS).toContain("40k_80k");
    expect(SALARY_BUCKETS).toContain("over_120k");
    expect(SALARY_BUCKETS).toContain("free");
  });
});
