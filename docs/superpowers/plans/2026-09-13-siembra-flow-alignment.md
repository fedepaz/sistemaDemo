# Siembra Flow Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the entire siembra flow with the simplified backend by removing `f_siembra`, `cantidadGrs`, `ajuste` from the schema, auto-setting `f_siembra` on the backend, and showing `semEntrega` in the siembra table.

**Architecture:** Remove 3 fields from the shared Zod schema, update the backend to auto-set the sowing date, add `semEntrega` to the siembra DTO/interface, replace `fechaSiembraReal` column with `semEntrega`, and update the aSembrar confirmation dialog summary.

**Tech Stack:** Zod (shared schemas), NestJS (backend services), React + TanStack Table (frontend columns), Jest + React Testing Library (tests)

## Global Constraints

- Legacy database uses raw MySQL queries (not Prisma)
- All data types must be in `packages/shared/src/schemas/`
- Conventional Commits enforced by commitlint
- TDD: tests before feature code
- Verification: `pnpm lint && pnpm type-check && pnpm test`

---

### Task 1: Update Shared Schemas

**Files:**
- Modify: `packages/shared/src/schemas/partidas.schema.ts:36-64`
- Modify: `packages/shared/src/schemas/siembra.schema.ts:5-19`
- Modify: `packages/shared/src/schemas/__tests__/partidas.schema.spec.ts:90-149`

**Interfaces:**
- Consumes: nothing
- Produces: `AsignarUbiSiembraDtoSchema` without `f_siembra`/`cantidadGrs`/`ajuste`, `SiembraDtoSchema` with `semEntrega`

- [ ] **Step 1: Write failing test for removed fields**

In `packages/shared/src/schemas/__tests__/partidas.schema.spec.ts`, update the `AsignarUbiSiembraDtoSchema` describe block:

```typescript
describe("AsignarUbiSiembraDtoSchema", () => {
  const valid = {
    partidaId: 1,
    anio: 2026,
    indice: 1,
    cg: 92,
    cantidaNroCont: 120,
    detalleExtendido: "Test",
    lote: 1001,
    anoLote: 2025,
    item: 1,
    semxgr: 2352,
  };

  it("accepts valid assignment without f_siembra, cantidadGrs, ajuste", () => {
    const result = AsignarUbiSiembraDtoSchema.parse(valid);
    expect(result.partidaId).toBe(1);
    expect(result.cg).toBe(92);
    expect(result.cantidaNroCont).toBe(120);
    expect(result).not.toHaveProperty("f_siembra");
    expect(result).not.toHaveProperty("cantidadGrs");
    expect(result).not.toHaveProperty("ajuste");
  });

  it("applies default values for omitted fields", () => {
    const { detalleExtendido: _, ...validWithoutDetalle } = valid;
    const result = AsignarUbiSiembraDtoSchema.parse(validWithoutDetalle);
    expect(result.detalleExtendido).toBe("");
  });

  it("rejects negative cg", () => {
    expect(() =>
      AsignarUbiSiembraDtoSchema.parse({ ...valid, cg: -1 }),
    ).toThrow();
  });

  it("rejects non-integer cg", () => {
    expect(() =>
      AsignarUbiSiembraDtoSchema.parse({ ...valid, cg: 1.5 }),
    ).toThrow();
  });

  it("rejects detalleExtendido longer than 5000 characters", () => {
    expect(() =>
      AsignarUbiSiembraDtoSchema.parse({ ...valid, detalleExtendido: "a".repeat(5001) }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @vivero/shared test`
Expected: FAIL — `f_siembra`, `cantidadGrs`, `ajuste` still exist in schema

- [ ] **Step 3: Remove fields from AsignarUbiSiembraDtoSchema**

In `packages/shared/src/schemas/partidas.schema.ts`, remove lines 49-63 (the `f_siembra`, `ajuste`, `cantidadGrs` field definitions):

```typescript
export const AsignarUbiSiembraDtoSchema = PartidaHeaderSchema.extend({
  cg: z
    .number({ message: "Debe seleccionar una ubicación válida" })
    .int({ message: "La ubicación (CG) debe ser un número entero" })
    .positive({ message: "Debe seleccionar una ubicación válida" }),
  cantidaNroCont: z
    .number({
      message: "La cantidad de nro. de contenedor debe ser un número entero",
    })
    .int({
      message: "La cantidad de nro. de contenedor debe ser un número entero",
    })
    .positive({ message: "La cantidad debe ser mayor a 0" }),
  detalleExtendido: z
    .string()
    .max(5000, { message: "El detalle no puede superar los 5000 caracteres" })
    .optional()
    .default(""),
  lote: z.number({ message: "El lote es requerido" }),
  anoLote: z.number({ message: "El año del lote es requerido" }),
  item: z.number({ message: "El item es requerido" }),
  semxgr: z.number({ message: "Las semillas por gramo son requeridas" }),
  edita: z.string().optional(),
});
```

- [ ] **Step 4: Add semEntrega to SiembraDtoSchema**

In `packages/shared/src/schemas/siembra.schema.ts`, add `semEntrega`:

