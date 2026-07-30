# Alerts SQL Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded mock data with real SQL queries and update DTOs/interfaces/columns to match.

**Architecture:** Shared DTOs (Zod schemas) are the foundation. Backend interfaces match SQL output. Repository executes SQL via LegacyMysqlService. Service maps legacy rows to shared DTOs. Frontend columns consume shared DTOs.

**Tech Stack:** Zod, mysql2, NestJS, React, TanStack Table

## Global Constraints

- Spanish-only UI strings
- Conventional Commits enforced by commitlint
- TDD: tests before implementation code
- Follow existing patterns: LegacyMysqlService for DB queries, Zod schemas for DTOs
- Decimal fields (`pr`, `stIniPr`) use `z.string()` to avoid floating-point precision issues
- SQL conditions as-is from the senior's queries (ano>2025, WEEK(CURRENT_DATE()), etc.)

---

### Task 1: Update shared DTOs and Zod schemas

**Files:**
- Modify: `packages/shared/src/schemas/alerts.schema.ts`
- Modify: `packages/shared/src/schemas/__tests__/alerts.schema.spec.ts`

**Interfaces:**
- Consumes: nothing (foundation task)
- Produces: Updated `SiembraRetrasadaDto`, `FaltaGerminacionDto`, `FaltantePlantasDto`, `FaltaPreExpedicionDto` types and schemas

- [ ] **Step 1: Update SiembraRetrasadaDtoSchema**

Replace the existing schema in `packages/shared/src/schemas/alerts.schema.ts`:

```typescript
export const SiembraRetrasadaDtoSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
  injerto: z.string(),
  nrocont: z.string(),
  contenedor: z.string(),
  semSiembra: z.string(),
  fechaSugeridaSiembra: z.string(),
  fSiembra: z.number(),
  semEntrega: z.string(),
  fEnt: z.string(),
  estado: z.string(),
});
```

- [ ] **Step 2: Update FaltaGerminacionDtoSchema**

```typescript
export const FaltaGerminacionDtoSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
  injerto: z.string(),
  nrocont: z.string(),
  contenedor: z.string(),
  fPrimer: z.string(),
  pr: z.string(),
});
```

- [ ] **Step 3: Update FaltantePlantasDtoSchema**

```typescript
export const FaltantePlantasDtoSchema = z.object({
  hai: z.string(),
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
  nrocont: z.string(),
  contenedor: z.string(),
  solicito: z.number(),
  fPrimer: z.string(),
  pr: z.string(),
  stIniPr: z.string(),
  porPr: z.number(),
});
```

- [ ] **Step 4: Update FaltaPreExpedicionDtoSchema**

```typescript
export const FaltaPreExpedicionDtoSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
  injerto: z.string(),
  nrocont: z.string(),
  contenedor: z.string(),
  fPreexp: z.string(),
  pe: z.number(),
});
```

- [ ] **Step 5: Update schema tests**

Replace the test file `packages/shared/src/schemas/__tests__/alerts.schema.spec.ts`:

