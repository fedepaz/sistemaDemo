// src/lib/export/theme.ts

// Minimal oklch(L C H) -> hex converter, no DOM needed.
function oklchToHex(oklchStr: string): string {
  const match = oklchStr.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
  if (!match) throw new Error(`Could not parse oklch value: ${oklchStr}`);

  const [, lStr, cStr, hStr] = match;
  const L = parseFloat(lStr);
  const C = parseFloat(cStr);
  const H = parseFloat(hStr);

  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // OKLab -> linear sRGB
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3,
    m = m_ ** 3,
    s = s_ ** 3;

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const toSRGB = (c: number) => {
    c = Math.max(0, Math.min(1, c));
    return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  };

  const toHex = (c: number) =>
    Math.round(toSRGB(c) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
}

export function getThemeColorsForExport() {
  const root = getComputedStyle(document.documentElement);
  const primaryRaw = root.getPropertyValue("--primary").trim();
  const accentRaw = root.getPropertyValue("--accent").trim();

  return {
    primaryColor: oklchToHex(primaryRaw),
    headerBg: oklchToHex(accentRaw),
  };
}
