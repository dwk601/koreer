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
    bg: "#faf9f5",
    surface: "#ffffff",
    surfaceMuted: "#f1efe8",
    border: "rgba(22, 21, 18, 0.08)",
    borderStrong: "rgba(22, 21, 18, 0.16)",

    // Text
    ink: "#16140f",
    inkSoft: "#3a3833",
    inkMute: "#6f6c64",

    // Accent — deep evergreen
    accent: "#1a2a28",
    accentInk: "#f6f5ef",

    // Language chips
    chipKoBg: "#efe8d4",
    chipKoInk: "#564613",
    chipEnBg: "#dfe9e9",
    chipEnInk: "#17353a",
    chipBiBg: "#e9e8f3",
    chipBiInk: "#38347b",

    // Focus + motion
    focus: "#a38b2d",

    // Shadow tint — warm ink for depth (no pure black)
    shadowTint: "22 20 15",
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
