import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { tokens } from "../lib/tokens";

describe("tokens sync guard", () => {
  it("CSS :root vars match lib/tokens.ts colors", () => {
    // Read globals.css
    const cssPath = resolve(__dirname, "../app/globals.css");
    const cssContent = readFileSync(cssPath, "utf-8");

    // Parse :root { ... } block
    const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/);
    if (!rootMatch) {
      throw new Error("Could not find :root block in globals.css");
    }

    const rootBlock = rootMatch[1];

    // Extract --color-* vars and their values
    const cssVars: Record<string, string> = {};
    const varRegex = /--color-([a-z-]+):\s*([^;]+);/g;
    let match;
    while ((match = varRegex.exec(rootBlock)) !== null) {
      const [, name, value] = match;
      cssVars[name] = value.trim();
    }

    // Map TS token names to CSS var names
    const tokenToCssName: Record<string, string> = {
      bg: "bg",
      surface: "surface",
      surfaceMuted: "surface-muted",
      border: "border",
      borderStrong: "border-strong",
      ink: "ink",
      inkSoft: "ink-soft",
      inkMute: "ink-mute",
      accent: "accent",
      accentInk: "accent-ink",
      chipKoBg: "chip-ko-bg",
      chipKoInk: "chip-ko-ink",
      chipEnBg: "chip-en-bg",
      chipEnInk: "chip-en-ink",
      chipBiBg: "chip-bi-bg",
      chipBiInk: "chip-bi-ink",
      focus: "focus",
    };

    // Assert every TS token has a matching CSS var with the same value
    for (const [tsName, cssName] of Object.entries(tokenToCssName)) {
      const tsValue = tokens.colors[tsName as keyof typeof tokens.colors];
      const cssValue = cssVars[cssName];

      expect(cssValue, `CSS var --color-${cssName} not found`).toBeDefined();
      expect(tsValue, `TS token ${tsName} not found`).toBeDefined();
      expect(
        tsValue,
        `Mismatch for --color-${cssName}: TS has "${tsValue}", CSS has "${cssValue}"`
      ).toBe(cssValue);
    }

    // Assert no extra CSS vars (all CSS vars should be in TS)
    const cssNames = Object.keys(cssVars);
    const expectedCssNames = Object.values(tokenToCssName);
    for (const cssName of cssNames) {
      expect(
        expectedCssNames,
        `Extra CSS var --color-${cssName} not in lib/tokens.ts`
      ).toContain(cssName);
    }
  });

  it("no pure-black shadows in component source", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { readdirSync, readFileSync } = require("node:fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { join } = require("node:path");

    const dirs = [
      resolve(__dirname, "../components"),
      resolve(__dirname, "../app"),
    ];

    const pureBlackShadowPattern = /rgba\(0,\s*0,\s*0|rgb\(0,\s*0,\s*0/;
    const violations: string[] = [];

    function walk(dir: string) {
      try {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          if (entry.isDirectory()) {
            if (!entry.name.startsWith(".")) walk(fullPath);
          } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
            const content = readFileSync(fullPath, "utf-8");
            if (pureBlackShadowPattern.test(content)) {
              violations.push(fullPath);
            }
          }
        }
      } catch {
        // ignore
      }
    }

    for (const dir of dirs) {
      walk(dir);
    }

    expect(
      violations,
      `Found pure-black shadows in: ${violations.join(", ")}`
    ).toHaveLength(0);
  });
});
