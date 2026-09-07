# Add Species Info (codigoEspecie / nombreEspecie) to siembraPartidas

**Date:** 2026-09-07
**Status:** Approved
**Scope:** Backend (shared schema, repository, service) + Frontend (data table, view form)

## Problem

`SiembraPartidaSchema` extends `PartidaHeaderSchema` which only has `partidaId`, `anio`, `indice`. The legacy `partidas` table has `espvar` (species/variety code) and joins `articulo` for the species name — but `PartidasRepository.findByComposite` does a bare `SELECT *` with no JOIN, so `codigoEspecie` and `nombreEspecie` never reach the DTO.

Other modules (alerts, extendidos, siembra legacy) already use this JOIN pattern:
```sql
LEFT JOIN articulo ON articulo.codigo = CONCAT(p.espvar, p.contenedor)
```

## Design

### Backend

**1. `PartidasRepository.findByComposite`** (`apps/backend/src/modules/legacy/partidas/repositories/partidas.repository.ts`)

Change the SQL from:
```sql
SELECT * FROM partidas WHERE partida = ? AND ano = ? AND indice = ?
```
To:
```sql
SELECT p.*, articulo.nombre AS nombreEspecie
FROM partidas p
LEFT JOIN articulo ON articulo.codigo = CONCAT(p.espvar, p.contenedor)
WHERE p.partida = ? AND p.ano = ? AND p.indice = ?
```

This follows the same pattern as `findAllSiembra` (`apps/backend/src/modules/legacy/siembra/repositories/siembra.repository.ts:16-53`) and `findExtendidosEnCamara` (`apps/backend/src/modules/legacy/extendidos/repositories/extendidos.repository.ts:79-105`).

**2. `LegacyPartidas` interface** (`apps/backend/src/modules/legacy/partidas/interfaces/partidas.interface.ts`)

Add `nombreEspecie?: string` to the interface. The field `espvar` already exists.

**3. `SiembraPartidasService.mapToDto`** (`apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`)

- Extract `legacyData.espvar` → `codigoEspecie`
- Extract `legacyData.nombreEspecie` → `nombreEspecie`
- If `nombreEspecie` is null/undefined (no matching articulo), log a warning and fallback to `"Sin especificar"`

```ts
const codigoEspecie = legacyData?.espvar ?? "";
let nombreEspecie = legacyData?.nombreEspecie ?? "";
if (!nombreEspecie && codigoEspecie) {
  this.logger.warn(`Articulo not found for codigo: ${codigoEspecie}`);
  nombreEspecie = "Sin especificar";
}
```

**4. `SiembraPartidaSchema`** (`packages/shared/src/schemas/siembraPartida.schema.ts`)

Change from extending `PartidaHeaderSchema` to extending `LegacyHeaderSchema`:

```ts
import { LegacyHeaderSchema } from "./legacy-header.schema";

export const SiembraPartidaSchema = LegacyHeaderSchema.extend({
  // ... existing fields (id, metodoMaquina, presionSemilla, etc.)
});
```

`LegacyHeaderSchema` provides: `partidaId`, `anio`, `indice` (same as `PartidaHeaderSchema`) + `codigoEspecie`, `nombreEspecie` (new, required).

### Frontend

**5. Data table columns** (`apps/frontend/src/features/siembraPartidas/components/columns.tsx`)

Add "Especie" column after Partida:
```tsx
{
  accessorKey: "nombreEspecie",
  header: ({ column }) => (
    <SortableHeader column={column}>Especie</SortableHeader>
  ),
  cell: ({ row }) => (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-semibold truncate max-w-[120px]">
        {row.original.nombreEspecie || "-"}
      </span>
      {row.original.codigoEspecie && (
        <Badge variant="outline" className="font-mono text-[9px] px-1 py-0 shrink-0">
          {row.original.codigoEspecie}
        </Badge>
      )}
    </div>
  ),
  size: 160,
}
```

Add to export columns:
```tsx
{
  accessorKey: "nombreEspecie",
  exportHeader: "Especie",
  exportValue: (_value, row) => `${row.nombreEspecie} (${row.codigoEspecie})`,
  pdfWidth: "20%",
}
```

**6. View form SPECS GRID** (`apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx`)

Add `nombreEspecie` pill to the SPECS GRID alongside Año/Índice:
```tsx
{
  label: "Especie",
  value: selectedPartida.nombreEspecie,
  icon: Sprout,
}
```

Import `Sprout` from `lucide-react`.

## Files Changed

| File | Change |
|------|--------|
| `apps/backend/src/modules/legacy/partidas/repositories/partidas.repository.ts` | Add articulo JOIN to `findByComposite` |
| `apps/backend/src/modules/legacy/partidas/interfaces/partidas.interface.ts` | Add `nombreEspecie` to `LegacyPartidas` |
| `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts` | Map new fields in `mapToDto`, add fallback logging |
| `packages/shared/src/schemas/siembraPartida.schema.ts` | Extend `LegacyHeaderSchema` instead of `PartidaHeaderSchema` |
| `apps/frontend/src/features/siembraPartidas/components/columns.tsx` | Add Especie column + export |
| `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx` | Add Especie pill to SPECS GRID |

## Testing

- Update `siembraPartidas.service.spec.ts` — mock `legacyData` with `espvar`/`nombreEspecie`
- Update `siembraPartidas.repository.spec.ts` — update `findByComposite` expectations
- Update `siembraPartida.schema.spec.ts` — test required `codigoEspecie`/`nombreEspecie`
- Update `legacy-header.schema.spec.ts` — verify `LegacyHeaderSchema` fields

## Edge Cases

- `articulo` LEFT JOIN returns null → service logs warning, provides `"Sin especificar"` fallback
- `espvar` is empty string → `codigoEspecie` is empty, `nombreEspecie` falls back to `"Sin especificar"`