```typescript
import {
  SiembraRetrasadaDtoSchema,
  FaltaGerminacionDtoSchema,
  FaltantePlantasDtoSchema,
  FaltaPreExpedicionDtoSchema,
} from '../alerts.schema';

describe('SiembraRetrasadaDtoSchema', () => {
  const valid = {
    partidaId: 1045,
    anio: 2026,
    indice: 1,
    codigoEspecie: 'EUC01',
    nombreEspecie: 'Eucalipto Grandis',
    injerto: 'I001',
    nrocont: '48',
    contenedor: 'Ban Plastico',
    semSiembra: '24-2026',
    fechaSugeridaSiembra: '2026-06-01',
    fSiembra: 0,
    semEntrega: '28-2026 1',
    fEnt: '2026-07-15',
    estado: 'PENDIENTE',
  };

  it('accepts valid siembra retrasada', () => {
    const result = SiembraRetrasadaDtoSchema.parse(valid);
    expect(result.partidaId).toBe(1045);
    expect(result.codigoEspecie).toBe('EUC01');
    expect(result.estado).toBe('PENDIENTE');
  });

  it('rejects missing required fields', () => {
    expect(() => SiembraRetrasadaDtoSchema.parse({ partidaId: 1 })).toThrow();
  });
});

describe('FaltaGerminacionDtoSchema', () => {
  const valid = {
    partidaId: 1050,
    anio: 2026,
    indice: 1,
    codigoEspecie: 'ROS01',
    nombreEspecie: 'Rosa Hybrid Tea',
    injerto: 'I002',
    nrocont: '104',
    contenedor: 'Bandeja 104',
    fPrimer: '2026-07-01',
    pr: '0',
  };

  it('accepts valid falta germinacion', () => {
    const result = FaltaGerminacionDtoSchema.parse(valid);
    expect(result.pr).toBe('0');
    expect(result.fPrimer).toBe('2026-07-01');
  });

  it('rejects missing required fields', () => {
    const { pr, ...withoutPr } = valid;
    expect(() => FaltaGerminacionDtoSchema.parse(withoutPr)).toThrow();
  });
});

describe('FaltantePlantasDtoSchema', () => {
  const valid = {
    hai: 'A',
    partidaId: 1048,
    anio: 2026,
    indice: 1,
    codigoEspecie: 'EUC01',
    nombreEspecie: 'Eucalipto Grandis',
    nrocont: '500',
    contenedor: 'Ban Plastico',
    solicito: 500,
    fPrimer: '2026-06-15',
    pr: '85.5',
    stIniPr: '4',
    porPr: 171,
  };

  it('accepts valid faltante plantas', () => {
    const result = FaltantePlantasDtoSchema.parse(valid);
    expect(result.solicito).toBe(500);
    expect(result.pr).toBe('85.5');
    expect(result.porPr).toBe(171);
  });

  it('rejects missing required fields', () => {
    const { solicito, ...withoutSolicitadas } = valid;
    expect(() => FaltantePlantasDtoSchema.parse(withoutSolicitadas)).toThrow();
  });
});

describe('FaltaPreExpedicionDtoSchema', () => {
  const valid = {
    partidaId: 1052,
    anio: 2026,
    indice: 1,
    codigoEspecie: 'LIM02',
    nombreEspecie: 'Limonero Volkameriano',
    injerto: 'I003',
    nrocont: '96',
    contenedor: 'Ban Plastico',
    fPreexp: '2026-07-20',
    pe: 0,
  };

  it('accepts valid falta pre-expedicion', () => {
    const result = FaltaPreExpedicionDtoSchema.parse(valid);
    expect(result.fPreexp).toBe('2026-07-20');
    expect(result.pe).toBe(0);
  });

  it('rejects missing required fields', () => {
    const { fPreexp, ...withoutFecha } = valid;
    expect(() => FaltaPreExpedicionDtoSchema.parse(withoutFecha)).toThrow();
  });
});
```

- [ ] **Step 6: Run shared tests**

Run: `pnpm --filter @vivero/shared test`
Expected: PASS

- [ ] **Step 7: Build shared package**

Run: `pnpm --filter @vivero/shared build`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add packages/shared/src/schemas/alerts.schema.ts packages/shared/src/schemas/__tests__/alerts.schema.spec.ts
git commit -m "feat(shared): update alert DTOs to match SQL query output"
```

---

### Task 2: Update backend (interfaces + repository + service)

**Files:**
- Modify: `apps/backend/src/modules/legacy/alerts/interfaces/alerts.interface.ts`
- Modify: `apps/backend/src/modules/legacy/alerts/repositories/alerts.repository.ts`
- Modify: `apps/backend/src/modules/legacy/alerts/alerts.service.ts`
- Modify: `apps/backend/src/modules/legacy/alerts/alerts.module.ts`

**Interfaces:**
- Consumes: Updated shared DTOs from Task 1, `LegacyMysqlService` from `apps/backend/src/infra/legacy-mysql/legacy-mysql.service.ts`
- Produces: Updated repository methods, service mappers

- [ ] **Step 1: Update legacy interfaces**

Replace `apps/backend/src/modules/legacy/alerts/interfaces/alerts.interface.ts`:

```typescript
import { RowDataPacket } from 'mysql2/promise';

export interface LegacySiembraRetrasada extends RowDataPacket {
  partida: number;
  ano: number;
  indice: number;
  espvar: string;
  nombre: string;
  injerto: string;
  nrocont: string;
  contenedor: string;
  semSiembra: string;
  f_siem: string;
  f_siembra: number;
  semEntrega: string;
  f_ent: string;
  estado: string;
}

