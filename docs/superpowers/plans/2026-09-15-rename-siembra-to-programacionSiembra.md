# Rename siembra → programacionSiembra Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the "siembra" entity/feature to "programacionSiembra" across the entire stack — backend module, shared schemas, frontend features, and permissions.

**Architecture:** Systematic rename across three layers (shared → backend → frontend). File renames use `git mv` to preserve history. All changes are code-only — no database migrations, no git commits.

**Tech Stack:** NestJS, Prisma, Next.js, Zod, TypeScript

## Global Constraints

- No database migrations — code references existing columns only
- No git commits — user handles commits manually
- Database column names (`f_siembra`, `sem_siembra`) stay as-is
- `siembraPartidas` module names stay — only permission references update
- Alerts `siembra-retrasada` endpoint stays unchanged
- User-facing Spanish toast messages stay unchanged

---

## Task 1: Shared Package — Rename Schema

**Files:**
- Rename: `packages/shared/src/schemas/siembra.schema.ts` → `packages/shared/src/schemas/programacionSiembra.schema.ts`
- Rename: `packages/shared/src/schemas/__tests__/siembra.schema.spec.ts` → `packages/shared/src/schemas/__tests__/programacionSiembra.schema.spec.ts`
- Modify: `packages/shared/src/index.ts:19`

**Steps:**

- [ ] **Step 1: Rename the schema file**

```bash
git mv packages/shared/src/schemas/siembra.schema.ts packages/shared/src/schemas/programacionSiembra.schema.ts
```

- [ ] **Step 2: Rename the test file**

```bash
git mv packages/shared/src/schemas/__tests__/siembra.schema.spec.ts packages/shared/src/schemas/__tests__/programacionSiembra.schema.spec.ts
```

- [ ] **Step 3: Update schema file content**

In `packages/shared/src/schemas/programacionSiembra.schema.ts`, rename:
- `SiembraDtoSchema` → `ProgramacionSiembraDtoSchema`
- `SiembraDto` → `ProgramacionSiembraDto`

Keep `TratamientoDtoSchema`, `LegacySustratoDtoSchema` and their types unchanged.

```typescript
// packages/shared/src/schemas/programacionSiembra.schema.ts
import { z } from "zod";
import { LegacyHeaderSchema } from "./legacy-header.schema";

export const ProgramacionSiembraDtoSchema = LegacyHeaderSchema.extend({
  // Datos de la partida
  propiedad: z.string(),
  injerto: z.string(),
  nrocont: z.string(),
  sem_siembra: z.string(),
  fechaSugeridaSiembra: z.string(), // f_siem
  fechaSiembraReal: z.string(), // f_siembra
  semEntrega: z.string(),
  lote: z.string(),
  anoLote: z.string(),
  item: z.number(),
  semxgr: z.string(),
  c: z.string(),
  g: z.string(),
});

export type ProgramacionSiembraDto = z.infer<typeof ProgramacionSiembraDtoSchema>;

export const TratamientoDtoSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
  precio: z.string(),
});

export type TratamientoDto = z.infer<typeof TratamientoDtoSchema>;

export const LegacySustratoDtoSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
  unidad: z.string(),
});

export type LegacySustratoDto = z.infer<typeof LegacySustratoDtoSchema>;
```

- [ ] **Step 4: Update test file content**

In `packages/shared/src/schemas/__tests__/programacionSiembra.schema.spec.ts`, rename:
- Import: `"../siembra.schema"` → `"../programacionSiembra.schema"`
- `SiembraDtoSchema` → `ProgramacionSiembraDtoSchema`
- `describe('SiembraDtoSchema')` → `describe('ProgramacionSiembraDtoSchema')`

