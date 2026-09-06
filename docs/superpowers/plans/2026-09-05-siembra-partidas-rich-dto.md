# Siembra Partidas Rich DTO — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `SiembraPartidaDto` with all legacy siembra fields and task shift data, resolving all foreign keys to human-readable names.

**Architecture:** Fetch from 3 sources (Prisma SiembraPartidas, legacy MySQL partidas, Prisma TaskShift), merge into a single rich DTO, and display in a tabbed view form.

**Tech Stack:** NestJS, Prisma, MySQL (legacy), Zod, Next.js, TanStack Table, shadcn/ui Tabs

## Global Constraints

- Legacy MySQL database (martin3) cannot be modified — read-only queries
- Prisma for new tables (`siembra_partdas`, `taskShifts`, `mezcla`, `sustratos`)
- Conventional Commits format required
- `pnpm lint && pnpm type-check && pnpm test` before committing
- Frontend follows feature-based pattern in `src/features/`

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `packages/shared/src/schemas/siembraPartida.schema.ts` | Modify | Extend `SiembraPartidaSchema` with 14 new optional fields |
| `apps/backend/src/modules/legacy/partidas/repositories/partidas.repository.ts` | Modify | Add `findByComposite()` method |
| `apps/backend/src/modules/taskShifts/repositories/taskShifts.repository.ts` | Modify | Add `findByPartidaComposite()` method |
| `apps/backend/src/modules/legacy/tratamiento/tratamiento.module.ts` | Modify | Export `LegacyTratamientoService` |
| `apps/backend/src/modules/siembraPartidas/siembraPartidas.module.ts` | Modify | Import 3 modules, inject 3 repos |
| `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts` | Modify | Extend `mapToDto`, fetch from 3 sources |
| `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx` | Rewrite | Tabbed view with all fields |

---

### Task 1: Extend Shared Schema

**Files:**
- Modify: `packages/shared/src/schemas/siembraPartida.schema.ts:17-31`

**Interfaces:**
- Produces: Extended `SiembraPartidaDto` with 14 new optional fields

- [ ] **Step 1: Add new fields to SiembraPartidaSchema**

```typescript
// packages/shared/src/schemas/siembraPartida.schema.ts
export const SiembraPartidaSchema = PartidaHeaderSchema.extend({
  id: requiredCuid("El registro de siembra"),
  metodoMaquina: z.boolean({ message: "El método/máquina es requerido" }),
  presionSemilla: z
    .number({ message: "La presión de semilla es requerida" })
    .int({ message: "La presión de semilla debe ser un número entero" }),
  profundidadSemilla: ProfundidadSemillaSchema,
  tratamientoSemilla: z.string({
    message: "El tratamiento de semilla es requerido",
  }).min(1, { message: "El tratamiento de semilla es requerido" }),
  mezclaId: requiredCuid("La mezcla"),
  userId: requiredCuid("El usuario"),
  mezclaNombre: z.string(),
  usuarioNombre: z.string(),
  // Legacy siembra fields
  cg: z.number().optional(),
  fSiembra: z.string().optional(),
  lote: z.number().optional(),
  anoLote: z.number().optional(),
  item: z.number().optional(),
  semxgr: z.number().optional(),
  ajuste: z.string().optional(),
  cantidadGrs: z.number().optional(),
  cantidaNroCont: z.number().optional(),
  detalleExtendido: z.string().optional(),
  // Resolved names
  tratamientoNombre: z.string().optional(),
  // Task shift fields
  entityId: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  empleados: z.array(z.object({
    userId: z.string(),
    username: z.string(),
  })).optional(),
});
```

- [ ] **Step 2: Build shared package**

Run: `pnpm --filter @vivero/shared build`
Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Verify type check passes**