export interface LegacyFaltaGerminacion extends RowDataPacket {
  partida: number;
  ano: number;
  indice: number;
  espvar: string;
  nombre: string;
  injerto: string;
  nrocont: string;
  contenedor: string;
  f_primer: string;
  pr: string;
}

export interface LegacyFaltantePlantas extends RowDataPacket {
  hai: string;
  partida: number;
  ano: number;
  indice: number;
  espvar: string;
  nombre: string;
  nrocont: string;
  contenedor: string;
  solicito: number;
  f_primer: string;
  pr: string;
  st_ini_pr: string;
  porPr: number;
}

export interface LegacyFaltaPreExpedicion extends RowDataPacket {
  partida: number;
  ano: number;
  indice: number;
  espvar: string;
  nombre: string;
  injerto: string;
  nrocont: string;
  contenedor: string;
  f_preexp: string;
  pe: number;
}
```

- [ ] **Step 2: Update repository with real SQL queries**

Replace `apps/backend/src/modules/legacy/alerts/repositories/alerts.repository.ts`:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import {
  LegacySiembraRetrasada,
  LegacyFaltaGerminacion,
  LegacyFaltantePlantas,
  LegacyFaltaPreExpedicion,
} from '../interfaces/alerts.interface';

@Injectable()
export class AlertsRepository {
  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async findSiembraRetrasada(): Promise<LegacySiembraRetrasada[]> {
    return this.legacyDb.query<LegacySiembraRetrasada[]>(
      `SELECT partidas.partida, partidas.ano, partidas.indice,
        partidas.espvar, articulo.nombre, partidas.injerto, partidas.nrocont,
        partidas.contenedor,
        CONCAT(partidas.sem_siem,'-',partidas.ano_siem) AS semSiembra,
        partidas.f_siem, partidas.f_siembra,
        CONCAT(partidas.sem_ent,'-',partidas.ano_ent,' ',partidas.i_f) AS semEntrega,
        partidas.f_ent, partidas.estado
      FROM partidas
      LEFT JOIN articulo ON articulo.codigo=CONCAT(partidas.espvar,partidas.contenedor)
      WHERE estado <> 'ANULADA' AND f_siembra=0 AND partidas.hai<>'A'
        AND partidas.sem_siem=WEEK(CURRENT_DATE()) AND partidas.ano>2025
      ORDER BY partidas.ano, partidas.partida`,
    );
  }

  async findFaltaGerminacion(): Promise<LegacyFaltaGerminacion[]> {
    return this.legacyDb.query<LegacyFaltaGerminacion[]>(
      `SELECT partidas.partida, partidas.ano, partidas.indice,
        partidas.espvar, articulo.nombre, partidas.injerto, partidas.nrocont,
        partidas.contenedor, partidas.f_primer, partidas.pr
      FROM partidas
      LEFT JOIN articulo ON articulo.codigo=CONCAT(partidas.espvar,partidas.contenedor)
      WHERE partidas.f_primer<=CURRENT_DATE() AND estado <> 'ANULADA'
        AND pr=0 AND partidas.hai<>'A' AND partidas.ano>2025
      ORDER BY partidas.ano, partidas.partida`,
    );
  }

  async findFaltantePlantas(): Promise<LegacyFaltantePlantas[]> {
    return this.legacyDb.query<LegacyFaltantePlantas[]>(
      `SELECT partidas.hai, partidas.partida, partidas.ano, partidas.indice,
        partidas.espvar, articulo.nombre, partidas.nrocont, partidas.solicito,
        partidas.contenedor, partidas.f_primer, partidas.pr, partidas.st_ini_pr,
        FLOOR(partidas.pr*partidas.cant_s/100)*partidas.st_ini_pr AS porPr
      FROM partidas
      LEFT JOIN articulo ON articulo.codigo=CONCAT(partidas.espvar,partidas.contenedor)
      WHERE estado <> 'ANULADA' AND pr<>0 AND pe=0
        AND partidas.solicito>FLOOR(partidas.pr*partidas.cant_s/100)*partidas.st_ini_pr
        AND partidas.hai<>'A' AND partidas.ano>2025
      ORDER BY partidas.ano, partidas.partida, partidas.indice`,
    );
  }

  async findFaltaPreExpedicion(): Promise<LegacyFaltaPreExpedicion[]> {
    return this.legacyDb.query<LegacyFaltaPreExpedicion[]>(
      `SELECT partidas.partida, partidas.ano, partidas.indice,
        partidas.espvar, articulo.nombre, partidas.injerto, partidas.nrocont,
        partidas.contenedor, partidas.f_preexp, partidas.pe
      FROM partidas
      LEFT JOIN articulo ON articulo.codigo=CONCAT(partidas.espvar,partidas.contenedor)
      WHERE partidas.f_preexp<=CURRENT_DATE() AND estado <> 'ANULADA'
        AND pe=0 AND partidas.hai<>'A' AND partidas.ano>2025
      ORDER BY partidas.ano, partidas.partida`,
    );
  }
}
```