```typescript
// packages/shared/src/schemas/__tests__/programacionSiembra.schema.spec.ts
import { ProgramacionSiembraDtoSchema } from "../programacionSiembra.schema";

describe("ProgramacionSiembraDtoSchema", () => {
  const valid = {
    partidaId: 1,
    anio: 2026,
    indice: 1,
    codigoEspecie: "ESP001",
    nombreEspecie: "Ave del Paraíso",
    propiedad: "Propiedad A",
    injerto: "Injerto A",
    nrocont: "100",
    sem_siembra: "S1-2026",
    fechaSugeridaSiembra: "2026-07-15",
    fechaSiembraReal: "2026-07-16",
    semEntrega: "SE-001",
    lote: "L001",
    anoLote: "2026",
    item: 1,
    semxgr: "2",
    c: "3",
    g: "4",
  };

  it("accepts valid programacion siembra dto", () => {
    const result = ProgramacionSiembraDtoSchema.parse(valid);
    expect(result.partidaId).toBe(1);
    expect(result.sem_siembra).toBe("S1-2026");
    expect(result.fechaSugeridaSiembra).toBe("2026-07-15");
  });

  it("rejects missing required fields", () => {
    const { partidaId, ...withoutPartidaId } = valid;
    expect(() => ProgramacionSiembraDtoSchema.parse(withoutPartidaId)).toThrow();
  });

  it("rejects missing sem_siembra", () => {
    const { sem_siembra, ...withoutSemSiembra } = valid;
    expect(() => ProgramacionSiembraDtoSchema.parse(withoutSemSiembra)).toThrow();
  });
});
```

- [ ] **Step 5: Update shared index export**

In `packages/shared/src/index.ts`, line 19:
```typescript
// Before:
export * from "./schemas/siembra.schema";
// After:
export * from "./schemas/programacionSiembra.schema";
```

- [ ] **Step 6: Verify shared package builds**

```bash
pnpm --filter @vivero/shared build
```

---

## Task 2: Backend — Rename Legacy Siembra Module

**Files:**
- Rename directory: `apps/backend/src/modules/legacy/siembra/` → `apps/backend/src/modules/legacy/programacionSiembra/`
- Rename all 6 files inside the directory
- Modify: `apps/backend/src/app.module.ts:33,105`

**Steps:**

- [ ] **Step 1: Rename the directory and files**

```bash
git mv apps/backend/src/modules/legacy/siembra apps/backend/src/modules/legacy/programacionSiembra
git mv apps/backend/src/modules/legacy/programacionSiembra/siembra.controller.ts apps/backend/src/modules/legacy/programacionSiembra/programacionSiembra.controller.ts
git mv apps/backend/src/modules/legacy/programacionSiembra/siembra.module.ts apps/backend/src/modules/legacy/programacionSiembra/programacionSiembra.module.ts
git mv apps/backend/src/modules/legacy/programacionSiembra/siembra.service.ts apps/backend/src/modules/legacy/programacionSiembra/programacionSiembra.service.ts
git mv apps/backend/src/modules/legacy/programacionSiembra/interfaces/siembra.interface.ts apps/backend/src/modules/legacy/programacionSiembra/interfaces/programacionSiembra.interface.ts
git mv apps/backend/src/modules/legacy/programacionSiembra/repositories/siembra.repository.ts apps/backend/src/modules/legacy/programacionSiembra/repositories/programacionSiembra.repository.ts
git mv apps/backend/src/modules/legacy/programacionSiembra/__tests__/siembra.service.spec.ts apps/backend/src/modules/legacy/programacionSiembra/__tests__/programacionSiembra.service.spec.ts
```

- [ ] **Step 2: Update interface file**

In `apps/backend/src/modules/legacy/programacionSiembra/interfaces/programacionSiembra.interface.ts`:
- `LegacySiembra` → `LegacyProgramacionSiembra`
- `LegacySiembraFecha` → `LegacyProgramacionSiembraFecha`

```typescript
// apps/backend/src/modules/legacy/programacionSiembra/interfaces/programacionSiembra.interface.ts
import { RowDataPacket } from 'mysql2/promise';

export interface LegacyProgramacionSiembra extends RowDataPacket {
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

export interface LegacyProgramacionSiembraFecha extends RowDataPacket {
  fechaEgreso: string;
}
```

- [ ] **Step 3: Update repository file**