Run: `pnpm type-check`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/shared/src/schemas/siembraPartida.schema.ts
git commit -m "feat(shared): extend SiembraPartidaDto with legacy and task shift fields"
```

---

### Task 2: Add findByComposite to PartidasRepository

**Files:**
- Modify: `apps/backend/src/modules/legacy/partidas/repositories/partidas.repository.ts:28`

**Interfaces:**
- Produces: `findByComposite(partida: number, ano: number, indice: number): Promise<LegacyPartidas | null>`

- [ ] **Step 1: Add findByComposite method**

Add after `findOne` method (line 28):

```typescript
async findByComposite(
  partida: number,
  ano: number,
  indice: number,
): Promise<LegacyPartidas | null> {
  const rows = await this.legacyDb.query<LegacyPartidas[]>(
    'SELECT * FROM partidas WHERE partida = ? AND ano = ? AND indice = ?',
    [partida, ano, indice],
  );
  if (!rows.length) return null;
  return rows[0];
}
```

- [ ] **Step 2: Verify type check passes**

Run: `pnpm --filter backend type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/legacy/partidas/repositories/partidas.repository.ts
git commit -m "feat(legacy): add findByComposite to PartidasRepository"
```

---

### Task 3: Add findByPartidaComposite to TaskShiftsRepository

**Files:**
- Modify: `apps/backend/src/modules/taskShifts/repositories/taskShifts.repository.ts:61`

**Interfaces:**
- Produces: `findByPartidaComposite(partidaId: number, anio: number, indice: number): Promise<TaskShiftWithEmployees | null>`

- [ ] **Step 1: Add findByPartidaComposite method**

Add after `findById` method (line 61):

```typescript
async findByPartidaComposite(
  partidaId: number,
  anio: number,
  indice: number,
): Promise<TaskShiftWithEmployees | null> {
  return this.prisma.taskShift.findFirst({
    where: {
      partidaId,
      anio,
      indice,
      deletedAt: null,
      isActive: true,
    },
    include: { employees: { select: { userId: true } } },
  });
}
```

- [ ] **Step 2: Verify type check passes**

Run: `pnpm --filter backend type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/taskShifts/repositories/taskShifts.repository.ts
git commit -m "feat(taskShifts): add findByPartidaComposite to TaskShiftsRepository"
```

---

### Task 4: Export LegacyTratamientoService

**Files:**
- Modify: `apps/backend/src/modules/legacy/tratamiento/tratamiento.module.ts:8-11`

**Interfaces:**
- Produces: `LegacyTratamientoService` available for import

- [ ] **Step 1: Add exports to LegacyTratamientoModule**

```typescript
@Module({
  controllers: [LegacyTratamientoController],
  providers: [LegacyTratamientoService, TratamientoRepository],
  exports: [LegacyTratamientoService],
})
export class LegacyTratamientoModule {}
```

- [ ] **Step 2: Verify type check passes**

Run: `pnpm --filter backend type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/legacy/tratamiento/tratamiento.module.ts
git commit -m "feat(legacy): export LegacyTratamientoService from module"
```

---

### Task 5: Wire SiembraPartidasModule

**Files:**
- Modify: `apps/backend/src/modules/siembraPartidas/siembraPartidas.module.ts:1-13`

**Interfaces:**
- Consumes: `PartidasRepository`, `TaskShiftsRepository`, `LegacyTratamientoService`
- Produces: Module with all dependencies available for injection

- [ ] **Step 1: Update module imports and providers**

```typescript
// src/modules/siembraPartidas/siembraPartidas.module.ts

import { Module } from '@nestjs/common';
import { SiembraPartidasController } from './siembraPartidas.controller';
import { SiembraPartidasService } from './siembraPartidas.service';
import { SiembraPartidasRepository } from './repositories/siembraPartidas.repository';
import { LegacyPartidasModule } from '../legacy/partidas/partidas.module';
import { TaskShiftsModule } from '../taskShifts/taskShifts.module';
import { LegacyTratamientoModule } from '../legacy/tratamiento/tratamiento.module';

@Module({
  imports: [LegacyPartidasModule, TaskShiftsModule, LegacyTratamientoModule],
  controllers: [SiembraPartidasController],
  providers: [SiembraPartidasService, SiembraPartidasRepository],
  exports: [SiembraPartidasService],
})
export class SiembraPartidasModule {}
```

- [ ] **Step 2: Verify type check passes**

Run: `pnpm --filter backend type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/siembraPartidas/siembraPartidas.module.ts
git commit -m "feat(siembraPartidas): wire legacy and taskShifts modules"
```

---

### Task 6: Extend SiembraPartidasService

**Files:**
- Modify: `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts:1-127`

**Interfaces:**
- Consumes: `PartidasRepository.findByComposite()`, `TaskShiftsRepository.findByPartidaComposite()`, `LegacyTratamientoService.getByCodigo()`
- Produces: `getAllSiembraPartidas()` and `getSiembraPartidaById()` return extended `SiembraPartidaDto`

- [ ] **Step 1: Update imports and inject dependencies**

```typescript
// src/modules/siembraPartidas/siembraPartidas.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import {
  SiembraPartidasRepository,
  SiembraPartidasWithRelations,
} from './repositories/siembraPartidas.repository';
import { CreateSiembraPartidaDto, SiembraPartidaDto } from '@vivero/shared';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PartidasRepository } from '../legacy/partidas/repositories/partidas.repository';
import { TaskShiftsRepository } from '../taskShifts/repositories/taskShifts.repository';
import { LegacyTratamientoService } from '../legacy/tratamiento/tratamiento.service';