```typescript
export const SiembraDtoSchema = LegacyHeaderSchema.extend({
  propiedad: z.string(),
  injerto: z.string(),
  nrocont: z.string(),
  sem_siembra: z.string(),
  fechaSugeridaSiembra: z.string(),
  fechaSiembraReal: z.string(),
  semEntrega: z.string(),
  lote: z.string(),
  anoLote: z.string(),
  item: z.number(),
  semxgr: z.string(),
  c: z.string(),
  g: z.string(),
});
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @vivero/shared test`
Expected: PASS

- [ ] **Step 6: Run type-check**

Run: `pnpm --filter @vivero/shared type-check`
Expected: PASS

---

### Task 2: Update Backend Interface and Service

**Files:**
- Modify: `apps/backend/src/modules/legacy/siembra/interfaces/siembra.interface.ts:5-24`
- Modify: `apps/backend/src/modules/legacy/siembra/siembra.service.ts:32-63`

**Interfaces:**
- Consumes: `SiembraDto` with `semEntrega` from Task 1
- Produces: `LegacySiembra` with `semEntrega`, `mapToDto` mapping `semEntrega`

- [ ] **Step 1: Add semEntrega to LegacySiembra interface**

In `apps/backend/src/modules/legacy/siembra/interfaces/siembra.interface.ts`:

```typescript
export interface LegacySiembra extends RowDataPacket {
  partida: number;
  ano: number;
  indice: number;
  planta: string;
  nombre: string;
  propiedad: string;
  injerto: string;
  nrocont: string;
  sem_siembra: string;
  f_siem: string;
  f_siembra: string;
  semEntrega: string;
  lote: string;
  ano_lote: string;
  item: number;
  semxgr: string;
  c: string;
  g: string;
}
```

- [ ] **Step 2: Add semEntrega mapping to mapToDto**

In `apps/backend/src/modules/legacy/siembra/siembra.service.ts`, update the `mapToDto` return:

```typescript
return {
  partidaId: mappedRow.partidaId,
  anio: mappedRow.anio,
  indice: mappedRow.indice,
  codigoEspecie: mappedRow.codigoEspecie,
  nombreEspecie: mappedRow.nombreEspecie,
  propiedad: row.propiedad,
  injerto: row.injerto,
  nrocont: row.nrocont,
  sem_siembra: row.sem_siembra,
  fechaSugeridaSiembra: row.f_siem,
  fechaSiembraReal: row.f_siembra,
  semEntrega: row.semEntrega,
  lote: row.lote,
  anoLote: row.ano_lote,
  item: row.item,
  semxgr: row.semxgr,
  c: row.c,
  g: row.g,
};
```

- [ ] **Step 3: Run backend type-check**

Run: `pnpm --filter backend type-check`
Expected: PASS

---

### Task 3: Update Backend Partidas Service and Repository

**Files:**
- Modify: `apps/backend/src/modules/legacy/partidas/partidas.service.ts:217-314`
- Modify: `apps/backend/src/modules/legacy/partidas/repositories/partidas.repository.ts:134-174`

**Interfaces:**
- Consumes: `AsignarUbiSiembraCompletaDto` without `f_siembra`/`cantidadGrs`/`ajuste` from Task 1
- Produces: `completarSiembraLegacy` auto-sets `f_siembra`, `asignarSiembra` updated signature

- [ ] **Step 1: Update completarSiembraLegacy to auto-set f_siembra**

In `apps/backend/src/modules/legacy/partidas/partidas.service.ts`, update the `legacyData` object:

```typescript
const legacyData = {
  partida: data.partidaId,
  ano: data.anio,
  indice: data.indice,
  f_siembra: new Date(),
  cg: data.cg,
  cantidaNroCont: data.cantidaNroCont,
  lote: data.lote,
  anoLote: data.anoLote,
  item: data.item,
  semxgr: data.semxgr,
  detalle: data.detalleExtendido,
};
```

- [ ] **Step 2: Update asignarSiembra repository signature**

In `apps/backend/src/modules/legacy/partidas/repositories/partidas.repository.ts`, update the method signature and SQL:

```typescript
async asignarSiembra(data: {
  partida: number;
  ano: number;
  indice: number;
  f_siembra: Date;
  cg: number;
  cantidaNroCont: number;
  lote: number;
  anoLote: number;
  item: number;
  semxgr: number;
  detalle?: string;
}): Promise<void> {
  await this.legacyDb.transaction(async (conn) => {
    const parsedDate = new Date(data.f_siembra);

    const updatePartidasSql = `UPDATE partidas SET f_siembra = ?, cg = ?, con = ?, extendido = ? WHERE partida = ? AND ano = ? AND indice = ?`;
    const updatePartidas1Sql = `UPDATE partidas1 SET c = ?, g = ? WHERE lote = ? AND ano_lote= ? AND item= ?`;

    await conn.query(updatePartidasSql, [
      parsedDate.toISOString().slice(0, 10),
      data.cg,
      data.cantidaNroCont,
      data.detalle,
      data.partida,
      data.ano,
      data.indice,
    ]);
    await conn.query(updatePartidas1Sql, [
      data.semxgr,
      data.semxgr,
      data.lote,
      data.anoLote,
      data.item,
    ]);
  });
}
```