In `apps/backend/src/modules/legacy/programacionSiembra/repositories/programacionSiembra.repository.ts`:
- Import path: `'../interfaces/siembra.interface'` → `'../interfaces/programacionSiembra.interface'`
- `LegacySiembra` → `LegacyProgramacionSiembra`
- `SiembraRepository` → `ProgramacionSiembraRepository`
- `findAllSiembra()` → `findAllProgramacionSiembra()`

```typescript
// apps/backend/src/modules/legacy/programacionSiembra/repositories/programacionSiembra.repository.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import { LegacyProgramacionSiembra } from '../interfaces/programacionSiembra.interface';

@Injectable()
export class ProgramacionSiembraRepository {
  private readonly logger = new Logger(ProgramacionSiembraRepository.name);

  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  async findAllProgramacionSiembra(): Promise<LegacyProgramacionSiembra[]> {
    const sql = `
    SELECT
  p.partida, p.ano, p.indice,
    CONCAT(p.espvar,p.contenedor) AS planta, articulo.nombre,
    p.propiedad,
    p.injerto, 
    p.nrocont,
    CONCAT(p.sem_siem,'-',p.ano_siem) AS sem_siembra, 
    p.f_siem,
    p.f_siembra,
    CONCAT(p.sem_ent,'-',p.ano_ent,' ',p.i_f) AS semEntrega,
    p.item,
    p.f_ent,
    p.estado,
    l.lote,
    l.ano_lote,
    l.semxgr,
    l.c,
    l.g
  FROM partidas p
  LEFT JOIN articulo ON articulo.codigo=CONCAT(p.espvar,p.contenedor)  
  LEFT JOIN partidas1 l
      ON p.partida=l.partida
      AND p.ano=l.ano
      AND p.indice=l.indice
  LEFT JOIN partidas2 p2
      ON p.partida=p2.partida
      AND p.ano=p2.ano
      AND p.indice=p2.indice
  WHERE p.estado <> 'ANULADA' AND p.f_siembra=0 AND p.hai<>'A' 
	AND p.sem_siem<=WEEK(CURRENT_DATE()) AND p.ano>2025
	ORDER BY p.ano, p.partida
  `;
    return this.legacyDb.query<LegacyProgramacionSiembra[]>(sql);
  }
}
```

- [ ] **Step 4: Update service file**

In `apps/backend/src/modules/legacy/programacionSiembra/programacionSiembra.service.ts`:
- Import: `'./interfaces/siembra.interface'` → `'./interfaces/programacionSiembra.interface'`
- Import: `'./repositories/siembra.repository'` → `'./repositories/programacionSiembra.repository'`
- Import type: `SiembraDto` → `ProgramacionSiembraDto` (from `@vivero/shared`)
- `LegacySiembra` → `LegacyProgramacionSiembra`
- `SiembraService` → `ProgramacionSiembraService`
- `SiembraRepository` → `ProgramacionSiembraRepository`
- `siembraRepo` → `programacionSiembraRepo`
- `getAllSiembra()` → `getAllProgramacionSiembra()`
- `findAllSiembra()` → `findAllProgramacionSiembra()`

```typescript
// apps/backend/src/modules/legacy/programacionSiembra/programacionSiembra.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { LegacyProgramacionSiembra } from './interfaces/programacionSiembra.interface';
import { ProgramacionSiembraDto } from '@vivero/shared';
import { ProgramacionSiembraRepository } from './repositories/programacionSiembra.repository';

@Injectable()
export class ProgramacionSiembraService {
  private readonly logger = new Logger(ProgramacionSiembraService.name);
  constructor(private readonly programacionSiembraRepo: ProgramacionSiembraRepository) {}

  private validateHeaderFields(row: Record<string, any>): void {
    const requiredFields = [
      'partidaId',
      'anio',
      'indice',
      'codigoEspecie',
      'nombreEspecie',
    ];
    const missingFields = requiredFields.filter(
      (field) => row[field] === undefined || row[field] === null,
    );

    if (missingFields.length > 0) {
      this.logger.error('Header validation failed for programacion siembra', {
        missingFields,
        availableFields: Object.keys(row),
      });
    }
  }
  private mapToDto(row: LegacyProgramacionSiembra): ProgramacionSiembraDto {
    const mappedRow = {
      partidaId: row.partida,
      anio: row.ano,
      indice: row.indice,
      codigoEspecie: row.planta,
      nombreEspecie: row.nombre,
    };

    this.validateHeaderFields(mappedRow);

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
  }

  async getAllProgramacionSiembra(): Promise<ProgramacionSiembraDto[]> {
    const rows = await this.programacionSiembraRepo.findAllProgramacionSiembra();
    return rows.map((row) => this.mapToDto(row));
  }
}
```

