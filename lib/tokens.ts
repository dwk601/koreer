/**
 * Design tokens — single source of truth for colors, spacing, and typography.
 * 
 * Source of truth. app/globals.css :root MUST mirror these values;
 * tests/tokens.test.ts enforces it via snapshot comparison.
 * 
 * Light mode only (dark mode is handled via CSS media query).
 * Inline-styled components (not-found.tsx, global-error.tsx, opengraph-image.tsx)
 * consume these constants directly.
 * 
 * Note: opengraph-image.tsx is intentionally light-only (rendered server-side,
 * no media-query support, brand neutrality).
 */

export const tokens = {
  colors: {
    // Core surfaces — warm, tinted neutrals
    bg: "#f7f3e9",
    surface: "#fffdf7",
    surfaceMuted: "#ebe4d4",

    border: "rgba(33, 30, 22, 0.1)",
    borderStrong: "rgba(33, 30, 22, 0.2)",

    // Text
    ink: "#18150f",
    inkSoft: "#39342a",
    inkMute: "#756f61",

    // Accent — deep evergreen
    accent: "#17322d",
    accentInk: "#f6f0df",

    // Language chips
    chipKoBg: "#eadfbe",
    chipKoInk: "#5b4711",
    chipEnBg: "#d8e7e2",
    chipEnInk: "#183b34",
    chipBiBg: "#e4dfed",
    chipBiInk: "#403276",

    // Focus + motion
    focus: "#9d8126",

    // Shadow tint — warm ink for depth (no pure black)
    shadowTint: "33 30 22",
  },
} as const;

// Re-export individual constants for convenience
export const {
  colors: {
    bg,
    surface,
    surfaceMuted,

    border,
    borderStrong,
    ink,
    inkSoft,
    inkMute,
    accent,
    accentInk,
    chipKoBg,
    chipKoInk,
    chipEnBg,
    chipEnInk,
    chipBiBg,
    chipBiInk,
    focus,
    shadowTint,
  },
} = tokens;
