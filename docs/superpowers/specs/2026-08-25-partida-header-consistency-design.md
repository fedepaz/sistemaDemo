# Partida Header Consistency Design

## Goal

Standardize all schemas to use `PartidaHeaderSchema` (`partidaId`, `anio`, `indice`) for consistent naming across the codebase. Backend service maps to legacy field names when calling the repository.

## Context

Currently, legacy DTOs use `partida`, `ano`, `indice` while new DB schemas use `partidaId`, `anio`, `indice`. This creates inconsistency. We want a single source of truth for the core header fields.

## Decisions

1. **`PartidaHeaderSchema`** is the single source of truth for `partidaId`, `anio`, `indice`
2. **`LegacyHeaderSchema`** extends `PartidaHeaderSchema` with `codigoEspecie`, `nombreEspecie` (for display only)
3. **Legacy DTOs** (`AsignarUbiExtendidoDto`, `AsignarUbiSiembraDto`) extend `PartidaHeaderSchema` instead of defining fields inline
4. **New DB schemas** (`SiembraPartidaSchema`, `CreateSiembraPartidaSchema`) extend `PartidaHeaderSchema`
5. **`AsignarUbiSiembraCompletaDtoSchema`** just `.merge()` of two schemas (header already included from both)
6. **Backend mapping** stays in service layer: `partidaId → partida`, `anio → ano`

## Schema Changes

### `legacy-header.schema.ts` (already done)

```ts
PartidaHeaderSchema = { partidaId, anio, indice }
LegacyHeaderSchema = { ...PartidaHeaderSchema, codigoEspecie, nombreEspecie }
```

### `partidas.schema.ts`

```ts
AsignarUbiExtendidoDtoSchema = PartidaHeaderSchema.extend({
  ubicacion, stock_ini, detalle, baja, extendido, edita
})

AsignarUbiSiembraDtoSchema = PartidaHeaderSchema.extend({
  cg, cantidaNroCont, f_siembra, detalle, edita
})

AsignarUbiSiembraCompletaDtoSchema = AsignarUbiSiembraDtoSchema.merge(
  CreateSiembraPartidaSchema  // header already included from both
)
```

### `siembraPartida.schema.ts`

```ts
SiembraPartidaSchema = PartidaHeaderSchema.extend({
  id, metodoMaquina, presionSemilla, profundidadSemilla,
  tratamientoSemilla, mezclaId, userId
})

CreateSiembraPartidaSchema = PartidaHeaderSchema.extend({
  metodoMaquina, presionSemilla, profundidadSemilla,
  tratamientoSemilla, mezclaId
})
```

## Backend Changes

### `partidas.service.ts`

Map header fields to legacy names in both methods:

```ts
// asignarExtendido
const legacyData = {
  partida: data.partidaId,
  ano: data.anio,
  indice: data.indice,
  ...otherFields
}

// asignarSiembra
const legacyData = {
  partida: data.partidaId,
  ano: data.anio,
  indice: data.indice,
  ...otherFields
}
```

## Frontend Changes

None — frontend already uses `partidaId`, `anio`, `indice`.

## Files to modify

| File | Change |
|------|--------|
| `packages/shared/src/schemas/legacy-header.schema.ts` | ✅ Done |
| `packages/shared/src/schemas/partidas.schema.ts` | Extend `PartidaHeaderSchema` in DTOs |
| `packages/shared/src/schemas/siembraPartida.schema.ts` | Extend `PartidaHeaderSchema` in schemas |
| `apps/backend/src/modules/legacy/partidas/partidas.service.ts` | Verify mapping works |