- [ ] **Step 3: Run backend type-check**

Run: `pnpm --filter backend type-check`
Expected: PASS

---

### Task 4: Update Frontend Siembra Columns

**Files:**
- Modify: `apps/frontend/src/features/siembra/components/columns.tsx:208-223`

**Interfaces:**
- Consumes: `SiembraDto` with `semEntrega` from Task 1
- Produces: `semEntrega` column definition

- [ ] **Step 1: Replace fechaSiembraReal column with semEntrega**

In `apps/frontend/src/features/siembra/components/columns.tsx`, replace the last column (lines 208-222):

```typescript
    {
      accessorKey: "semEntrega",
      header: ({ column }) => {
        return <SortableHeader column={column}>Sem Entrega</SortableHeader>;
      },
      cell: ({ row }) => (
        <span className="text-sm font-semibold">{row.original.semEntrega || "-"}</span>
      ),
    },
```

- [ ] **Step 2: Update export columns**

In the same file, replace the `fechaSiembraReal` export column:

```typescript
  {
    accessorKey: "semEntrega",
    exportHeader: "Sem. Entrega",
    pdfWidth: "13%",
  },
```

- [ ] **Step 3: Run frontend type-check**

Run: `pnpm --filter frontend type-check`
Expected: PASS

---

### Task 5: Update Frontend aSembrar Data Table

**Files:**
- Modify: `apps/frontend/src/features/aSembrar/components/a-sembrar-data-table.tsx:45-68`
- Modify: `apps/frontend/src/features/aSembrar/components/a-sembrar-data-table.tsx:116`
- Modify: `apps/frontend/src/features/aSembrar/components/__tests__/a-sembrar-data-table.test.tsx:70-125`

**Interfaces:**
- Consumes: `AsignarUbiSiembraCompletaDto` without `f_siembra`/`cantidadGrs`/`ajuste` from Task 1
- Produces: updated `handleEdit` form reset, updated `summaryFields`

- [ ] **Step 1: Update handleEdit form reset**

In `apps/frontend/src/features/aSembrar/components/a-sembrar-data-table.tsx`, remove `f_siembra`, `ajuste`, `cantidadGrs` from `formCompletar.reset`:

```typescript
formCompletar.reset({
  partidaId: row.partidaId,
  anio: row.anio,
  indice: row.indice,
  cantidaNroCont: row.cantidaNroCont ?? 0,
  detalleExtendido: row.detalleExtendido ?? "",
  edita: "S",
  lote: row.lote ?? 0,
  anoLote: row.anoLote ?? 0,
  item: row.item ?? 0,
  semxgr: row.semxgr ?? 0,
  cg: row.cg ?? 0,
  prensadoSemilla: row.prensadoSemilla,
  profundidadSemilla: row.profundidadSemilla,
  metodoMaquina: row.metodoMaquina,
  tratamientoSemilla: row.tratamientoSemilla,
  entityId: entity.id,
});
```

- [ ] **Step 2: Update summaryFields**

In the same file, update the `confirm.summaryFields` array:

```typescript
summaryFields: ["cg", "cantidaNroCont", "prensadoSemilla", "profundidadSemilla", "tratamientoSemilla", "metodoMaquina", "detalleExtendido"],
```

- [ ] **Step 3: Update test mock data and assertions**

In `apps/frontend/src/features/aSembrar/components/__tests__/a-sembrar-data-table.test.tsx`, update `mockPartidas` to remove `f_siembra`, `cantidadGrs`, `ajuste`:

```typescript
const mockPartidas: SiembraPartidaDto[] = [
  {
    id: "1",
    partidaId: 1,
    anio: 2024,
    indice: 1,
    cg: "5",
    cantidaNroCont: "100",
    prensadoSemilla: "Si",
    profundidadSemilla: "3cm",
    tratamientoSemilla: "Tratamiento A",
    metodoMaquina: "Manual",
    detalleExtendido: "Detalle test",
    lote: 1,
    anoLote: 2024,
    item: 1,
    semxgr: 10,
    createdAt: "2024-03-15T10:00:00Z",
  } as SiembraPartidaDto,
];
```

Update the `summaryFields` assertion:

```typescript
expect(capturedProps.confirm.summaryFields).toEqual([
  "cg",
  "cantidaNroCont",
  "prensadoSemilla",
  "profundidadSemilla",
  "tratamientoSemilla",
  "metodoMaquina",
  "detalleExtendido",
]);
```

- [ ] **Step 4: Run frontend tests**

Run: `pnpm --filter frontend test`
Expected: PASS

---

### Task 6: Full Verification

- [ ] **Step 1: Run lint**

Run: `pnpm lint`
Expected: PASS (0 errors)

- [ ] **Step 2: Run type-check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 3: Run all tests**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 4: Run integration tests**

Run: `pnpm --filter backend test:integration`
Expected: PASS