- [ ] **Step 5: Update controller file**

In `apps/backend/src/modules/legacy/programacionSiembra/programacionSiembra.controller.ts`:
- Import: `'./siembra.service'` → `'./programacionSiembra.service'`
- Import type: `SiembraDto` → `ProgramacionSiembraDto` (from `@vivero/shared`)
- `SiembraController` → `ProgramacionSiembraController`
- `SiembraService` → `ProgramacionSiembraService`
- `siembraService` → `programacionSiembraService`
- `@Controller('l-siembra')` → `@Controller('l-programacion-siembra')`
- `tableName: 'siembra'` → `tableName: 'programacion_siembra'`
- `getAllSiembra()` → `getAllProgramacionSiembra()`

```typescript
// apps/backend/src/modules/legacy/programacionSiembra/programacionSiembra.controller.ts
import { Controller, Get } from '@nestjs/common';

import { ProgramacionSiembraDto } from '@vivero/shared';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';
import { ProgramacionSiembraService } from './programacionSiembra.service';

@Controller('l-programacion-siembra')
export class ProgramacionSiembraController {
  constructor(private readonly programacionSiembraService: ProgramacionSiembraService) {}

  @Get()
  @RequirePermission({
    tableName: 'programacion_siembra',
    action: 'read',
    scope: 'ALL',
  })
  async getAllProgramacionSiembra(): Promise<ProgramacionSiembraDto[]> {
    return this.programacionSiembraService.getAllProgramacionSiembra();
  }
}
```

- [ ] **Step 6: Update module file**

In `apps/backend/src/modules/legacy/programacionSiembra/programacionSiembra.module.ts`:
- All imports updated to new names

```typescript
// apps/backend/src/modules/legacy/programacionSiembra/programacionSiembra.module.ts
import { Module } from '@nestjs/common';
import { ProgramacionSiembraController } from './programacionSiembra.controller';
import { ProgramacionSiembraRepository } from './repositories/programacionSiembra.repository';
import { ProgramacionSiembraService } from './programacionSiembra.service';

@Module({
  controllers: [ProgramacionSiembraController],
  providers: [ProgramacionSiembraService, ProgramacionSiembraRepository],
})
export class LegacyProgramacionSiembraModule {}
```

- [ ] **Step 7: Update test file**

In `apps/backend/src/modules/legacy/programacionSiembra/__tests__/programacionSiembra.service.spec.ts`:
- All imports and class names updated

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ProgramacionSiembraService } from '../programacionSiembra.service';
import { ProgramacionSiembraRepository } from '../repositories/programacionSiembra.repository';

