# Design: Alerts SQL Integration

## Summary

Replace the hardcoded mock data in the alerts repository with real SQL queries against the legacy MySQL database. Update shared DTOs, backend interfaces, and frontend columns to match the actual SQL output.

## Motivation

The alerts module currently returns hardcoded mock data. The senior developer has provided the real SQL queries that should power the 4 alert types. The existing DTOs and interfaces don't match the SQL output — fields are missing, some don't exist in the SQL, and the `plarta` field (CONCAT of espvar+contenedor) needs to be handled.

## Decisions

1. **Replace mocks** — Delete hardcoded data, execute real SQL queries via `LegacyMysqlService`
2. **Update shared DTOs** — Modify Zod schemas and types to match SQL output
3. **Query espvar + contenedor separately** — Don't use CONCAT; select them as individual columns
4. **Decimal fields as strings** — `pr`, `stIniPr` use `z.string()` in DTOs to avoid floating-point precision issues
5. **SQL conditions as-is** — Keep `ano>2025`, `WEEK(CURRENT_DATE())`, etc. exactly as provided
6. **Update frontend** — Adapt columns and export columns to new DTO shapes

## SQL Queries (from senior)

### 1. Siembra Retrasada
```sql
SELECT partidas.partida, partidas.ano, partidas.indice,
  partidas.espvar, articulo.nombre, partidas.injerto, partidas.nrocont,
  CONCAT(partidas.sem_siem,'-',partidas.ano_siem) AS semSiembra,
  partidas.f_siem, partidas.f_siembra,
  CONCAT(partidas.sem_ent,'-',partidas.ano_ent,' ',partidas.i_f) AS semEntrega,
  partidas.f_ent, partidas.estado, partidas.contenedor
FROM partidas
LEFT JOIN articulo ON articulo.codigo=CONCAT(partidas.espvar,partidas.contenedor)
WHERE estado <> 'ANULADA' AND f_siembra=0 AND partidas.hai<>'A'
  AND partidas.sem_siem=WEEK(CURRENT_DATE()) AND partidas.ano>2025
ORDER BY partidas.ano, partidas.partida
```

### 2. Falta Germinacion
```sql
SELECT partidas.partida, partidas.ano, partidas.indice,
  partidas.espvar, articulo.nombre, partidas.injerto, partidas.nrocont,
  partidas.f_primer, partidas.pr, partidas.contenedor
FROM partidas
LEFT JOIN articulo ON articulo.codigo=CONCAT(partidas.espvar,partidas.contenedor)
WHERE partidas.f_primer<=CURRENT_DATE() AND estado <> 'ANULADA'
  AND pr=0 AND partidas.hai<>'A' AND partidas.ano>2025
ORDER BY partidas.ano, partidas.partida
```

### 3. Faltante Plantas
```sql
SELECT partidas.hai, partidas.partida, partidas.ano, partidas.indice,
  partidas.espvar, articulo.nombre, partidas.nrocont, partidas.solicito,
  partidas.f_primer, partidas.pr, partidas.st_ini_pr,
  FLOOR(partidas.pr*partidas.cant_s/100)*partidas.st_ini_pr AS porPr,
  partidas.contenedor
FROM partidas
LEFT JOIN articulo ON articulo.codigo=CONCAT(partidas.espvar,partidas.contenedor)
WHERE estado <> 'ANULADA' AND pr<>0 AND pe=0
  AND partidas.solicito>FLOOR(partidas.pr*partidas.cant_s/100)*partidas.st_ini_pr
  AND partidas.hai<>'A' AND partidas.ano>2025
ORDER BY partidas.ano, partidas.partida, partidas.indice
```

### 4. Falta Pre-Expedicion
```sql
SELECT partidas.partida, partidas.ano, partidas.indice,
  partidas.espvar, articulo.nombre, partidas.injerto, partidas.nrocont,
  partidas.f_preexp, partidas.pe, partidas.contenedor
FROM partidas
LEFT JOIN articulo ON articulo.codigo=CONCAT(partidas.espvar,partidas.contenedor)
WHERE partidas.f_preexp<=CURRENT_DATE() AND estado <> 'ANULADA'
  AND pe=0 AND partidas.hai<>'A' AND partidas.ano>2025
ORDER BY partidas.ano, partidas.partida
```

## Shared DTOs (packages/shared/src/schemas/alerts.schema.ts)

### SiembraRetrasadaDto
| Field | Type | Notes |
|---|---|---|
| partidaId | z.number() | partidas.partida |
| anio | z.number() | partidas.ano |
| indice | z.number() | partidas.indice |
| codigoEspecie | z.string() | partidas.espvar |
| nombreEspecie | z.string() | articulo.nombre |
| injerto | z.string() | partidas.injerto |
| nrocont | z.string() | partidas.nrocont |
| contenedor | z.string() | partidas.contenedor |
| semSiembra | z.string() | CONCAT(sem_siem,'-',ano_siem) |
| fechaSugeridaSiembra | z.string() | partidas.f_siem |
| fSiembra | z.number() | partidas.f_siembra (0 = not sown) |
| semEntrega | z.string() | CONCAT(sem_ent,'-',ano_ent,' ',i_f) |
| fEnt | z.string() | partidas.f_ent |
| estado | z.string() | partidas.estado |