const GENERIC_SUSTRATO_NAME = 'Sustrato Genérico';
const GENERIC_MEZCLA_SUSTRATO1_ID = 'c00000000000000000000001';

@Injectable()
export class SiembraPartidasService {
  constructor(
    private readonly repo: SiembraPartidasRepository,
    private readonly prisma: PrismaService,
    private readonly partidasRepo: PartidasRepository,
    private readonly taskShiftsRepo: TaskShiftsRepository,
    private readonly tratamientoService: LegacyTratamientoService,
  ) {}
```

- [ ] **Step 2: Add buildTratamientoNombre helper**

Add after `buildMezclaNombre`:

```typescript
private async buildTratamientoNombre(
  codigo: string,
): Promise<string | undefined> {
  try {
    const tratamiento = await this.tratamientoService.getByCodigo(codigo);
    return tratamiento.nombre;
  } catch {
    return undefined;
  }
}
```

- [ ] **Step 3: Update mapToDto to accept legacy and task shift data**

Replace `mapToDto` method:

```typescript
private async mapToDto(
  row: SiembraPartidasWithRelations,
  legacyData: Awaited<ReturnType<typeof this.partidasRepo.findByComposite>>,
  taskShift: Awaited<ReturnType<typeof this.taskShiftsRepo.findByPartidaComposite>>,
): Promise<SiembraPartidaDto> {
  // Resolve employee usernames
  let empleados: { userId: string; username: string }[] | undefined;
  if (taskShift?.employees?.length) {
    const userIds = taskShift.employees.map((e) => e.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true },
    });
    empleados = taskShift.employees.map((e) => ({
      userId: e.userId,
      username: users.find((u) => u.id === e.username)?.username ?? e.userId,
    }));
  }

  // Resolve treatment name
  const tratamientoNombre = row.tratamientoSemilla
    ? await this.buildTratamientoNombre(row.tratamientoSemilla)
    : undefined;

  return {
    id: row.id,
    partidaId: row.partidaId,
    anio: row.anio,
    indice: row.indice,
    metodoMaquina: row.metodoMaquina,
    presionSemilla: row.presionSemilla,
    profundidadSemilla: row.profundidadSemilla.toString(),
    tratamientoSemilla: row.tratamientoSemilla,
    mezclaId: row.mezclaId,
    userId: row.userId,
    mezclaNombre: this.buildMezclaNombre(row.mezcla),
    usuarioNombre: row.user.username,
    // Legacy fields
    cg: legacyData?.cg,
    fSiembra: legacyData?.f_siembra || undefined,
    lote: legacyData?.lote ? Number(legacyData.lote) : undefined,
    anoLote: legacyData?.ano_lote ? Number(legacyData.ano_lote) : undefined,
    item: legacyData?.item,
    semxgr: legacyData?.semxgr ? Number(legacyData.semxgr) : undefined,
    ajuste: legacyData?.ajuste || undefined,
    cantidadGrs: legacyData?.cantidad,
    cantidaNroCont: legacyData?.con,
    detalleExtendido: legacyData?.extendido || undefined,
    // Resolved names
    tratamientoNombre,
    // Task shift fields
    entityId: taskShift?.entityId,
    startTime: taskShift?.startTime?.toISOString(),
    endTime: taskShift?.endTime?.toISOString(),
    empleados,
  };
}
```

- [ ] **Step 4: Update getAllSiembraPartidas to fetch from 3 sources**

```typescript
async getAllSiembraPartidas(
  requesterId: string,
): Promise<SiembraPartidaDto[]> {
  const rows = await this.repo.findAll(requesterId);

  const dtos = await Promise.all(
    rows.map(async (row) => {
      const [legacyData, taskShift] = await Promise.all([
        this.partidasRepo.findByComposite(row.partidaId, row.anio, row.indice),
        this.taskShiftsRepo.findByPartidaComposite(row.partidaId, row.anio, row.indice),
      ]);
      return this.mapToDto(row, legacyData, taskShift);
    }),
  );

  return dtos;
}
```

- [ ] **Step 5: Update getSiembraPartidaById to fetch from 3 sources**

```typescript
async getSiembraPartidaById(
  id: string,
  requesterId: string,
): Promise<SiembraPartidaDto> {
  const siembraPartida = await this.repo.findById(id, requesterId);
  if (!siembraPartida)
    throw new NotFoundException('SiembraPartida not found');

  const row = siembraPartida as SiembraPartidasWithRelations;
  const [legacyData, taskShift] = await Promise.all([
    this.partidasRepo.findByComposite(row.partidaId, row.anio, row.indice),
    this.taskShiftsRepo.findByPartidaComposite(row.partidaId, row.anio, row.indice),
  ]);

  return this.mapToDto(row, legacyData, taskShift);
}
```

- [ ] **Step 6: Verify type check passes**

Run: `pnpm --filter backend type-check`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts
git commit -m "feat(siembraPartidas): extend service to fetch from 3 sources and resolve names"
```