describe('ProgramacionSiembraService', () => {
  let service: ProgramacionSiembraService;
  let programacionSiembraRepo: {
    findAllProgramacionSiembra: jest.Mock;
  };

  beforeEach(async () => {
    programacionSiembraRepo = {
      findAllProgramacionSiembra: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramacionSiembraService,
        { provide: ProgramacionSiembraRepository, useValue: programacionSiembraRepo },
      ],
    }).compile();

    service = module.get<ProgramacionSiembraService>(ProgramacionSiembraService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProgramacionSiembra', () => {
    it('should return mapped programacion siembra data', async () => {
      const rows = [
        {
          partida: 1,
          ano: 2024,
          indice: 1,
          planta: 'PIN',
          nombre: 'Pino',
          propiedad: 'Propiedad A',
          injerto: 'No',
          nrocont: '100',
          sem_siembra: 'S1-2024',
          f_siem: '2024-01-15',
          f_siembra: '2024-01-16',
          lote: 'L001',
          ano_lote: '2024',
          semxgr: '2',
          c: '3',
          g: '4',
        },
      ];
      programacionSiembraRepo.findAllProgramacionSiembra.mockResolvedValue(rows);

      const result = await service.getAllProgramacionSiembra();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        partidaId: 1,
        anio: 2024,
        indice: 1,
        codigoEspecie: 'PIN',
        nombreEspecie: 'Pino',
        propiedad: 'Propiedad A',
        injerto: 'No',
        nrocont: '100',
        sem_siembra: 'S1-2024',
        fechaSugeridaSiembra: '2024-01-15',
        fechaSiembraReal: '2024-01-16',
        lote: 'L001',
        anoLote: '2024',
        semxgr: '2',
        c: '3',
        g: '4',
      });
    });

    it('should return empty array when no data', async () => {
      programacionSiembraRepo.findAllProgramacionSiembra.mockResolvedValue([]);

      const result = await service.getAllProgramacionSiembra();

      expect(result).toEqual([]);
    });
  });
});
```

- [ ] **Step 8: Update app.module.ts import**

In `apps/backend/src/app.module.ts`:
- Line 33: `import { LegacySiembraModule } from './modules/legacy/siembra/siembra.module'` → `import { LegacyProgramacionSiembraModule } from './modules/legacy/programacionSiembra/programacionSiembra.module'`
- Line 105: `LegacySiembraModule` → `LegacyProgramacionSiembraModule`

```typescript
// Line 33:
import { LegacyProgramacionSiembraModule } from './modules/legacy/programacionSiembra/programacionSiembra.module';
// Line 105 (in imports array):
LegacyProgramacionSiembraModule,
```

---

## Task 3: Backend — Update Permission References

**Files:**
- Modify: `apps/backend/src/modules/siembraPartidas/siembraPartidas.controller.ts:15,31`
- Modify: `apps/backend/src/modules/legacy/partidas/partidas.controller.ts:55`
- Modify: `apps/backend/src/modules/mezcla/mezcla.controller.ts:16`
- Modify: `apps/backend/prisma/seed-billboard.ts:77`

**Steps:**

- [ ] **Step 1: Update siembraPartidas controller permissions**

In `apps/backend/src/modules/siembraPartidas/siembraPartidas.controller.ts`, change both `tableName: 'siembra'` to `tableName: 'programacion_siembra'`:

```typescript
// Line 15:
@RequirePermission({ tableName: 'programacion_siembra', action: 'read', scope: 'ALL' })
// Line 31:
@RequirePermission({ tableName: 'programacion_siembra', action: 'read', scope: 'ALL' })
```

- [ ] **Step 2: Update partidas controller permission**

In `apps/backend/src/modules/legacy/partidas/partidas.controller.ts`, line 55:

```typescript
@RequirePermission({
  tableName: 'programacion_siembra',
  action: 'create',
  scope: 'ALL',
})
```

- [ ] **Step 3: Update mezcla controller permission**

In `apps/backend/src/modules/mezcla/mezcla.controller.ts`, line 16:

```typescript
@RequirePermission({ tableName: 'programacion_siembra', action: 'create', scope: 'ALL' })
```

- [ ] **Step 4: Update seed-billboard permission**

In `apps/backend/prisma/seed-billboard.ts`, line 77:

```typescript
permissionTable: 'programacion_siembra',
```

---

## Task 4: Frontend — Rename Routes, Query Keys, Navigation

**Files:**
- Modify: `apps/frontend/src/constants/routes.ts:11-12`
- Modify: `apps/frontend/src/lib/config/navigations.ts:35-40,60-64`
- Modify: `apps/frontend/src/lib/queryKeys.ts:136-145`
- Modify: `apps/frontend/src/lib/query-invalidation-map.ts:14-15,88,94-101,134`

**Steps:**

- [ ] **Step 1: Update route constants**

In `apps/frontend/src/constants/routes.ts`:

```typescript
// Before:
SIEMBRA: "/siembra",
SIEMBRA_PARTIDAS_REGISTRADAS: "/siembra/partidas-registradas",
// After:
PROGRAMACION_SIEMBRA: "/programacion-siembra",
SIEMBRA_PARTIDAS_REGISTRADAS: "/programacion-siembra/partidas-registradas",
```

- [ ] **Step 2: Update navigation config**

In `apps/frontend/src/lib/config/navigations.ts`:

```typescript
// Line 35-40:
{
  title: "Programación Siembra",
  href: ROUTES.PROGRAMACION_SIEMBRA,
  icon: Sprout,
  description: "Gestión de partidas a siembrar",
  dashboard: { statsLabel: "Partidas a siembrar" },
  requiredPermission: { table: "programacion_siembra", action: "read" },
},

