import { describe, expect, it } from "vitest";

import { SOURCE_LABEL, formatSourceLabel } from "@/lib/sources";

describe("source labels", () => {
  it("includes the SimplyHired ETL source", () => {
    expect(SOURCE_LABEL.simplyhired).toBe("SimplyHired");
    expect(formatSourceLabel("simplyhired")).toBe("SimplyHired");
  });
});
