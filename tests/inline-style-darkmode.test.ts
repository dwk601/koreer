import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("inline-style dark mode", () => {
  it("not-found.tsx contains prefers-color-scheme: dark and dark surface hex", () => {
    const path = resolve(__dirname, "../app/not-found.tsx");
    const content = readFileSync(path, "utf-8");

    expect(content).toContain("prefers-color-scheme: dark");
    expect(content).toContain("#0c0b08");
  });

  it("global-error.tsx contains prefers-color-scheme: dark and dark surface hex", () => {
    const path = resolve(__dirname, "../app/global-error.tsx");
    const content = readFileSync(path, "utf-8");

    expect(content).toContain("prefers-color-scheme: dark");
    expect(content).toContain("#0c0b08");
  });
});