// Line 60-64:
{
  title: "Partidas Registradas",
  href: ROUTES.SIEMBRA_PARTIDAS_REGISTRADAS,
  icon: ClipboardList,
  description: "Partidas con siembra registrada en el sistema web",
  dashboard: { statsLabel: "Partidas registradas" },
  requiredPermission: { table: "programacion_siembra", action: "read" },
},
```

- [ ] **Step 3: Update query keys**

In `apps/frontend/src/lib/queryKeys.ts`:

```typescript
// Lines 136-145:
export const programacionSiembraQueryKeys = {
  all: () => ["programacionSiembra"] as const,
  partidas: () => [...programacionSiembraQueryKeys.all(), "partidas"] as const,
  tratamientos: () => [...programacionSiembraQueryKeys.all(), "tratamientos"] as const,
  legacySustratos: () => [...programacionSiembraQueryKeys.all(), "legacySustratos"] as const,
};

export const programacionSiembraPartidasRegistradasQueryKeys = {
  all: () => ["programacionSiembraPartidasRegistradas"] as const,
};
```

- [ ] **Step 4: Update query invalidation map**

In `apps/frontend/src/lib/query-invalidation-map.ts`:

```typescript
// Imports (lines 14-15):
import {
  ...
  programacionSiembraQueryKeys,
  programacionSiembraPartidasRegistradasQueryKeys,
  ...
} from "./queryKeys";

// Line 88 (partidaUbicacion):
siembraQueryKeys.partidas() → programacionSiembraQueryKeys.partidas()

// Lines 94-101 (siembraPartida):
siembraPartida: {
  queries: () => [
    programacionSiembraQueryKeys.partidas(),
    programacionSiembraPartidasRegistradasQueryKeys.all(),
    ...
  ],
},

// Line 134 (aSembrar):
siembraPartidasRegistradasQueryKeys.all() → programacionSiembraPartidasRegistradasQueryKeys.all()
```

---

## Task 5: Frontend — Rename Feature Directory and Components

**Files:**
- Rename: `apps/frontend/src/features/siembra/` → `apps/frontend/src/features/programacionSiembra/`
- Rename: `apps/frontend/src/app/(dashboard)/siembra/` → `apps/frontend/src/app/(dashboard)/programacion-siembra/`
- Modify all files inside the renamed directories

**Steps:**

- [ ] **Step 1: Rename feature directory**

```bash
git mv apps/frontend/src/features/siembra apps/frontend/src/features/programacionSiembra
```

- [ ] **Step 2: Rename page route directory**

```bash
git mv "apps/frontend/src/app/(dashboard)/siembra" "apps/frontend/src/app/(dashboard)/programacion-siembra"
```

- [ ] **Step 3: Update feature index.ts**

In `apps/frontend/src/features/programacionSiembra/index.ts`:

```typescript
// src/features/programacionSiembra/index.ts
export { ProgramacionSiembraDashboard } from "./components/ProgramacionSiembraDashboard";
export { ProgramacionSiembraDashboardSkeleton } from "./components/programacionSiembra-dashboard-skeleton";
export { useProgramacionSiembraPartidas } from "./hooks/useProgramacionSiembraPartidas";
export { programacionSiembraService } from "./api/programacionSiembraService";
```

- [ ] **Step 4: Update API service**

In `apps/frontend/src/features/programacionSiembra/api/siembraService.ts` → rename file to `programacionSiembraService.ts`:

```bash
git mv apps/frontend/src/features/programacionSiembra/api/siembraService.ts apps/frontend/src/features/programacionSiembra/api/programacionSiembraService.ts
```

Update content:

```typescript
// apps/frontend/src/features/programacionSiembra/api/programacionSiembraService.ts
import { clientFetch } from "@/lib/api/client-fetch";
import {
  AsignarUbiSiembraCompletaDto,
  AutorizarSiembraDto,
  LegacySustratoDto,
  ProgramacionSiembraDto,
  SiembraPartidaDto,
  TratamientoDto,
} from "@vivero/shared";