**Removed:** `con` (not in SQL, was mock-only)

### FaltaGerminacionDto
| Field | Type | Notes |
|---|---|---|
| partidaId | z.number() | partidas.partida |
| anio | z.number() | partidas.ano |
| indice | z.number() | partidas.indice |
| codigoEspecie | z.string() | partidas.espvar |
| nombreEspecie | z.string() | articulo.nombre |
| injerto | z.string() | partidas.injerto |
| nrocont | z.string() | partidas.nrocont |
| contenedor | z.string() | partidas.contenedor |
| fPrimer | z.string() | partidas.f_primer |
| pr | z.string() | partidas.pr (decimal, string for precision) |

### FaltantePlantasDto
| Field | Type | Notes |
|---|---|---|
| hai | z.string() | partidas.hai |
| partidaId | z.number() | partidas.partida |
| anio | z.number() | partidas.ano |
| indice | z.number() | partidas.indice |
| codigoEspecie | z.string() | partidas.espvar |
| nombreEspecie | z.string() | articulo.nombre |
| nrocont | z.string() | partidas.nrocont |
| contenedor | z.string() | partidas.contenedor |
| solicito | z.number() | partidas.solicito |
| fPrimer | z.string() | partidas.f_primer |
| pr | z.string() | partidas.pr (decimal, string) |
| stIniPr | z.string() | partidas.st_ini_pr (decimal, string) |
| porPr | z.number() | FLOOR(pr*cant_s/100)*st_ini_pr (integer after FLOOR) |

### FaltaPreExpedicionDto
| Field | Type | Notes |
|---|---|---|
| partidaId | z.number() | partidas.partida |
| anio | z.number() | partidas.ano |
| indice | z.number() | partidas.indice |
| codigoEspecie | z.string() | partidas.espvar |
| nombreEspecie | z.string() | articulo.nombre |
| injerto | z.string() | partidas.injerto |
| nrocont | z.string() | partidas.nrocont |
| contenedor | z.string() | partidas.contenedor |
| fPreexp | z.string() | partidas.f_preexp |
| pe | z.number() | partidas.pe |

## Backend Changes

### Interfaces (alerts.interface.ts)
Update all 4 legacy interfaces to match SQL column aliases. Key changes:
- `espvar` stays as `espvar` (selected separately, not CONCAT)
- `especieNombre` → `nombre` (matches SQL alias)
- Add missing fields: `injerto`, `nrocont`, `semSiembra`, `fSiembra`, `semEntrega`, `fEnt`, `estado`, `fPrimer`, `pr`, `hai`, `solicito`, `stIniPr`, `porPr`, `fPreexp`, `pe`
- Remove `invernadero` from FaltaGerminacion and FaltaPreExpedicion (not in SQL)
- Remove `germinadasTotales` and `invernadero` from FaltantePlantas (not in SQL)

### Repository (alerts.repository.ts)
- Inject `LegacyMysqlService` instead of returning hardcoded data
- Each `find*` method executes the corresponding SQL query
- Return type is the legacy interface (RowDataPacket)

### Service (alerts.service.ts)
- Update mappers to map from legacy interface fields to shared DTO fields
- `espvar` → `codigoEspecie`
- `nombre` → `nombreEspecie`
- Add new field mappings for the added fields

### Module (alerts.module.ts)
- Add `LegacyMysqlModule` import (or ensure it's available via global module)

## Frontend Changes

### Columns (alert-columns.tsx)
Update column definitions for each alert type:

**SiembraRetrasada** — add `injerto`, `nrocont`, `semSiembra`, `semEntrega`, `estado` columns

**FaltaGerminacion** — remove `invernadero`, add `fPrimer`, `pr` columns

**FaltantePlantas** — remove `invernadero`, `germinadasTotales`, add `solicito`, `pr`, `porPr` columns

**FaltaPreExpedicion** — remove `invernadero`, add `fPreexp`, `pe`, `injerto` columns

### Export columns
Update export column definitions to match new DTO shapes.

## Files Changed

| File | Action |
|---|---|
| `packages/shared/src/schemas/alerts.schema.ts` | Edit — update 4 DTO schemas |
| `packages/shared/src/schemas/__tests__/alerts.schema.spec.ts` | Edit — update test data |
| `apps/backend/src/modules/legacy/alerts/interfaces/alerts.interface.ts` | Edit — update 4 interfaces |
| `apps/backend/src/modules/legacy/alerts/repositories/alerts.repository.ts` | Edit — replace mocks with SQL |
| `apps/backend/src/modules/legacy/alerts/alerts.service.ts` | Edit — update mappers |
| `apps/backend/src/modules/legacy/alerts/alerts.module.ts` | Edit — add LegacyMysqlModule if needed |
| `apps/frontend/src/features/alerts/components/shared/alert-columns.tsx` | Edit — update columns |
| `apps/frontend/src/features/alerts/components/shared/alert-export-columns.ts` | Edit — if separate file exists |

## Non-Goals

- No new API endpoints
- No changes to the alert modal or dashboard layout
- No pagination (queries return all matching rows)
- No caching beyond React Query defaults

## Testing

- Update shared schema tests to match new DTO shapes
- Backend: repository queries are integration-tested against the real DB (existing pattern)
- Frontend: column definitions are type-checked by TypeScript
