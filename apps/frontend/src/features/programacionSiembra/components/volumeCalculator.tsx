// src/features/programacionSiembra/components/volumeCalculator.tsx
"use client";

import { useState } from "react";
import { isCalcDisabled, resolvePair } from "./volumeCalculatorMath";

interface VolumeCalculatorProps {
  qty: number | null;
}

interface CalcState {
  unitRaw: string;
  totalRaw: string;
  source: "unit" | "total";
}

interface CalcRowProps {
  label: string;
  value: string;
  disabled: boolean;
  lossy: boolean;
  onChange: (raw: string) => void;
}

function CalcRow({ label, value, disabled, lossy, onChange }: CalcRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-border/30 last:border-0">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-1.5 min-w-0">
        <input
          type="text"
          inputMode="decimal"
          aria-label={label}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 rounded-md border border-border/40 bg-transparent px-2 py-1 text-right text-xs font-bold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        />
        {lossy && (
          <span
            className="text-xs font-bold text-warning"
            title="Valor aproximado (redondeado a 3 decimales)"
            aria-label="Valor aproximado (redondeado a 3 decimales)"
          >
            ≈
          </span>
        )}
      </span>
    </div>
  );
}

export function VolumeCalculator({ qty }: VolumeCalculatorProps) {
  const [state, setState] = useState<CalcState>({
    unitRaw: "1",
    totalRaw: "",
    source: "unit",
  });

  const disabled = isCalcDisabled(qty);
  const { unit, total, lossy } = resolvePair({ ...state, qty });

  return (
    <>
      <CalcRow
        label="Valor Unitario (L)"
        value={unit}
        disabled={disabled}
        lossy={state.source === "total" && lossy}
        onChange={(raw) =>
          setState((s) => ({ ...s, unitRaw: raw, source: "unit" }))
        }
      />
      <CalcRow
        label="Valor Total (L)"
        value={total}
        disabled={disabled}
        lossy={state.source === "unit" && lossy}
        onChange={(raw) =>
          setState((s) => ({ ...s, totalRaw: raw, source: "total" }))
        }
      />
      {disabled && (
        <p className="px-3 pt-1 text-xs font-medium text-muted-foreground">
          Sin cantidad de contenedor
        </p>
      )}
    </>
  );
}