---

### Task 7: Rewrite View Form with Tabs

**Files:**
- Modify: `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx:1-140`

**Interfaces:**
- Consumes: Extended `SiembraPartidaDto` from Task 1

- [ ] **Step 1: Rewrite view form with tabs**

```typescript
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiembraPartidaDto } from "@vivero/shared";
import {
  Package,
  Hash,
  Activity,
  Cog,
  User,
  FlaskConical,
  Calendar,
  Layers,
  Clock,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SiembraPartidasRegistradasViewFormProps {
  selectedPartida: SiembraPartidaDto;
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  value?: string | number | null;
  className?: string;
}) => (
  <div
    className={cn(
      "flex items-center gap-3 md:gap-4 py-2 md:py-3 border-b border-border/40 last:border-0",
      className,
    )}
  >
    <div className="p-1.5 md:p-2 bg-primary/5 rounded-lg border border-primary/10">
      <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mb-1 md:mb-1.5">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-xs md:text-base font-bold truncate text-foreground">
          {value ?? "-"}
        </p>
      </div>
    </div>
  </div>
);

export function SiembraPartidasRegistradasViewForm({
  selectedPartida,
}: SiembraPartidasRegistradasViewFormProps) {
  return (
    <div className="flex flex-col gap-3 md:gap-6 animate-in fade-in duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-hidden">
      {/* HEADER */}
      <div className="space-y-3 md:space-y-4 shrink-0">
        <div className="flex items-center justify-between bg-primary/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Package className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-black tracking-tight leading-none text-foreground uppercase">
                Partida #{selectedPartida.partidaId}
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 md:mt-1.5">
                {selectedPartida.mezclaNombre}
              </p>
            </div>
          </div>
        </div>

        {/* SPECS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: "Año", value: selectedPartida.anio, icon: Hash },
            { label: "Índice", value: selectedPartida.indice, icon: Hash },
            {
              label: "Método",
              value: selectedPartida.metodoMaquina ? "Máquina" : "Manual",
              icon: Cog,
            },
            {
              label: "Presión",
              value: `${selectedPartida.presionSemilla} PSI`,
              icon: Activity,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-background border border-border/60 p-1.5 md:p-2.5 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2.5 shadow-sm overflow-hidden"
            >
              <div className="p-1 md:p-1.5 bg-muted rounded-md shrink-0">
                <item.icon className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[7px] md:text-[8px] font-bold uppercase leading-none mb-0.5">
                  {item.label}
                </p>
                <p className="text-[10px] md:text-xs truncate uppercase font-bold">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TABBED NAVIGATION */}
      <Tabs
        defaultValue="siembra"
        className="flex-1 flex flex-col overflow-hidden min-h-0"
      >
        <TabsList className="grid grid-cols-3 bg-muted/80 p-1 rounded-xl md:rounded-2xl shrink-0 h-10 md:h-14 border border-border/40 gap-1 md:gap-2 shadow-inner">
          <TabsTrigger
            value="siembra"
            className="rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                       data-[state=inactive]:text-muted-foreground"
          >
            <FlaskConical className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-2 hidden sm:inline-block" />
            Siembra
          </TabsTrigger>

          <TabsTrigger
            value="lote"
            className="rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                       data-[state=inactive]:text-muted-foreground"
          >
            <Layers className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-2 hidden sm:inline-block" />
            Lote
          </TabsTrigger>

          <TabsTrigger
            value="turno"
            className="rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                       data-[state=inactive]:text-muted-foreground"
          >
            <Clock className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-2 hidden sm:inline-block" />
            Turno
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto no-scrollbar pt-3 md:pt-6 pb-2">
          {/* TAB: SIEMBRA */}
          <TabsContent
            value="siembra"
            className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Card className="border-border/60 shadow-sm rounded-xl md:rounded-[1.5rem] overflow-hidden bg-card/50">
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 gap-0.5 md:gap-1">
                  <InfoRow
                    icon={FlaskConical}
                    label="Mezcla"
                    value={selectedPartida.mezclaNombre}
                    className="border-primary/5"
                  />
                  <InfoRow
                    icon={Activity}
                    label="Profundidad"
                    value={`${selectedPartida.profundidadSemilla} cm`}
                  />
                  <InfoRow
                    icon={Package}
                    label="Tratamiento"
                    value={selectedPartida.tratamientoNombre || selectedPartida.tratamientoSemilla || "-"}
                  />
                  <InfoRow
                    icon={Hash}
                    label="Cámara Germinación"
                    value={selectedPartida.cg}
                  />
                  <InfoRow
                    icon={Hash}
                    label="Cantidad Contenedor"
                    value={selectedPartida.cantidaNroCont}
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Fecha Siembra"
                    value={selectedPartida.fSiembra}
                  />
                  <InfoRow
                    icon={ClipboardList}
                    label="Detalle Extendido"
                    value={selectedPartida.detalleExtendido}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: LOTE */}
          <TabsContent
            value="lote"
            className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Card className="border-border/60 shadow-sm rounded-xl md:rounded-[1.5rem] overflow-hidden bg-card/50">
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 gap-0.5 md:gap-1">
                  <InfoRow
                    icon={Layers}
                    label="Lote"
                    value={selectedPartida.lote}
                  />
                  <InfoRow
                    icon={Hash}
                    label="Año Lote"
                    value={selectedPartida.anoLote}
                  />
                  <InfoRow
                    icon={Hash}
                    label="Item"
                    value={selectedPartida.item}
                  />
                  <InfoRow
                    icon={Activity}
                    label="Semillas/gr"
                    value={selectedPartida.semxgr}
                  />
                  <InfoRow
                    icon={ClipboardList}
                    label="Ajuste"
                    value={selectedPartida.ajuste}
                  />
                  <InfoRow
                    icon={Package}
                    label="Cantidad (gr)"
                    value={selectedPartida.cantidadGrs}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: TURNO */}
          <TabsContent
            value="turno"
            className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Card className="border-border/60 shadow-sm rounded-xl md:rounded-[1.5rem] overflow-hidden bg-card/50">
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 gap-0.5 md:gap-1">
                  <InfoRow
                    icon={ClipboardList}
                    label="Entidad"
                    value={selectedPartida.entityId}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Hora Inicio"
                    value={selectedPartida.startTime}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Hora Fin"
                    value={selectedPartida.endTime}
                  />
                  <InfoRow
                    icon={User}
                    label="Empleados"
                    value={
                      selectedPartida.empleados?.length
                        ? selectedPartida.empleados.map((e) => e.username).join(", ")
                        : "-"
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 2: Verify type check passes**

Run: `pnpm --filter frontend type-check`
Expected: No errors

- [ ] **Step 3: Verify lint passes**

Run: `pnpm --filter frontend lint`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx
git commit -m "feat(siembraPartidas): rewrite view form with tabs for all fields"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Run full verification**

Run: `pnpm lint && pnpm type-check && pnpm test`
Expected: All pass

- [ ] **Step 2: Manual test**

1. Navigate to `/siembra/partidas-registradas`
2. Click a row to open slide-over
3. Verify header shows Partida # and Mezcla nombre
4. Verify specs grid shows Año, Índice, Método, Presión
5. Click "Siembra" tab — verify Profundidad, Tratamiento (resolved name), CG, Cantidad, Fecha, Detalle
6. Click "Lote" tab — verify Lote, Año Lote, Item, Semillas/gr, Ajuste, Cantidad (gr)
7. Click "Turno" tab — verify Entidad, Horas, Empleados (usernames)

- [ ] **Step 3: Commit all remaining changes**

```bash
git add .
git commit -m "feat(siembraPartidas): complete rich DTO and tabbed view form"
```
