// src/features/programacionSiembra/components/volumeCalculatorMath.ts

const DECIMALS = 3;
const EPSILON = 1e-6;
const DASH = "—";

export interface ResolvePairInput {
  unitRaw: string;
  totalRaw: string;
  qty: number | null | undefined;
  source: "unit" | "total";
}

export interface ResolvePairResult {
  unit: string;
  total: string;
  lossy: boolean;
}

export function isCalcDisabled(qty: number | null | undefined): boolean {
  return qty == null || qty <= 0;
}

export function parseNumber(
  raw: string | number | null | undefined,
): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function roundTo3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function formatL(value: number): string {
  const trimmed = roundTo3(value).toFixed(DECIMALS).replace(/\.?0+$/, "");
  return trimmed.replace(".", ",");
}

export function isLossy(value: number): boolean {
  return Math.abs(value * 1000 - Math.round(value * 1000)) > EPSILON;
}

export function resolvePair(input: ResolvePairInput): ResolvePairResult {
  const { unitRaw, totalRaw, qty, source } = input;
  if (isCalcDisabled(qty)) {
    return { unit: "1", total: DASH, lossy: false };
  }
  const q = qty as number;

  if (source === "unit") {
    const unit = parseNumber(unitRaw);
    if (unit == null) return { unit: unitRaw, total: DASH, lossy: false };
    const rawTotal = unit * q;
    return { unit: unitRaw, total: formatL(rawTotal), lossy: isLossy(rawTotal) };
  }

  const total = parseNumber(totalRaw);
  if (total == null) return { unit: DASH, total: totalRaw, lossy: false };
  const rawUnit = total / q;
  return { unit: formatL(rawUnit), total: totalRaw, lossy: isLossy(rawUnit) };
}
