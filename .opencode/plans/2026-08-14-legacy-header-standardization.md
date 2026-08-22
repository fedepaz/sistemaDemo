# Legacy Header Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize the response format across all legacy modules to use a consistent "header" structure with partidaId, anio, indice, codigoEspecie, nombreEspecie.

**Architecture:** Create a shared `LegacyHeaderSchema` in the shared package, migrate existing modules to extend this schema, add service layer validation, and update frontend components for consistent display.

**Tech Stack:** NestJS, Prisma, Zod schemas, React, TypeScript, Next.js

## Global Constraints

- All data types must be in `packages/shared/src/schemas/`
- Conventional Commits enforced by commitlint (feat, fix, docs, etc.)
- TDD: Tests before feature code
- Verification order: `pnpm lint && pnpm type-check && pnpm test`
- Backend port: 3001 (via PORT env var)
- Frontend: Next.js 16 (App Router) + shadcn/ui + Tailwind v4

---

## File Structure

### New Files

1. **`packages/shared/src/schemas/legacy-header.schema.ts`**
   - Shared `LegacyHeaderSchema` for all legacy modules
   - Exports `LegacyHeader` type

2. **`apps/frontend/src/features/shared/utils/header.ts`**
   - Shared utility functions for header display
   - `formatPartidaHeader()`, `formatPartidaNumber()`, `formatSpecies()`

### Modified Files

3. **`packages/shared/src/schemas/alerts.schema.ts`**
   - Import `LegacyHeaderSchema` from shared
   - Update `AlertBaseDtoSchema` to extend `LegacyHeaderSchema`
   - Remove duplicate `AlertPartidaHeaderSchema`

4. **`packages/shared/src/schemas/extendido.schema.ts`**
   - Import `LegacyHeaderSchema` from shared
   - Update `ExtendidoDtoSchema` to extend `LegacyHeaderSchema`
   - Remove duplicate header fields

5. **`packages/shared/src/schemas/index.ts`**
   - Export `LegacyHeaderSchema` and `LegacyHeader` type

6. **`apps/backend/src/modules/legacy/alerts/alerts.service.ts`**
   - Add `validateHeaderFields()` method
   - Add validation calls in mapping functions

7. **`apps/backend/src/modules/legacy/extendidos/extendidos.service.ts`**
   - Update `mapToDto()` to ensure header fields are populated
   - Add `validateHeaderFields()` method

8. **`apps/frontend/src/features/alerts/components/v1/alerts-view-form.tsx`**
   - Update imports to use shared schema
   - Ensure header display is consistent

9. **`apps/frontend/src/features/extendidos/components/extendido-view-form.tsx`**
   - Update to display header fields consistently with alerts
   - Use shared header utilities

10. **`apps/frontend/src/features/extendidos/components/columns.tsx`**
    - Update to use header structure

---

## Tasks

### Task 1: Create Shared LegacyHeaderSchema

**Files:**
- Create: `packages/shared/src/schemas/legacy-header.schema.ts`
- Modify: `packages/shared/src/schemas/index.ts`

**Interfaces:**
- Consumes: None (first task)
- Produces: `LegacyHeaderSchema`, `LegacyHeader` type

- [ ] **Step 1: Write the failing test**

```typescript
// packages/shared/src/schemas/__tests__/legacy-header.schema.test.ts
import { LegacyHeaderSchema, LegacyHeader } from '../legacy-header.schema';

describe('LegacyHeaderSchema', () => {
  it('should validate a valid legacy header', () => {
    const validHeader = {
      partidaId: 123,
      anio: 2024,
      indice: 1,
      codigoEspecie: 'ESP001',
      nombreEspecie: 'Especie Test',
    };

    const result = LegacyHeaderSchema.safeParse(validHeader);
    expect(result.success).toBe(true);
  });

  it('should reject header with missing fields', () => {
    const invalidHeader = {
      partidaId: 123,
      anio: 2024,
      // Missing indice, codigoEspecie, nombreEspecie
    };

    const result = LegacyHeaderSchema.safeParse(invalidHeader);
    expect(result.success).toBe(false);
  });

  it('should reject header with wrong types', () => {
    const invalidHeader = {
      partidaId: '123', // Should be number
      anio: 2024,
      indice: 1,
      codigoEspecie: 'ESP001',
      nombreEspecie: 'Especie Test',
    };

    const result = LegacyHeaderSchema.safeParse(invalidHeader);
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @vivero/shared test`
Expected: FAIL with "Cannot find module '../legacy-header.schema'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/shared/src/schemas/legacy-header.schema.ts
import { z } from 'zod';