export const programacionSiembraService = {
  fetchAll: () => {
    return clientFetch<ProgramacionSiembraDto[]>("l-programacion-siembra", { method: "GET" });
  },

  asignarUbicacionSiembra: (data: AsignarUbiSiembraCompletaDto) => {
    return clientFetch<void>("l-partidas/asignar-siembra", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  autorizarSiembra: (data: AutorizarSiembraDto) => {
    return clientFetch<SiembraPartidaDto>("l-partidas/autorizar-siembra", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  fetchTratamientos: () => {
    return clientFetch<TratamientoDto[]>("l-tratamiento", { method: "GET" });
  },

  fetchLegacySustratos: () => {
    return clientFetch<LegacySustratoDto[]>("l-sustrato", { method: "GET" });
  },
};
```

- [ ] **Step 5: Update hooks to use new query keys and service**

In `apps/frontend/src/features/programacionSiembra/hooks/useSiembraPartidas.ts` → rename to `useProgramacionSiembraPartidas.ts`:

```bash
git mv apps/frontend/src/features/programacionSiembra/hooks/useSiembraPartidas.ts apps/frontend/src/features/programacionSiembra/hooks/useProgramacionSiembraPartidas.ts
```

Update content — change `siembraQueryKeys` → `programacionSiembraQueryKeys` and `siembraService` → `programacionSiembraService`.

Similarly update all other hooks (`useSiembraPartidaMutation.ts`, `useTratamientos.ts`, `useLegacySustratos.ts`) to reference `programacionSiembraQueryKeys` and `programacionSiembraService`.

- [ ] **Step 6: Update component files**

Rename component files and update internal references:
- `SiembraDashboard.tsx` → `ProgramacionSiembraDashboard.tsx`
- `siembra-dashboard-skeleton.tsx` → `programacionSiembra-dashboard-skeleton.tsx`
- `siembra-view.tsx` → `programacionSiembra-view.tsx`
- `siembra-view-form.tsx` → `programacionSiembra-view-form.tsx`
- `siembra-data-table.tsx` → `programacionSiembra-data-table.tsx`
- `autorizar-siembra-edit-form.tsx` → `autorizar-programacionSiembra-edit-form.tsx`
- `siembra-dashboard-skeleton.tsx` → `programacionSiembra-dashboard-skeleton.tsx`

In each component, update:
- Import paths to new file names
- `siembraQueryKeys` → `programacionSiembraQueryKeys`
- `siembraService` → `programacionSiembraService`
- `tableName="siembra"` → `tableName="programacion_siembra"`
- Component names: `SiembraDashboard` → `ProgramacionSiembraDashboard`, etc.

- [ ] **Step 7: Update page routes**

In `apps/frontend/src/app/(dashboard)/programacion-siembra/page.tsx`:
- Update import path from `@/features/siembra` → `@/features/programacionSiembra`
- Update component name to `ProgramacionSiembraDashboard`

In `apps/frontend/src/app/(dashboard)/programacion-siembra/partidas-registradas/page.tsx`:
- Update import path from `@/features/siembraPartidas` (stays the same, but verify)

---

## Task 6: Frontend — Update Cross-Feature References

**Files:**
- Modify: `apps/frontend/src/features/aSembrar/api/aSembrarService.ts:4,9`
- Modify: `apps/frontend/src/features/aSembrar/hooks/useASembrarMutation.ts:4,20-21`
- Modify: `apps/frontend/src/features/aSembrar/components/a-sembrar-view.tsx:3`
- Modify: `apps/frontend/src/features/aSembrar/components/a-sembrar-edit-form.tsx:46,50`
- Modify: `apps/frontend/src/features/aSembrar/components/a-sembrar-data-table.tsx:90,110,111`
- Modify: `apps/frontend/src/features/mezclas/components/mezcla-data-table.tsx:83`

**Steps:**

- [ ] **Step 1: Update aSembrar API service**

In `apps/frontend/src/features/aSembrar/api/aSembrarService.ts`:
- `SiembraDto` → `ProgramacionSiembraDto` in imports (if used)

- [ ] **Step 2: Update aSembrar mutation**

In `apps/frontend/src/features/aSembrar/hooks/useASembrarMutation.ts`:
- `"siembraPartida"` mutation key stays (it's the mutation name, not the entity)

- [ ] **Step 3: Update aSembrar component imports**

In `apps/frontend/src/features/aSembrar/components/a-sembrar-view.tsx`:
- `import { EmptyState } from "@/features/siembra/components/empty-state"` → `import { EmptyState } from "@/features/programacionSiembra/components/empty-state"`

In `apps/frontend/src/features/aSembrar/components/a-sembrar-edit-form.tsx`:
- `import { TratamientoSearch } from "@/features/siembra/components/tratamientoSearch"` → `import { TratamientoSearch } from "@/features/programacionSiembra/components/tratamientoSearch"`
- `import { SustratoSearch } from "@/features/siembra/components/sustratoSearch"` → `import { SustratoSearch } from "@/features/programacionSiembra/components/sustratoSearch"`

- [ ] **Step 4: Update mezcla data table permission**

In `apps/frontend/src/features/mezclas/components/mezcla-data-table.tsx`:
- `tableName="siembra"` → `tableName="programacion_siembra"`

---

## Task 7: Integration Tests Update

**Files:**
- Rename: `apps/backend/test/integration/siembra.integration.spec.ts` → `apps/backend/test/integration/programacionSiembra.integration.spec.ts`
- Modify: `apps/backend/test/integration/helpers/create-app.ts:10-11,35,48,59,70`
- Modify: `apps/backend/test/integration/helpers/mock-factories.ts:45-48,77`
- Modify: `apps/backend/test/integration/alerts.integration.spec.ts:54,93`

**Steps:**

- [ ] **Step 1: Rename integration test file**

```bash
git mv apps/backend/test/integration/siembra.integration.spec.ts apps/backend/test/integration/programacionSiembra.integration.spec.ts
```

- [ ] **Step 2: Update create-app.ts**

In `apps/backend/test/integration/helpers/create-app.ts`:
- Import: `SiembraController` → `ProgramacionSiembraController`
- Import: `SiembraService` → `ProgramacionSiembraService`
- Update mock providers and controller references

- [ ] **Step 3: Update mock-factories.ts**

In `apps/backend/test/integration/helpers/mock-factories.ts`:
- `createSiembraMock()` → `createProgramacionSiembraMock()`
- Update function body to match new class names

- [ ] **Step 4: Update integration test content**

In `apps/backend/test/integration/programacionSiembra.integration.spec.ts`:
- Update imports to new module names
- Update route assertions: `GET /l-siembra` → `GET /l-programacion-siembra`
- Update mock data

---

## Task 8: Verification

**Steps:**

- [ ] **Step 1: Run shared package build**

```bash
pnpm --filter @vivero/shared build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run type check**

```bash
pnpm type-check
```

Expected: No type errors across all packages.

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```

Expected: No lint errors.

- [ ] **Step 4: Run tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 5: Grep for stale references**

```bash
rg "tableName.*['\"]siembra['\"]" --type ts
rg "from.*siembra/siembra" --type ts
rg "SiembraDto[^P]" --type ts
rg "LegacySiembra[^P]" --type ts
rg "siembraQueryKeys" --type ts
rg "l-siembra" --type ts
```

Expected: No stale references (except `siembraPartidas`, `f_siembra`, `sem_siembra`, `siembra-retrasada` which are intentionally unchanged).

- [ ] **Step 6: Verify frontend dev server starts**

```bash
pnpm dev:frontend
```

Expected: App loads at localhost:3000 without errors.
