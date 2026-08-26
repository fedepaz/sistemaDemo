# Siembra Edit Form Extension Design

## Goal

Extend the siembra edit form to create records in both the legacy database (via `asignarSiembra`) and the new database (via `createSiembraPartida`) in a single transactional operation.

## Context

The siembra edit form currently only updates the legacy database. We need to also persist siembra-specific data (`metodoMaquina`, `presionSemilla`, `profundidadSemilla`, `tratamientoSemilla`, `mezclaId`) to the new Prisma database. Both writes must succeed or both must fail.

## Decisions

1. **Combined DTO**: Use `AsignarUbiSiembraCompletaDtoSchema` (`.merge()` of `SiembraCompletaHeaderSchema` + `AsignarUbiSiembraDtoSchema` fields) — no changes to individual DTOs
2. **Naming consistency**: `partidaId`, `anio`, `indice` throughout — backend maps to legacy `partida`, `ano` when calling legacy service
3. **Transaction**: Prisma `$transaction` wraps `createSiembraPartida`, legacy call inside same callback — if legacy throws, Prisma rolls back
4. **Endpoint**: Replace `AsignarUbiSiembraDto` → `AsignarUbiSiembraCompletaDto` on existing `POST /l-partidas/asignar-siembra`
5. **User extraction**: `@CurrentUser() user: AuthUser` in controller
6. **Remove prefix logic**: `maq:`/`man:` prefix on `detalle` is no longer needed

## Shared Schemas (already implemented)

### `legacy-header.schema.ts`

```ts
export const SiembraCompletaHeaderSchema = LegacyHeaderSchema.merge(
  CreateSiembraPartidaSchema.omit({ partidaId: true, anio: true, indice: true })
);
```

Fields: `partidaId`, `anio`, `indice`, `codigoEspecie`, `nombreEspecie`, `metodoMaquina`, `presionSemilla`, `profundidadSemilla`, `tratamientoSemilla`, `mezclaId`

### `partidas.schema.ts`

```ts
export const AsignarUbiSiembraCompletaDtoSchema = SiembraCompletaHeaderSchema.merge(
  AsignarUbiSiembraDtoSchema.omit({ partida: true, ano: true, indice: true })
);
```

Fields: all header fields + `cg`, `cantidaNroCont`, `f_siembra`, `detalle`, `edita`

## Backend Changes

### Controller (`partidas.controller.ts`)

- Import `AsignarUbiSiembraCompletaDto`, `AsignarUbiSiembraCompletaDtoSchema`
- Import `CurrentUser`, `AuthUser`
- Replace validation pipe and type on `asignarSiembra` method
- Add `@CurrentUser() user: AuthUser` parameter
- Pass `user.id` to service

### Service (`partidas.service.ts`)

- Import `AsignarUbiSiembraCompletaDto`
- Inject `SiembraPartidasService`
- `asignarSiembra(data, requesterId)`:
  1. Split DTO into legacy fields and new fields
  2. Run inside `prisma.$transaction`:
     - Call `siembraPartidasService.createSiembraPartida(newFields, requesterId)`
     - Call `partidasRepository.asignarSiembra(legacyFields)`
  3. If either throws, Prisma rolls back

### Field mapping (legacy)

```
partidaId → partida
anio → ano
indice → indice (same)
```

## Frontend Changes

### API Service (`siembraService.ts`)

- `asignarUbicacionSiembra` accepts `AsignarUbiSiembraCompletaDto`

### Data Table (`siembra-data-table.tsx`)

- Form type: `AsignarUbiSiembraCompletaDto`
- Form resolver: `AsignarUbiSiembraCompletaDtoSchema`
- Default values for new fields: `metodoMaquina: true`, `presionSemilla: 0`, `profundidadSemilla: ""`, `tratamientoSemilla: false`, `mezclaId: ""`
- Remove `handleSubmit` prefix logic — pass form data directly

### Edit Form (`siembra-edit-form.tsx`)

- Remove `isMaquina` local state
- Use `useWatch({ name: "metodoMaquina", control: form.control })` for the switch display
- Remove `handleSubmit` wrapper — submit form data as-is
- Add new section "Datos de Siembra" below existing fields:
  - `metodoMaquina` — Switch with Máquina/Manual label
  - `presionSemilla` — number input with validation hint
  - `profundidadSemilla` — text input with format hint ("1.525")
  - `tratamientoSemilla` — Switch
  - `mezclaId` — dropdown fetching active mezclas

### Props interface

```ts
interface SiembraEditFormProps {
  onSubmit: (data: AsignarUbiSiembraCompletaDto) => Promise<void>;
  onCancel: () => void;
  form: UseFormReturn<AsignarUbiSiembraCompletaDto>;
  selectedSiembra: SiembraDto;
}
```

## Files to modify

| File | Change |
|------|--------|
| `packages/shared/src/schemas/legacy-header.schema.ts` | ✅ Done |
| `packages/shared/src/schemas/partidas.schema.ts` | ✅ Done |
| `apps/backend/src/modules/legacy/partidas/partidas.controller.ts` | Replace schema, add `@CurrentUser` |
| `apps/backend/src/modules/legacy/partidas/partidas.service.ts` | Split DTO, add transaction |
| `apps/frontend/src/features/siembra/api/siembraService.ts` | Update DTO type |
| `apps/frontend/src/features/siembra/components/siembra-data-table.tsx` | Update form type, defaults, remove prefix logic |
| `apps/frontend/src/features/siembra/components/siembra-edit-form.tsx` | Remove local state, add new fields section |