export const LegacyHeaderSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
});

export type LegacyHeader = z.infer<typeof LegacyHeaderSchema>;
```

- [ ] **Step 4: Update shared package index**

```typescript
// packages/shared/src/schemas/index.ts
// Add to existing exports
export { LegacyHeaderSchema, LegacyHeader } from './legacy-header.schema';
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @vivero/shared test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/shared/src/schemas/legacy-header.schema.ts packages/shared/src/schemas/index.ts packages/shared/src/schemas/__tests__/legacy-header.schema.test.ts
git commit -m "feat(shared): add LegacyHeaderSchema for legacy modules"
```

---

### Task 2: Update Alerts Schema to Use Shared Header

**Files:**
- Modify: `packages/shared/src/schemas/alerts.schema.ts`

**Interfaces:**
- Consumes: `LegacyHeaderSchema` from Task 1
- Produces: Updated `AlertBaseDtoSchema` extending `LegacyHeaderSchema`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/shared/src/schemas/__tests__/alerts.schema.test.ts
import { AlertBaseDtoSchema, AlertBaseDto } from '../alerts.schema';
import { LegacyHeader } from '../legacy-header.schema';

describe('AlertBaseDtoSchema', () => {
  it('should extend LegacyHeaderSchema', () => {
    const validAlert = {
      partidaId: 123,
      anio: 2024,
      indice: 1,
      codigoEspecie: 'ESP001',
      nombreEspecie: 'Especie Test',
      commentCount: 5,
    };

    const result = AlertBaseDtoSchema.safeParse(validAlert);
    expect(result.success).toBe(true);
  });

  it('should be assignable to LegacyHeader type', () => {
    const alert: AlertBaseDto = {
      partidaId: 123,
      anio: 2024,
      indice: 1,
      codigoEspecie: 'ESP001',
      nombreEspecie: 'Especie Test',
      commentCount: 5,
    };

    const header: LegacyHeader = alert;
    expect(header.partidaId).toBe(123);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @vivero/shared test`
Expected: FAIL with type errors

- [ ] **Step 3: Update alerts schema**

```typescript
// packages/shared/src/schemas/alerts.schema.ts
import { z } from 'zod';
import { LegacyHeaderSchema } from './legacy-header.schema';

// Remove old AlertPartidaHeaderSchema
// export const AlertPartidaHeaderSchema = z.object({...}); // DELETE THIS

// Update AlertBaseDtoSchema to extend LegacyHeaderSchema
export const AlertBaseDtoSchema = LegacyHeaderSchema.extend({
  commentCount: z.number().default(0),
});

export type AlertBaseDto = z.infer<typeof AlertBaseDtoSchema>;

// Keep existing alert DTOs extending AlertBaseDtoSchema
export const SiembraRetrasadaDtoSchema = AlertBaseDtoSchema.extend({
  // ... existing fields
});

// ... other alert DTOs
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @vivero/shared test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/schemas/alerts.schema.ts packages/shared/src/schemas/__tests__/alerts.schema.test.ts
git commit -m "feat(shared): update alerts schema to extend LegacyHeaderSchema"
```

---

### Task 3: Update Extendidos Schema to Use Shared Header

**Files:**
- Modify: `packages/shared/src/schemas/extendido.schema.ts`

**Interfaces:**
- Consumes: `LegacyHeaderSchema` from Task 1
- Produces: Updated `ExtendidoDtoSchema` extending `LegacyHeaderSchema`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/shared/src/schemas/__tests__/extendido.schema.test.ts
import { ExtendidoDtoSchema, ExtendidoDto } from '../extendido.schema';
import { LegacyHeader } from '../legacy-header.schema';