- [ ] **Step 3: Update service mappers**

Replace `apps/backend/src/modules/legacy/alerts/alerts.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { AlertsRepository } from './repositories/alerts.repository';
import {
  LegacySiembraRetrasada,
  LegacyFaltaGerminacion,
  LegacyFaltantePlantas,
  LegacyFaltaPreExpedicion,
} from './interfaces/alerts.interface';
import {
  SiembraRetrasadaDto,
  FaltaGerminacionDto,
  FaltantePlantasDto,
  FaltaPreExpedicionDto,
} from '@vivero/shared';

@Injectable()
export class AlertsService {
  constructor(private readonly alertsRepo: AlertsRepository) {}

  private mapSiembraRetrasada(
    row: LegacySiembraRetrasada,
  ): SiembraRetrasadaDto {
    return {
      partidaId: row.partida,
      anio: row.ano,
      indice: row.indice,
      codigoEspecie: row.espvar,
      nombreEspecie: row.nombre,
      injerto: row.injerto,
      nrocont: row.nrocont,
      contenedor: row.contenedor,
      semSiembra: row.semSiembra,
      fechaSugeridaSiembra: row.f_siem,
      fSiembra: row.f_siembra,
      semEntrega: row.semEntrega,
      fEnt: row.f_ent,
      estado: row.estado,
    };
  }

  private mapFaltaGerminacion(
    row: LegacyFaltaGerminacion,
  ): FaltaGerminacionDto {
    return {
      partidaId: row.partida,
      anio: row.ano,
      indice: row.indice,
      codigoEspecie: row.espvar,
      nombreEspecie: row.nombre,
      injerto: row.injerto,
      nrocont: row.nrocont,
      contenedor: row.contenedor,
      fPrimer: row.f_primer,
      pr: row.pr,
    };
  }

  private mapFaltantePlantas(row: LegacyFaltantePlantas): FaltantePlantasDto {
    return {
      hai: row.hai,
      partidaId: row.partida,
      anio: row.ano,
      indice: row.indice,
      codigoEspecie: row.espvar,
      nombreEspecie: row.nombre,
      nrocont: row.nrocont,
      contenedor: row.contenedor,
      solicito: row.solicito,
      fPrimer: row.f_primer,
      pr: row.pr,
      stIniPr: row.st_ini_pr,
      porPr: row.porPr,
    };
  }

  private mapFaltaPreExpedicion(
    row: LegacyFaltaPreExpedicion,
  ): FaltaPreExpedicionDto {
    return {
      partidaId: row.partida,
      anio: row.ano,
      indice: row.indice,
      codigoEspecie: row.espvar,
      nombreEspecie: row.nombre,
      injerto: row.injerto,
      nrocont: row.nrocont,
      contenedor: row.contenedor,
      fPreexp: row.f_preexp,
      pe: row.pe,
    };
  }

  async getSiembraRetrasada(): Promise<SiembraRetrasadaDto[]> {
    const rows = await this.alertsRepo.findSiembraRetrasada();
    return rows.map((row) => this.mapSiembraRetrasada(row));
  }

  async getFaltaGerminacion(): Promise<FaltaGerminacionDto[]> {
    const rows = await this.alertsRepo.findFaltaGerminacion();
    return rows.map((row) => this.mapFaltaGerminacion(row));
  }

  async getFaltantePlantas(): Promise<FaltantePlantasDto[]> {
    const rows = await this.alertsRepo.findFaltantePlantas();
    return rows.map((row) => this.mapFaltantePlantas(row));
  }

  async getFaltaPreExpedicion(): Promise<FaltaPreExpedicionDto[]> {
    const rows = await this.alertsRepo.findFaltaPreExpedicion();
    return rows.map((row) => this.mapFaltaPreExpedicion(row));
  }
}
```

