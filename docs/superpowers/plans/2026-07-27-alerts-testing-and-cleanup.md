# Alerts Testing & V2/V3 Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove unused V2/V3 alert versions and add comprehensive test coverage across backend (service, controller, integration) and frontend (hooks, service, V1 components).

**Architecture:** V2/V3 removal is a clean deletion of 15 files + index.ts cleanup. Tests follow existing patterns: NestJS `Test.createTestingModule` for backend unit tests, Jest + React Testing Library for frontend. Integration tests use the existing MariaDB infrastructure.

**Tech Stack:** Jest, NestJS Testing Module, React Testing Library, @tanstack/react-query, Zod

## Global Constraints

- Spanish-only UI strings
- Conventional Commits enforced by commitlint
- TDD: tests before implementation code
- Follow existing patterns: NestJS testing module, React Testing Library, Zod schema validation
- Backend coverage thresholds: branches 60%, functions 80%, lines 70%, statements 70%

---

### Task 1: V2/V3 Removal

**Files:**
- Delete: `apps/frontend/src/features/alerts/components/v2/` (6 files)
- Delete: `apps/frontend/src/features/alerts/components/v3/` (4 files)
- Delete: `apps/frontend/src/app/(dashboard)/alerts/v2/` (2 files)
- Delete: `apps/frontend/src/app/(dashboard)/alerts/v3/` (2 files)
- Delete: `apps/frontend/src/features/alerts/hooks/useAlertActions.ts`
- Modify: `apps/frontend/src/features/alerts/index.ts`

**Interfaces:**
- Consumes: nothing (independent task)
- Produces: clean codebase with V2/V3 removed, type-check errors fixed

- [ ] **Step 1: Delete V3 files first (V3 depends on V2 cards)**

```bash
rm -rf apps/frontend/src/features/alerts/components/v3/
rm -rf apps/frontend/src/app/(dashboard)/alerts/v3/
```

- [ ] **Step 2: Delete V2 files**

```bash
rm -rf apps/frontend/src/features/alerts/components/v2/
rm -rf apps/frontend/src/app/(dashboard)/alerts/v2/
```

- [ ] **Step 3: Delete useAlertActions hook**

```bash
rm apps/frontend/src/features/alerts/hooks/useAlertActions.ts
```

- [ ] **Step 4: Edit index.ts to remove V2/V3/useAlertActions exports**

Open `apps/frontend/src/features/alerts/index.ts` and remove these lines:

```typescript
// Remove these lines:
export { FilterTabs, type AlertTab } from "./components/shared/filter-tabs";
export { AlertsDashboardV2 } from "./components/v2/AlertsDashboardV2";
export { AlertsDashboardV3 } from "./components/v3/AlertsDashboardV3";
export { useAlertActions } from "./hooks/useAlertActions";
```

Keep all other exports (shared components, V1, hooks, services).

- [ ] **Step 5: Verify type-check passes**

Run: `pnpm type-check`
Expected: PASS (V2/V3 type errors should be gone)

- [ ] **Step 6: Verify lint passes**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 7: Verify tests still pass**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(alerts): remove unused V2/V3 alert versions"
```

---

### Task 2: Backend Service Mapper Tests

**Files:**
- Create: `apps/backend/src/modules/legacy/alerts/__tests__/alerts.service.spec.ts`

**Interfaces:**
- Consumes: `AlertsService` from `apps/backend/src/modules/legacy/alerts/alerts.service.ts`
- Produces: verified field mapping correctness for all 4 mappers

- [ ] **Step 1: Create test file with mapper tests**

Create `apps/backend/src/modules/legacy/alerts/__tests__/alerts.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from '../alerts.service';
import { AlertsRepository } from '../repositories/alerts.repository';
import {
  LegacySiembraRetrasada,
  LegacyFaltaGerminacion,
  LegacyFaltantePlantas,
  LegacyFaltaPreExpedicion,
} from '../interfaces/alerts.interface';