describe('ExtendidoDtoSchema', () => {
  it('should extend LegacyHeaderSchema', () => {
    const validExtendido = {
      partidaId: 123,
      anio: 2024,
      indice: 1,
      codigoEspecie: 'ESP001',
      nombreEspecie: 'Especie Test',
      hai: 'HAI001',
      con: 100,
      injerto: 'Injerto Test',
      contenedor: 'CONT001',
      codigoCamaraGerminacion: 1,
      fechaSugeridaSiembra: '2024-01-01',
      fechaSiembraReal: '2024-01-02',
      diasEnCamara: 10,
      fechaEgresoCamara: '2024-01-10',
      extendido: 'Extendido Test',
      codigoUbicacion: 1,
      nombreUbicacion: 'Ubicacion Test',
      stockInicial: 50,
      detalle: 'Detalle Test',
      baja: null,
    };

    const result = ExtendidoDtoSchema.safeParse(validExtendido);
    expect(result.success).toBe(true);
  });

  it('should be assignable to LegacyHeader type', () => {
    const extendido: ExtendidoDto = {
      partidaId: 123,
      anio: 2024,
      indice: 1,
      codigoEspecie: 'ESP001',
      nombreEspecie: 'Especie Test',
      hai: 'HAI001',
      con: 100,
      injerto: 'Injerto Test',
      contenedor: 'CONT001',
      codigoCamaraGerminacion: 1,
      fechaSugeridaSiembra: '2024-01-01',
      fechaSiembraReal: '2024-01-02',
      diasEnCamara: 10,
      fechaEgresoCamara: '2024-01-10',
      extendido: 'Extendido Test',
      codigoUbicacion: 1,
      nombreUbicacion: 'Ubicacion Test',
      stockInicial: 50,
      detalle: 'Detalle Test',
      baja: null,
    };

    const header: LegacyHeader = extendido;
    expect(header.partidaId).toBe(123);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @vivero/shared test`
Expected: FAIL with type errors

- [ ] **Step 3: Update extendidos schema**

```typescript
// packages/shared/src/schemas/extendido.schema.ts
import { z } from 'zod';
import { LegacyHeaderSchema } from './legacy-header.schema';

export const ExtendidoDtoSchema = LegacyHeaderSchema.extend({
  hai: z.string(),
  con: z.number(),
  injerto: z.string(),
  contenedor: z.string(),
  codigoCamaraGerminacion: z.number(),
  fechaSugeridaSiembra: z.string(),
  fechaSiembraReal: z.string(),
  diasEnCamara: z.number(),
  fechaEgresoCamara: z.string(),
  extendido: z.string(),
  codigoUbicacion: z.number().nullable(),
  nombreUbicacion: z.string().nullable(),
  stockInicial: z.number().nullable(),
  detalle: z.string().nullable(),
  baja: z.string().nullable(),
});

export type ExtendidoDto = z.infer<typeof ExtendidoDtoSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @vivero/shared test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/schemas/extendido.schema.ts packages/shared/src/schemas/__tests__/extendido.schema.test.ts
git commit -m "feat(shared): update extendidos schema to extend LegacyHeaderSchema"
```

---

### Task 4: Add Header Validation to Alerts Service

**Files:**
- Modify: `apps/backend/src/modules/legacy/alerts/alerts.service.ts`

**Interfaces:**
- Consumes: `LegacyHeader` type from shared
- Produces: `validateHeaderFields()` method, updated mapping functions

- [ ] **Step 1: Write the failing test**

```typescript
// apps/backend/src/modules/legacy/alerts/__tests__/alerts.service.test.ts
import { AlertsService } from '../alerts.service';
import { BadRequestException } from '@nestjs/common';

describe('AlertsService', () => {
  let service: AlertsService;

  beforeEach(() => {
    service = new AlertsService(/* mock dependencies */);
  });

  describe('validateHeaderFields', () => {
    it('should throw BadRequestException for missing header fields', () => {
      const row = {
        partidaId: 123,
        anio: 2024,
        indice: 1,
        // Missing codigoEspecie and nombreEspecie
      };

      expect(() => service.validateHeaderFields(row, 'alerts')).toThrow(BadRequestException);
      expect(() => service.validateHeaderFields(row, 'alerts')).toThrow('Missing required header fields');
    });

    it('should not throw for valid header fields', () => {
      const row = {
        partidaId: 123,
        anio: 2024,
        indice: 1,
        codigoEspecie: 'ESP001',
        nombreEspecie: 'Especie Test',
      };

      expect(() => service.validateHeaderFields(row, 'alerts')).not.toThrow();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter backend test`
Expected: FAIL with "validateHeaderFields is not a function"

- [ ] **Step 3: Implement validation method**

```typescript
// apps/backend/src/modules/legacy/alerts/alerts.service.ts
import { BadRequestException, Logger } from '@nestjs/common';

export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  validateHeaderFields(row: Record<string, any>, moduleName: string): void {
    const requiredFields = ['partidaId', 'anio', 'indice', 'codigoEspecie', 'nombreEspecie'];
    const missingFields = requiredFields.filter(
      field => row[field] === undefined || row[field] === null
    );

    if (missingFields.length > 0) {
      this.logger.error(`Header validation failed for ${moduleName}`, {
        missingFields,
        availableFields: Object.keys(row),
      });

      throw new BadRequestException(
        `Missing required header fields in ${moduleName}: ${missingFields.join(', ')}. ` +
        `Please check the SQL query or contact senior developer.`
      );
    }
  }

  // ... existing methods
}
```

- [ ] **Step 4: Update mapping functions to use validation**

```typescript
// In existing mapping functions, add validation call
private mapSiembraRetrasada(row: any): SiembraRetrasadaDto {
  this.validateHeaderFields(row, 'siembraRetrasada');
  
  return {
    // Header fields (now guaranteed to exist)
    partidaId: row.partidaId,
    anio: row.anio,
    indice: row.indice,
    codigoEspecie: row.planta, // Maps from SQL 'planta' field
    nombreEspecie: row.nombre, // Maps from SQL 'nombre' field
    // ... rest of fields
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter backend test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/modules/legacy/alerts/alerts.service.ts apps/backend/src/modules/legacy/alerts/__tests__/alerts.service.test.ts
git commit -m "feat(alerts): add header validation to alerts service"
```

---

### Task 5: Add Header Validation to Extendidos Service

**Files:**
- Modify: `apps/backend/src/modules/legacy/extendidos/extendidos.service.ts`

**Interfaces:**
- Consumes: `LegacyHeader` type from shared
- Produces: Updated `mapToDto()` with validation

- [ ] **Step 1: Write the failing test**

```typescript
// apps/backend/src/modules/legacy/extendidos/__tests__/extendidos.service.test.ts
import { ExtendidosService } from '../extendidos.service';
import { BadRequestException } from '@nestjs/common';

describe('ExtendidosService', () => {
  let service: ExtendidosService;

  beforeEach(() => {
    service = new ExtendidosService(/* mock dependencies */);
  });

  describe('mapToDto', () => {
    it('should throw BadRequestException for missing header fields', async () => {
      const row = {
        espvar: 'ESP001',
        // Missing other header fields
      };

      await expect(service.mapToDto(row)).rejects.toThrow(BadRequestException);
    });

    it('should map SQL fields to header fields correctly', async () => {
      const row = {
        partidaId: 123,
        anio: 2024,
        indice: 1,
        espvar: 'ESP001', // Maps to codigoEspecie
        especieNombre: 'Especie Test', // Maps to nombreEspecie
        // ... other fields
      };

      const result = await service.mapToDto(row);
      expect(result.codigoEspecie).toBe('ESP001');
      expect(result.nombreEspecie).toBe('Especie Test');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter backend test`
Expected: FAIL with validation errors

- [ ] **Step 3: Implement validation and mapping**

```typescript
// apps/backend/src/modules/legacy/extendidos/extendidos.service.ts
import { BadRequestException, Logger } from '@nestjs/common';

export class ExtendidosService {
  private readonly logger = new Logger(ExtendidosService.name);

  private validateHeaderFields(row: Record<string, any>): void {
    const requiredFields = ['partidaId', 'anio', 'indice', 'codigoEspecie', 'nombreEspecie'];
    const missingFields = requiredFields.filter(
      field => row[field] === undefined || row[field] === null
    );

    if (missingFields.length > 0) {
      this.logger.error('Header validation failed for extendidos', {
        missingFields,
        availableFields: Object.keys(row),
      });

      throw new BadRequestException(
        `Missing required header fields in extendidos: ${missingFields.join(', ')}. ` +
        `Please check the SQL query or contact senior developer.`
      );
    }
  }

  async mapToDto(row: any): Promise<ExtendidoDto> {
    // Map SQL fields to header fields
    const mappedRow = {
      ...row,
      codigoEspecie: row.espvar, // Map from SQL 'espvar'
      nombreEspecie: row.especieNombre, // Map from SQL 'especieNombre'
    };

    this.validateHeaderFields(mappedRow);

    return {
      // Header fields
      partidaId: mappedRow.partidaId,
      anio: mappedRow.anio,
      indice: mappedRow.indice,
      codigoEspecie: mappedRow.codigoEspecie,
      nombreEspecie: mappedRow.nombreEspecie,
      // ... rest of fields
    };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter backend test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/modules/legacy/extendidos/extendidos.service.ts apps/backend/src/modules/legacy/extendidos/__tests__/extendidos.service.test.ts
git commit -m "feat(extendidos): add header validation to extendidos service"
```

---

### Task 6: Create Shared Header Utilities for Frontend

**Files:**
- Create: `apps/frontend/src/features/shared/utils/header.ts`
- Create: `apps/frontend/src/features/shared/utils/__tests__/header.test.ts`

**Interfaces:**
- Consumes: `LegacyHeader` type from shared
- Produces: `formatPartidaHeader()`, `formatPartidaNumber()`, `formatSpecies()`

- [ ] **Step 1: Write the failing test**

```typescript
// apps/frontend/src/features/shared/utils/__tests__/header.test.ts
import { formatPartidaHeader, formatPartidaNumber, formatSpecies } from '../header';
import { LegacyHeader } from '@vivero/shared';

describe('Header Utilities', () => {
  const mockHeader: LegacyHeader = {
    partidaId: 123,
    anio: 2024,
    indice: 1,
    codigoEspecie: 'ESP001',
    nombreEspecie: 'Especie Test',
  };

  describe('formatPartidaHeader', () => {
    it('should format full header correctly', () => {
      const result = formatPartidaHeader(mockHeader);
      expect(result).toBe('#123/1 - ESP001 · Especie Test');
    });
  });

  describe('formatPartidaNumber', () => {
    it('should format partida number correctly', () => {
      const result = formatPartidaNumber(mockHeader);
      expect(result).toBe('#123/1');
    });
  });

  describe('formatSpecies', () => {
    it('should format species correctly', () => {
      const result = formatSpecies(mockHeader);
      expect(result).toBe('ESP001 · Especie Test');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter frontend test`
Expected: FAIL with "Cannot find module '../header'"

- [ ] **Step 3: Implement header utilities**

```typescript
// apps/frontend/src/features/shared/utils/header.ts
import { LegacyHeader } from '@vivero/shared';

export function formatPartidaHeader(header: LegacyHeader): string {
  return `#${header.partidaId}/${header.indice} - ${header.codigoEspecie} · ${header.nombreEspecie}`;
}

export function formatPartidaNumber(header: LegacyHeader): string {
  return `#${header.partidaId}/${header.indice}`;
}

export function formatSpecies(header: LegacyHeader): string {
  return `${header.codigoEspecie} · ${header.nombreEspecie}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter frontend test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/shared/utils/header.ts apps/frontend/src/features/shared/utils/__tests__/header.test.ts
git commit -m "feat(frontend): add shared header utilities"
```

---

### Task 7: Update Alerts Frontend Components

**Files:**
- Modify: `apps/frontend/src/features/alerts/components/v1/alerts-view-form.tsx`

**Interfaces:**
- Consumes: `formatPartidaHeader()` from Task 6
- Produces: Updated alerts view with consistent header display

- [ ] **Step 1: Write the failing test**

```typescript
// apps/frontend/src/features/alerts/components/__tests__/alerts-view-form.test.tsx
import { render, screen } from '@testing-library/react';
import { AlertsViewForm } from '../v1/alerts-view-form';

describe('AlertsViewForm', () => {
  it('should display header in consistent format', () => {
    const mockAlert = {
      partidaId: 123,
      anio: 2024,
      indice: 1,
      codigoEspecie: 'ESP001',
      nombreEspecie: 'Especie Test',
      // ... other fields
    };

    render(<AlertsViewForm alert={mockAlert} />);
    
    expect(screen.getByText('#123/1 - ESP001 · Especie Test')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter frontend test`
Expected: FAIL with missing text

- [ ] **Step 3: Update alerts view form**

```typescript
// apps/frontend/src/features/alerts/components/v1/alerts-view-form.tsx
import { formatPartidaHeader } from '@/features/shared/utils/header';

export function AlertsViewForm({ alert }: AlertsViewFormProps) {
  return (
    <div>
      <div className="header">
        {formatPartidaHeader(alert)}
      </div>
      {/* ... rest of component */}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter frontend test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/alerts/components/v1/alerts-view-form.tsx apps/frontend/src/features/alerts/components/__tests__/alerts-view-form.test.tsx
git commit -m "feat(alerts): update alerts view to use consistent header format"
```

---

### Task 8: Update Extendidos Frontend Components

**Files:**
- Modify: `apps/frontend/src/features/extendidos/components/extendido-view-form.tsx`
- Modify: `apps/frontend/src/features/extendidos/components/columns.tsx`

**Interfaces:**
- Consumes: `formatPartidaHeader()` from Task 6
- Produces: Updated extendidos view with consistent header display

- [ ] **Step 1: Write the failing test**

```typescript
// apps/frontend/src/features/extendidos/components/__tests__/extendido-view-form.test.tsx
import { render, screen } from '@testing-library/react';
import { ExtendidoViewForm } from '../extendido-view-form';

describe('ExtendidoViewForm', () => {
  it('should display header in consistent format', () => {
    const mockExtendido = {
      partidaId: 123,
      anio: 2024,
      indice: 1,
      codigoEspecie: 'ESP001',
      nombreEspecie: 'Especie Test',
      // ... other fields
    };

    render(<ExtendidoViewForm extendido={mockExtendido} />);
    
    expect(screen.getByText('#123/1 - ESP001 · Especie Test')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter frontend test`
Expected: FAIL with missing text

- [ ] **Step 3: Update extendidos view form**

```typescript
// apps/frontend/src/features/extendidos/components/extendido-view-form.tsx
import { formatPartidaHeader } from '@/features/shared/utils/header';

export function ExtendidoViewForm({ extendido }: ExtendidoViewFormProps) {
  return (
    <div>
      <div className="header">
        {formatPartidaHeader(extendido)}
      </div>
      {/* ... rest of component */}
    </div>
  );
}
```

- [ ] **Step 4: Update columns to use header format**

```typescript
// apps/frontend/src/features/extendidos/components/columns.tsx
import { formatPartidaNumber, formatSpecies } from '@/features/shared/utils/header';

export const columns: ColumnDef<ExtendidoDto>[] = [
  {
    accessorKey: 'partidaId',
    header: 'Partida',
    cell: ({ row }) => formatPartidaNumber(row.original),
  },
  {
    accessorKey: 'codigoEspecie',
    header: 'Especie',
    cell: ({ row }) => formatSpecies(row.original),
  },
  // ... other columns
];
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter frontend test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/features/extendidos/components/extendido-view-form.tsx apps/frontend/src/features/extendidos/components/columns.tsx apps/frontend/src/features/extendidos/components/__tests__/extendido-view-form.test.tsx
git commit -m "feat(extendidos): update extendidos view to use consistent header format"
```

---

### Task 9: Run Full Verification

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Verified, working implementation

- [ ] **Step 1: Run linting**

Run: `pnpm lint`
Expected: No errors

- [ ] **Step 2: Run type checking**

Run: `pnpm type-check`
Expected: No errors

- [ ] **Step 3: Run all tests**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 4: Run integration tests**

Run: `pnpm --filter backend test:integration`
Expected: Integration tests pass

- [ ] **Step 5: Commit final changes**

```bash
git add -A
git commit -m "chore: verify legacy header standardization implementation"
```

---

## Self-Review Checklist

1. **Spec coverage:** All requirements from the design spec are covered by tasks
2. **Placeholder scan:** No TBD, TODO, or placeholder content in tasks
3. **Type consistency:** All types, method signatures, and property names are consistent across tasks
4. **Test coverage:** Each task includes failing tests before implementation
5. **Commit strategy:** Each task ends with a meaningful commit
6. **Error handling:** Validation and error messages are clear and descriptive

## Success Criteria

- ✅ All legacy modules return data with consistent header format
- ✅ Frontend displays header fields consistently across all modules
- ✅ Clear error messages when header fields are missing
- ✅ No breaking changes to existing functionality
- ✅ All tests pass
- ✅ Code follows existing patterns and conventions