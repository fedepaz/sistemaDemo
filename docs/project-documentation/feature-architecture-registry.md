# Feature Architecture Registry

This document tracks the adoption of the project's frontend architectural standards for each domain feature in `apps/frontend/src/features/`.

## 🛠️ Architectural Standards Checklist

When developing or reviewing a feature, ensure it complies with the following:

| Requirement           | Description                                                                                              |
| :-------------------- | :------------------------------------------------------------------------------------------------------- |
| **API Service**       | Existence of `api/` directory with a stateless service object encapsulating `clientFetch` calls.         |
| **Clean Hooks**       | TanStack Query hooks invoke service methods; no `clientFetch` calls inside hooks.                        |
| **Suspense Ready**    | All GET requests use `useSuspenseQuery` for declarative loading states.                                  |
| **Skeleton Strategy** | Presence of a matching skeleton component in `components/` and usage in `loading.tsx`                    |
| **API Proxying**      | External API calls (Weather, etc.) must be proxied via `/api/*` routes for security and CORS compliance. |
| **DTO Alignment**     | Exclusively uses DTOs from `@vivero/shared` for all data contracts.                                      |

---

## 🏗️ Feature Registry Status

| Feature         | API Service | Clean Hooks | Suspense Ready | Skeleton | DTO Alignment |
| :-------------- | :---------: | :---------: | :------------: | :------: | :-----------: |
| **Audit Logs**  |     [x]     |     [x]     |      [x]       |   [x]    |      [x]      |
| **Auth**        |     [x]     |     [x]     |      [x]       |   [x]    |      [x]      |
| **Dashboard**   |     [x]     |     [x]     |      [x]       |   [x]    |      [x]      |
| **Entities**    |     [x]     |     [x]     |      [x]       |   [x]    |      [x]      |
| **Extendidos**  |     [x]     |     [x]     |      [x]       |   [x]    |      [x]      |
| **Permissions** |     [x]     |     [x]     |      [x]       |   [x]    |      [x]      |
| **Siembra**     |     [x]     |     [x]     |      [x]       |   [x]    |      [x]      |
| **Users**       |     [x]     |     [x]     |      [x]       |   [x]    |      [x]      |

---

## 📖 Pattern Reference: API Service Pattern

**Stateless Service Example (`api/extendidoService.ts`):**

```typescript
import { clientFetch } from "@/lib/api/client-fetch";
import { ExtendidoDto } from "@vivero/shared";

export const extendidoService = {
  fetchByFecha: (fecha: string) =>
    clientFetch<ExtendidoDto[]>(`l-extendidos/fecha/${fecha}`, {
      method: "GET",
    }),
};
```

**Clean Hook Example (`hooks/useExtendidos.ts`):**

```typescript
import { useSuspenseQuery } from "@tanstack/react-query";
import { extendidoService } from "../api/extendidoService";

export const useExtendidosByFecha = (fecha: string) =>
  useSuspenseQuery({
    queryKey: ["extendidos", "byFecha", fecha],
    queryFn: () => extendidoService.fetchByFecha(fecha),
  });
```

**Pattern Reference: Legacy System Integration (Extendidos Domain)**

- **Validation**: `detalle` field limited to 30 characters; `extendido` used for long notes.
- **Data Mapping**: Table columns now include `contenedor` for operational clarity.