- [ ] **Step 4: Verify module has LegacyMysqlModule**

Check `apps/backend/src/modules/legacy/alerts/alerts.module.ts`. The `LegacyMysqlModule` is imported globally in `app.module.ts` (line 85), so `LegacyMysqlService` should be available. No changes needed to the module file.

- [ ] **Step 5: Run type-check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/modules/legacy/alerts/interfaces/alerts.interface.ts apps/backend/src/modules/legacy/alerts/repositories/alerts.repository.ts apps/backend/src/modules/legacy/alerts/alerts.service.ts
git commit -m "feat(backend): replace alert mocks with real SQL queries"
```

---

### Task 3: Update frontend columns and export columns

**Files:**
- Modify: `apps/frontend/src/features/alerts/components/shared/alert-columns.tsx`

**Interfaces:**
- Consumes: Updated shared DTOs from Task 1
- Produces: Updated column definitions for TanStack Table

- [ ] **Step 1: Update alert-columns.tsx**

Replace `apps/frontend/src/features/alerts/components/shared/alert-columns.tsx`:

```typescript
"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import type { ExportColumn } from "@/lib/export/types";
import {
  SiembraRetrasadaDto,
  FaltaGerminacionDto,
  FaltantePlantasDto,
  FaltaPreExpedicionDto,
} from "@vivero/shared";

// ============================================================================
// SIEMBRA RETRASADA
// ============================================================================

export const siembraRetrasadaColumns: ColumnDef<SiembraRetrasadaDto>[] = [
  {
    accessorKey: "partidaId",
    header: ({ column }) => (
      <SortableHeader column={column}>Partida</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="font-black text-sm text-foreground/80 tracking-tight">
        #{row.original.partidaId}
        {row.original.indice !== 0 && `/ ${row.original.indice}`}
      </div>
    ),
    size: 70,
  },
  {
    accessorKey: "codigoEspecie",
    header: ({ column }) => (
      <SortableHeader column={column}>Código</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm">
        {row.original.codigoEspecie}
      </span>
    ),
  },
  {
    accessorKey: "nombreEspecie",
    header: ({ column }) => (
      <SortableHeader column={column}>Especie</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">{row.original.nombreEspecie}</span>
    ),
  },
  {
    accessorKey: "injerto",
    header: ({ column }) => (
      <SortableHeader column={column}>Injerto</SortableHeader>
    ),
  },
  {
    accessorKey: "nrocont",
    header: ({ column }) => (
      <SortableHeader column={column}>Nro Contenedor</SortableHeader>
    ),
  },
  {
    accessorKey: "contenedor",
    header: ({ column }) => (
      <SortableHeader column={column}>Contenedor</SortableHeader>
    ),
    size: 100,
  },
  {
    accessorKey: "semSiembra",
    header: ({ column }) => (
      <SortableHeader column={column}>Sem Siembra</SortableHeader>
    ),
  },
  {
    accessorKey: "fechaSugeridaSiembra",
    header: ({ column }) => (
      <SortableHeader column={column}>Fecha Sug. Siembra</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-bold font-mono text-muted-foreground">
        {row.original.fechaSugeridaSiembra}
      </span>
    ),
  },
  {
    accessorKey: "semEntrega",
    header: ({ column }) => (
      <SortableHeader column={column}>Sem Entrega</SortableHeader>
    ),
  },
  {
    accessorKey: "estado",
    header: ({ column }) => (
      <SortableHeader column={column}>Estado</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-bold uppercase tracking-wider">
        {row.original.estado}
      </span>
    ),
  },
];

// ============================================================================
// FALTA RECUENTO GERMINACION
// ============================================================================

