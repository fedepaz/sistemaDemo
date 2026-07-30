// src/lib/export/pdf-theme.ts
//
// ⚠️ KEEP IN SYNC with globals.css theme colors.
// When modifying OKLCH values in globals.css, update the corresponding
// hex values below. Use the oklchToHex converter in theme.ts to compute
// the correct hex for any OKLCH value.
//
// Palette derived from :root CSS variables:
//   --primary:          oklch(0.5854 0.2041 277.1173)
//   --primary-foreground: oklch(1 0 0)
//   --accent:           oklch(0.9299 0.0334 272.7879)
//   --muted-foreground: oklch(0.551 0.0234 264.3637)
//   --border:           oklch(0.8717 0.0093 258.3382)

export const PDF_THEME = {
  /** Primary brand color — used for titles, table headers, accents */
  primary: "#4f46e5",
  /** Foreground on primary backgrounds (white text on colored bg) */
  primaryFg: "#ffffff",
  /** Accent / light background — header bg, zebra stripes */
  accent: "#e8dff5",
  /** Muted text — taglines, secondary info */
  mutedFg: "#71717a",
  /** Border / rule lines */
  border: "#d4d4d8",
  /** Table body background */
  background: "#ffffff",
} as const;