describe('AlertsService', () => {
  let service: AlertsService;
  let repository: jest.Mocked<AlertsRepository>;

  const mockRepository = {
    findSiembraRetrasada: jest.fn(),
    findFaltaGerminacion: jest.fn(),
    findFaltantePlantas: jest.fn(),
    findFaltaPreExpedicion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        { provide: AlertsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    repository = module.get(AlertsRepository);
    jest.clearAllMocks();
  });

  describe('getSiembraRetrasada', () => {
    it('maps legacy fields to DTO correctly', async () => {
      const legacyRow: LegacySiembraRetrasada = {
        partida: 1045,
        ano: 2026,
        indice: 1,
        espvar: 'EUC01',
        nombre: 'Eucalipto Grandis',
        injerto: 'I001',
        nrocont: '48',
        contenedor: 'Ban Plastico',
        semSiembra: '24-2026',
        f_siem: '2026-06-01',
        f_siembra: 0,
        semEntrega: '28-2026 1',
        f_ent: '2026-07-15',
        estado: 'PENDIENTE',
      } as LegacySiembraRetrasada;

      repository.findSiembraRetrasada.mockResolvedValue([legacyRow]);

      const result = await service.getSiembraRetrasada();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
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
      });
    });

    it('returns empty array when no data', async () => {
      repository.findSiembraRetrasada.mockResolvedValue([]);
      const result = await service.getSiembraRetrasada();
      expect(result).toEqual([]);
    });
  });

  describe('getFaltaGerminacion', () => {
    it('maps legacy fields to DTO correctly', async () => {
      const legacyRow: LegacyFaltaGerminacion = {
        partida: 1050,
        ano: 2026,
        indice: 1,
        espvar: 'ROS01',
        nombre: 'Rosa Hybrid Tea',
        injerto: 'I002',
        nrocont: '104',
        contenedor: 'Bandeja 104',
        f_primer: '2026-07-01',
        pr: '0',
      } as LegacyFaltaGerminacion;

      repository.findFaltaGerminacion.mockResolvedValue([legacyRow]);

      const result = await service.getFaltaGerminacion();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
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
      });
    });

    it('keeps pr as string (decimal precision)', async () => {
      const legacyRow: LegacyFaltaGerminacion = {
        partida: 1051,
        ano: 2026,
        indice: 1,
        espvar: 'EUC01',
        nombre: 'Eucalipto',
        injerto: 'I001',
        nrocont: '48',
        contenedor: 'Ban Plastico',
        f_primer: '2026-07-01',
        pr: '85.5',
      } as LegacyFaltaGerminacion;

      repository.findFaltaGerminacion.mockResolvedValue([legacyRow]);

      const result = await service.getFaltaGerminacion();

      expect(result[0].pr).toBe('85.5');
      expect(typeof result[0].pr).toBe('string');
    });
  });

  describe('getFaltantePlantas', () => {
    it('maps legacy fields to DTO correctly', async () => {
      const legacyRow: LegacyFaltantePlantas = {
        hai: 'A',
        partida: 1048,
        ano: 2026,
        indice: 1,
        espvar: 'EUC01',
        nombre: 'Eucalipto Grandis',
        nrocont: '500',
        contenedor: 'Ban Plastico',
        solicito: 500,
        f_primer: '2026-06-15',
        pr: '85.5',
        st_ini_pr: '4',
        porPr: 171,
      } as LegacyFaltantePlantas;

      repository.findFaltantePlantas.mockResolvedValue([legacyRow]);

      const result = await service.getFaltantePlantas();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
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
      });
    });

    it('keeps pr and stIniPr as strings', async () => {
      const legacyRow: LegacyFaltantePlantas = {
        hai: 'A',
        partida: 1049,
        ano: 2026,
        indice: 1,
        espvar: 'ROS01',
        nombre: 'Rosa',
        nrocont: '100',
        contenedor: 'Bandeja',
        solicito: 200,
        f_primer: '2026-06-15',
        pr: '92.3',
        st_ini_pr: '2',
        porPr: 184,
      } as LegacyFaltantePlantas;

      repository.findFaltantePlantas.mockResolvedValue([legacyRow]);

      const result = await service.getFaltantePlantas();

      expect(result[0].pr).toBe('92.3');
      expect(result[0].stIniPr).toBe('2');
      expect(typeof result[0].pr).toBe('string');
      expect(typeof result[0].stIniPr).toBe('string');
    });
  });

  describe('getFaltaPreExpedicion', () => {
    it('maps legacy fields to DTO correctly', async () => {
      const legacyRow: LegacyFaltaPreExpedicion = {
        partida: 1052,
        ano: 2026,
        indice: 1,
        espvar: 'LIM02',
        nombre: 'Limonero Volkameriano',
        injerto: 'I003',
        nrocont: '96',
        contenedor: 'Ban Plastico',
        f_preexp: '2026-07-20',
        pe: 0,
      } as LegacyFaltaPreExpedicion;

      repository.findFaltaPreExpedicion.mockResolvedValue([legacyRow]);

      const result = await service.getFaltaPreExpedicion();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
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
      });
    });

    it('returns empty array when no data', async () => {
      repository.findFaltaPreExpedicion.mockResolvedValue([]);
      const result = await service.getFaltaPreExpedicion();
      expect(result).toEqual([]);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `pnpm --filter backend test -- --testPathPattern="alerts.service.spec"`
Expected: PASS (8 tests)

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/legacy/alerts/__tests__/alerts.service.spec.ts
git commit -m "test(backend): add service mapper unit tests for alerts"
```

---

### Task 3: Backend Controller Tests

**Files:**
- Create: `apps/backend/src/modules/legacy/alerts/__tests__/alerts.controller.spec.ts`

**Interfaces:**
- Consumes: `AlertsController` from `apps/backend/src/modules/legacy/alerts/alerts.controller.ts`
- Produces: verified endpoint behavior and permission decorator application

- [ ] **Step 1: Create test file with controller tests**

Create `apps/backend/src/modules/legacy/alerts/__tests__/alerts.controller.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AlertsController } from '../alerts.controller';
import { AlertsService } from '../alerts.service';

describe('AlertsController', () => {
  let controller: AlertsController;
  let service: jest.Mocked<AlertsService>;

  const mockService = {
    getSiembraRetrasada: jest.fn(),
    getFaltaGerminacion: jest.fn(),
    getFaltantePlantas: jest.fn(),
    getFaltaPreExpedicion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertsController],
      providers: [{ provide: AlertsService, useValue: mockService }],
    }).compile();

    controller = module.get<AlertsController>(AlertsController);
    service = module.get(AlertsService);
    jest.clearAllMocks();
  });

  describe('GET /l-alerts/siembra-retrasada', () => {
    it('returns siembra retrasada alerts', async () => {
      const mockData = [
        {
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
        },
      ];
      mockService.getSiembraRetrasada.mockResolvedValue(mockData);

      const result = await controller.getSiembraRetrasada();

      expect(result).toEqual(mockData);
      expect(mockService.getSiembraRetrasada).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /l-alerts/falta-germinacion', () => {
    it('returns falta germinacion alerts', async () => {
      const mockData = [
        {
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
        },
      ];
      mockService.getFaltaGerminacion.mockResolvedValue(mockData);

      const result = await controller.getFaltaGerminacion();

      expect(result).toEqual(mockData);
      expect(mockService.getFaltaGerminacion).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /l-alerts/faltante-plantas', () => {
    it('returns faltante plantas alerts', async () => {
      const mockData = [
        {
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
        },
      ];
      mockService.getFaltantePlantas.mockResolvedValue(mockData);

      const result = await controller.getFaltantePlantas();

      expect(result).toEqual(mockData);
      expect(mockService.getFaltantePlantas).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /l-alerts/falta-pre-expedicion', () => {
    it('returns falta pre-expedicion alerts', async () => {
      const mockData = [
        {
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
        },
      ];
      mockService.getFaltaPreExpedicion.mockResolvedValue(mockData);

      const result = await controller.getFaltaPreExpedicion();

      expect(result).toEqual(mockData);
      expect(mockService.getFaltaPreExpedicion).toHaveBeenCalledTimes(1);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `pnpm --filter backend test -- --testPathPattern="alerts.controller.spec"`
Expected: PASS (4 tests)

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/legacy/alerts/__tests__/alerts.controller.spec.ts
git commit -m "test(backend): add controller unit tests for alerts endpoints"
```

---

### Task 4: Backend Integration Tests

**Files:**
- Create: `apps/backend/test/integration/alerts.integration.spec.ts`

**Interfaces:**
- Consumes: Running MariaDB instance with seeded data
- Produces: verified SQL query correctness + DTO schema validation

- [ ] **Step 1: Create integration test file**

Create `apps/backend/test/integration/alerts.integration.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import {
  SiembraRetrasadaDtoSchema,
  FaltaGerminacionDtoSchema,
  FaltantePlantasDtoSchema,
  FaltaPreExpedicionDtoSchema,
} from '@vivero/shared';

describe('Alerts Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('GET /l-alerts/siembra-retrasada', () => {
    it('returns data matching SiembraRetrasadaDtoSchema', async () => {
      const response = await request(app.getHttpServer())
        .get('/l-alerts/siembra-retrasada')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        const parsed = SiembraRetrasadaDtoSchema.safeParse(response.body[0]);
        expect(parsed.success).toBe(true);
      }
    });
  });

  describe('GET /l-alerts/falta-germinacion', () => {
    it('returns data matching FaltaGerminacionDtoSchema', async () => {
      const response = await request(app.getHttpServer())
        .get('/l-alerts/falta-germinacion')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        const parsed = FaltaGerminacionDtoSchema.safeParse(response.body[0]);
        expect(parsed.success).toBe(true);
      }
    });
  });

  describe('GET /l-alerts/faltante-plantas', () => {
    it('returns data matching FaltantePlantasDtoSchema', async () => {
      const response = await request(app.getHttpServer())
        .get('/l-alerts/faltante-plantas')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        const parsed = FaltantePlantasDtoSchema.safeParse(response.body[0]);
        expect(parsed.success).toBe(true);
      }
    });
  });

  describe('GET /l-alerts/falta-pre-expedicion', () => {
    it('returns data matching FaltaPreExpedicionDtoSchema', async () => {
      const response = await request(app.getHttpServer())
        .get('/l-alerts/falta-pre-expedicion')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        const parsed = FaltaPreExpedicionDtoSchema.safeParse(response.body[0]);
        expect(parsed.success).toBe(true);
      }
    });
  });
});
```

- [ ] **Step 2: Run integration tests**

Run: `pnpm --filter backend test:integration -- --testPathPattern="alerts.integration"`
Expected: PASS (4 tests, requires running MariaDB)

- [ ] **Step 3: Commit**

```bash
git add apps/backend/test/integration/alerts.integration.spec.ts
git commit -m "test(backend): add integration tests for alerts SQL queries"
```

---

### Task 5: Frontend Hook Tests

**Files:**
- Create: `apps/frontend/src/features/alerts/__tests__/useAlerts.test.tsx`

**Interfaces:**
- Consumes: `useAlerts` hooks from `apps/frontend/src/features/alerts/hooks/useAlerts.ts`
- Produces: verified hook behavior with mocked service

- [ ] **Step 1: Create test file with hook tests**

Create `apps/frontend/src/features/alerts/__tests__/useAlerts.test.tsx`:

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useSiembraRetrasada,
  useFaltaGerminacion,
  useFaltantePlantas,
  useFaltaPreExpedicion,
} from '../hooks/useAlerts';
import * as alertService from '../api/alertService';

jest.mock('../api/alertService');
const mockAlertService = alertService as jest.Mocked<typeof alertService>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAlerts hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useSiembraRetrasada', () => {
    it('calls fetchSiembraRetrasada and returns data', async () => {
      const mockData = [{ partidaId: 1045, anio: 2026 }];
      mockAlertService.fetchSiembraRetrasada.mockResolvedValue(mockData as any);

      const { result } = renderHook(() => useSiembraRetrasada(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockAlertService.fetchSiembraRetrasada).toHaveBeenCalledTimes(1);
    });
  });

  describe('useFaltaGerminacion', () => {
    it('calls fetchFaltaGerminacion and returns data', async () => {
      const mockData = [{ partidaId: 1050, anio: 2026 }];
      mockAlertService.fetchFaltaGerminacion.mockResolvedValue(mockData as any);

      const { result } = renderHook(() => useFaltaGerminacion(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockAlertService.fetchFaltaGerminacion).toHaveBeenCalledTimes(1);
    });
  });

  describe('useFaltantePlantas', () => {
    it('calls fetchFaltantePlantas and returns data', async () => {
      const mockData = [{ partidaId: 1048, anio: 2026 }];
      mockAlertService.fetchFaltantePlantas.mockResolvedValue(mockData as any);

      const { result } = renderHook(() => useFaltantePlantas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockAlertService.fetchFaltantePlantas).toHaveBeenCalledTimes(1);
    });
  });

  describe('useFaltaPreExpedicion', () => {
    it('calls fetchFaltaPreExpedicion and returns data', async () => {
      const mockData = [{ partidaId: 1052, anio: 2026 }];
      mockAlertService.fetchFaltaPreExpedicion.mockResolvedValue(mockData as any);

      const { result } = renderHook(() => useFaltaPreExpedicion(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockAlertService.fetchFaltaPreExpedicion).toHaveBeenCalledTimes(1);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `pnpm --filter frontend test -- --testPathPattern="useAlerts.test"`
Expected: PASS (4 tests)

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/alerts/__tests__/useAlerts.test.tsx
git commit -m "test(frontend): add useAlerts hook unit tests"
```

---

### Task 6: Frontend Service Tests

**Files:**
- Create: `apps/frontend/src/features/alerts/__tests__/alertService.test.ts`

**Interfaces:**
- Consumes: `alertService` from `apps/frontend/src/features/alerts/api/alertService.ts`
- Produces: verified fetch functions with correct URLs and error handling

- [ ] **Step 1: Create test file with service tests**

Create `apps/frontend/src/features/alerts/__tests__/alertService.test.ts`:

```typescript
import {
  fetchSiembraRetrasada,
  fetchFaltaGerminacion,
  fetchFaltantePlantas,
  fetchFaltaPreExpedicion,
} from '../api/alertService';

jest.mock('@/lib/client-fetch', () => ({
  clientFetch: jest.fn(),
}));

import { clientFetch } from '@/lib/client-fetch';
const mockClientFetch = clientFetch as jest.MockedFunction<typeof clientFetch>;

describe('alertService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchSiembraRetrasada', () => {
    it('calls correct URL and returns data', async () => {
      const mockData = [{ partidaId: 1045 }];
      mockClientFetch.mockResolvedValue(mockData as any);

      const result = await fetchSiembraRetrasada();

      expect(mockClientFetch).toHaveBeenCalledWith('/l-alerts/siembra-retrasada');
      expect(result).toEqual(mockData);
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(fetchSiembraRetrasada()).rejects.toThrow('Network error');
    });
  });

  describe('fetchFaltaGerminacion', () => {
    it('calls correct URL and returns data', async () => {
      const mockData = [{ partidaId: 1050 }];
      mockClientFetch.mockResolvedValue(mockData as any);

      const result = await fetchFaltaGerminacion();

      expect(mockClientFetch).toHaveBeenCalledWith('/l-alerts/falta-germinacion');
      expect(result).toEqual(mockData);
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(fetchFaltaGerminacion()).rejects.toThrow('Network error');
    });
  });

  describe('fetchFaltantePlantas', () => {
    it('calls correct URL and returns data', async () => {
      const mockData = [{ partidaId: 1048 }];
      mockClientFetch.mockResolvedValue(mockData as any);

      const result = await fetchFaltantePlantas();

      expect(mockClientFetch).toHaveBeenCalledWith('/l-alerts/faltante-plantas');
      expect(result).toEqual(mockData);
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(fetchFaltantePlantas()).rejects.toThrow('Network error');
    });
  });

  describe('fetchFaltaPreExpedicion', () => {
    it('calls correct URL and returns data', async () => {
      const mockData = [{ partidaId: 1052 }];
      mockClientFetch.mockResolvedValue(mockData as any);

      const result = await fetchFaltaPreExpedicion();

      expect(mockClientFetch).toHaveBeenCalledWith('/l-alerts/falta-pre-expedicion');
      expect(result).toEqual(mockData);
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(fetchFaltaPreExpedicion()).rejects.toThrow('Network error');
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `pnpm --filter frontend test -- --testPathPattern="alertService.test"`
Expected: PASS (8 tests)

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/alerts/__tests__/alertService.test.ts
git commit -m "test(frontend): add alertService fetch function unit tests"
```

---

### Task 7: Frontend V1 Component Tests

**Files:**
- Create: `apps/frontend/src/features/alerts/components/v1/__tests__/AlertsDashboardV1.test.tsx`
- Create: `apps/frontend/src/features/alerts/components/v1/__tests__/alerts-data-table.test.tsx`

**Interfaces:**
- Consumes: `AlertsDashboardV1` and `AlertsDataTable` from V1 components
- Produces: verified component rendering and behavior

- [ ] **Step 1: Create AlertsDashboardV1 test file**

Create `apps/frontend/src/features/alerts/components/v1/__tests__/AlertsDashboardV1.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import AlertsDashboardV1 from '../AlertsDashboardV1';

jest.mock('@/features/alerts/hooks/useAlerts', () => ({
  useSiembraRetrasada: () => ({
    data: [
      {
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
      },
    ],
    isLoading: false,
  }),
  useFaltaGerminacion: () => ({ data: [], isLoading: false }),
  useFaltantePlantas: () => ({ data: [], isLoading: false }),
  useFaltaPreExpedicion: () => ({ data: [], isLoading: false }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('AlertsDashboardV1', () => {
  it('renders without crashing', () => {
    render(<AlertsDashboardV1 />, { wrapper: createWrapper() });
    expect(screen.getByText('Alertas')).toBeInTheDocument();
  });

  it('displays siembra retrasada data', () => {
    render(<AlertsDashboardV1 />, { wrapper: createWrapper() });
    expect(screen.getByText('#1045')).toBeInTheDocument();
    expect(screen.getByText('EUC01')).toBeInTheDocument();
  });

  it('renders all four alert sections', () => {
    render(<AlertsDashboardV1 />, { wrapper: createWrapper() });
    expect(screen.getByText('Siembra Retrasada')).toBeInTheDocument();
    expect(screen.getByText('Falta Germinación')).toBeInTheDocument();
    expect(screen.getByText('Faltante Plantas')).toBeInTheDocument();
    expect(screen.getByText('Falta Pre-Expedición')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Create AlertsDataTable test file**

Create `apps/frontend/src/features/alerts/components/v1/__tests__/alerts-data-table.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { AlertsDataTable } from '../alerts-data-table';

const mockColumns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
];

const mockData = [
  { id: 1, name: 'Test Item 1' },
  { id: 2, name: 'Test Item 2' },
];

describe('AlertsDataTable', () => {
  it('renders table with data', () => {
    render(
      <AlertsDataTable
        columns={mockColumns}
        data={mockData}
        title="Test Table"
      />
    );

    expect(screen.getByText('Test Table')).toBeInTheDocument();
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(
      <AlertsDataTable
        columns={mockColumns}
        data={[]}
        title="Empty Table"
      />
    );

    expect(screen.getByText('Empty Table')).toBeInTheDocument();
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(
      <AlertsDataTable
        columns={mockColumns}
        data={mockData}
        title="Headers Table"
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `pnpm --filter frontend test -- --testPathPattern="(AlertsDashboardV1|alerts-data-table).test"`
Expected: PASS (6 tests)

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/alerts/components/v1/__tests__/
git commit -m "test(frontend): add V1 component smoke and behavior tests"
```

---

### Task 8: Final Verification

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: All previous tasks
- Produces: confirmed full test suite passes

- [ ] **Step 1: Run full test suite**

Run: `pnpm test`
Expected: PASS (all tests across shared, backend, frontend)

- [ ] **Step 2: Run type-check**

Run: `pnpm type-check`
Expected: PASS (V2/V3 type errors should be gone)

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 4: Verify no V2/V3 references remain**

Run: `grep -r "v2\|v3\|V2\|V3" apps/frontend/src/features/alerts/ --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v ".test."`
Expected: No output (clean removal)

- [ ] **Step 5: Final commit if needed**

```bash
git add -A
git commit -m "chore(alerts): final cleanup after V2/V3 removal and test coverage"
```