export const faltaGerminacionColumns: ColumnDef<FaltaGerminacionDto>[] = [
  {
    accessorKey: "partidaId",
    header: ({ column }) => (
      <SortableHeader column={column}>Partida</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="font-black text-sm text-foreground/80 tracking-tight">
        #{row.original.partidaId}
        {row.original.indice !== 0 && `/ ${row.original.indice}`}
      </div>
    ),
    size: 70,
  },
  {
    accessorKey: "codigoEspecie",
    header: ({ column }) => (
      <SortableHeader column={column}>Código</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm">
        {row.original.codigoEspecie}
      </span>
    ),
  },
  {
    accessorKey: "nombreEspecie",
    header: ({ column }) => (
      <SortableHeader column={column}>Especie</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">{row.original.nombreEspecie}</span>
    ),
  },
  {
    accessorKey: "injerto",
    header: ({ column }) => (
      <SortableHeader column={column}>Injerto</SortableHeader>
    ),
  },
  {
    accessorKey: "nrocont",
    header: ({ column }) => (
      <SortableHeader column={column}>Nro Contenedor</SortableHeader>
    ),
  },
  {
    accessorKey: "contenedor",
    header: ({ column }) => (
      <SortableHeader column={column}>Contenedor</SortableHeader>
    ),
    size: 100,
  },
  {
    accessorKey: "fPrimer",
    header: ({ column }) => (
      <SortableHeader column={column}>Fecha Primer</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-bold font-mono text-muted-foreground">
        {row.original.fPrimer}
      </span>
    ),
  },
  {
    accessorKey: "pr",
    header: ({ column }) => (
      <SortableHeader column={column}>PR</SortableHeader>
    ),
  },
];

// ============================================================================
// FALTANTE ESTIMADO DE PLANTAS
// ============================================================================

export const faltantePlantasColumns: ColumnDef<FaltantePlantasDto>[] = [
  {
    accessorKey: "partidaId",
    header: ({ column }) => (
      <SortableHeader column={column}>Partida</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="font-black text-sm text-foreground/80 tracking-tight">
        #{row.original.partidaId}
        {row.original.indice !== 0 && `/ ${row.original.indice}`}
      </div>
    ),
    size: 70,
  },
  {
    accessorKey: "hai",
    header: ({ column }) => (
      <SortableHeader column={column}>HAI</SortableHeader>
    ),
  },
  {
    accessorKey: "codigoEspecie",
    header: ({ column }) => (
      <SortableHeader column={column}>Código</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm">
        {row.original.codigoEspecie}
      </span>
    ),
  },
  {
    accessorKey: "nombreEspecie",
    header: ({ column }) => (
      <SortableHeader column={column}>Especie</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">{row.original.nombreEspecie}</span>
    ),
  },
  {
    accessorKey: "nrocont",
    header: ({ column }) => (
      <SortableHeader column={column}>Nro Contenedor</SortableHeader>
    ),
  },
  {
    accessorKey: "contenedor",
    header: ({ column }) => (
      <SortableHeader column={column}>Contenedor</SortableHeader>
    ),
    size: 100,
  },
  {
    accessorKey: "solicito",
    header: ({ column }) => (
      <SortableHeader column={column}>Solicitadas</SortableHeader>
    ),
    size: 100,
  },
  {
    accessorKey: "pr",
    header: ({ column }) => (
      <SortableHeader column={column}>PR</SortableHeader>
    ),
  },
  {
    accessorKey: "porPr",
    header: ({ column }) => (
      <SortableHeader column={column}>Por PR</SortableHeader>
    ),
    size: 100,
  },
];

// ============================================================================
// FALTA PRE-EXPEDICION
// ============================================================================

export const faltaPreExpedicionColumns: ColumnDef<FaltaPreExpedicionDto>[] = [
  {
    accessorKey: "partidaId",
    header: ({ column }) => (
      <SortableHeader column={column}>Partida</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="font-black text-sm text-foreground/80 tracking-tight">
        #{row.original.partidaId}
        {row.original.indice !== 0 && `/ ${row.original.indice}`}
      </div>
    ),
    size: 70,
  },
  {
    accessorKey: "codigoEspecie",
    header: ({ column }) => (
      <SortableHeader column={column}>Código</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm">
        {row.original.codigoEspecie}
      </span>
    ),
  },
  {
    accessorKey: "nombreEspecie",
    header: ({ column }) => (
      <SortableHeader column={column}>Especie</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">{row.original.nombreEspecie}</span>
    ),
  },
  {
    accessorKey: "injerto",
    header: ({ column }) => (
      <SortableHeader column={column}>Injerto</SortableHeader>
    ),
  },
  {
    accessorKey: "nrocont",
    header: ({ column }) => (
      <SortableHeader column={column}>Nro Contenedor</SortableHeader>
    ),
  },
  {
    accessorKey: "contenedor",
    header: ({ column }) => (
      <SortableHeader column={column}>Contenedor</SortableHeader>
    ),
    size: 100,
  },
  {
    accessorKey: "fPreexp",
    header: ({ column }) => (
      <SortableHeader column={column}>Fecha Pre-Exp</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-bold font-mono text-muted-foreground">
        {row.original.fPreexp}
      </span>
    ),
  },
  {
    accessorKey: "pe",
    header: ({ column }) => (
      <SortableHeader column={column}>PE</SortableHeader>
    ),
  },
];

// ============================================================================
// EXPORT COLUMNS
// ============================================================================

export const siembraRetrasadaExportColumns: ExportColumn<SiembraRetrasadaDto>[] = [
  { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "8%" },
  { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "10%" },
  { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "15%" },
  { accessorKey: "injerto", exportHeader: "Injerto", pdfWidth: "8%" },
  { accessorKey: "contenedor", exportHeader: "Contenedor", pdfWidth: "12%" },
  { accessorKey: "semSiembra", exportHeader: "Sem Siembra", pdfWidth: "10%" },
  { accessorKey: "fechaSugeridaSiembra", exportHeader: "Fecha Sug. Siembra", pdfWidth: "12%" },
  { accessorKey: "semEntrega", exportHeader: "Sem Entrega", pdfWidth: "12%" },
  { accessorKey: "estado", exportHeader: "Estado", pdfWidth: "8%" },
];

export const faltaGerminacionExportColumns: ExportColumn<FaltaGerminacionDto>[] = [
  { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "10%" },
  { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "12%" },
  { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "18%" },
  { accessorKey: "injerto", exportHeader: "Injerto", pdfWidth: "10%" },
  { accessorKey: "contenedor", exportHeader: "Contenedor", pdfWidth: "15%" },
  { accessorKey: "fPrimer", exportHeader: "Fecha Primer", pdfWidth: "15%" },
  { accessorKey: "pr", exportHeader: "PR", pdfWidth: "10%" },
];

export const faltantePlantasExportColumns: ExportColumn<FaltantePlantasDto>[] = [
  { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "8%" },
  { accessorKey: "hai", exportHeader: "HAI", pdfWidth: "6%" },
  { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "10%" },
  { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "15%" },
  { accessorKey: "contenedor", exportHeader: "Contenedor", pdfWidth: "12%" },
  { accessorKey: "solicito", exportHeader: "Solicitadas", pdfWidth: "10%" },
  { accessorKey: "pr", exportHeader: "PR", pdfWidth: "10%" },
  { accessorKey: "porPr", exportHeader: "Por PR", pdfWidth: "10%" },
];

export const faltaPreExpedicionExportColumns: ExportColumn<FaltaPreExpedicionDto>[] = [
  { accessorKey: "partidaId", exportHeader: "Partida", pdfWidth: "10%" },
  { accessorKey: "codigoEspecie", exportHeader: "Código", pdfWidth: "12%" },
  { accessorKey: "nombreEspecie", exportHeader: "Especie", pdfWidth: "18%" },
  { accessorKey: "injerto", exportHeader: "Injerto", pdfWidth: "10%" },
  { accessorKey: "contenedor", exportHeader: "Contenedor", pdfWidth: "15%" },
  { accessorKey: "fPreexp", exportHeader: "Fecha Pre-Exp", pdfWidth: "15%" },
  { accessorKey: "pe", exportHeader: "PE", pdfWidth: "10%" },
];
```

- [ ] **Step 2: Run type-check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 4: Run full test suite**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/alerts/components/shared/alert-columns.tsx
git commit -m "feat(ui): update alert columns to match new DTO shapes"
```
