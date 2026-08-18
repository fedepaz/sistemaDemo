# AgriManage

[![Build Verification](https://github.com/fedepaz/sistemaDemo/actions/workflows/build-verification.yml/badge.svg)](https://github.com/fedepaz/sistemaDemo/actions/workflows/build-verification.yml)
[![PR Checks](https://github.com/fedepaz/sistemaDemo/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/fedepaz/sistemaDemo/actions/workflows/pr-checks.yml)
[![CI Tests](https://github.com/fedepaz/sistemaDemo/actions/workflows/ci-test.yml/badge.svg)](https://github.com/fedepaz/sistemaDemo/actions/workflows/ci-test.yml)
[![Scheduled](https://github.com/fedepaz/sistemaDemo/actions/workflows/scheduled.yml/badge.svg)](https://github.com/fedepaz/sistemaDemo/actions/workflows/scheduled.yml)

Aplicación de gestión agrícola (vivero). Monorepo con pnpm + Turborepo:
- **`apps/frontend`** — Next.js 16 (App Router) + Tailwind v4 + shadcn/ui
- **`apps/backend`** — NestJS 11 + Prisma + MariaDB (incluye integración con la base legada `martin3`)
- **`packages/shared`** — Schemas Zod y DTOs (`@vivero/shared`)

> Despliegue de producción: **un servidor Windows**, aplicaciones por proceso (sin Docker/PM2/Nginx) y **Cloudflare Tunnel**. Ver `docs/deployment/production.md`.

## Requisitos

- Node.js >= 20
- pnpm 10+

## Instalación inicial

```bash
pnpm install     # instala dependencias de todo el monorepo
pnpm dev         # frontend en :3000 + backend en :3001
```

### Configuración de entorno

El backend requiere variables de entorno (validadas por Joi). Copia los ejemplos y complétalos:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Variables clave del backend: `BACKEND_NODE_ENV`, `PORT`, `DATABASE_DEV_*` (y `DATABASE_LEGACY_*` para la base legada), `DATABASE_PROD_*`, `JWT_SECRET`, `JWT_REFRESH_SECRET`.

### Base de datos

```bash
pnpm --filter backend db:migrate:dev   # crear/actualizar migraciones Prisma
pnpm --filter backend db:seed:users    # sembrar usuarios de prueba
pnpm --filter backend db:seed:admin    # sembrar usuario admin
pnpm --filter backend db:studio        # abrir Prisma Studio
```

## Comandos

```bash
pnpm dev              # desarrollo (frontend + backend, hot-reload)
pnpm dev:frontend     # solo frontend
pnpm dev:backend      # solo backend
pnpm build            # build de producción (shared + frontend + backend)
pnpm lint             # linter
pnpm type-check       # type-check de todos los paquetes
pnpm test             # tests unitarios (shared 114, backend 105, frontend 104)
pnpm --filter backend test:integration   # tests HTTP de integración (43)
pnpm format           # formatear código
```

## CI/CD

GitHub Actions **verifica calidad** (no despliega). Despliegue: manual (ver `docs/deployment/production.md`).

| Workflow | Trigger | Qué hace |
|----------|---------|----------|
| `ci-test.yml` | reutilizable (`workflow_call`) | lint + tests unitarios + tests de integración |
| `pr-checks.yml` | PR → `dev`/`main` | ejecuta `ci-test.yml` |
| `build-verification.yml` | push → `main` | build de frontend y backend |
| `scheduled.yml` | diario (2 AM) | `pnpm audit --audit-level high` |

## Estructura

```
viveroApp/
├── apps/
│   ├── frontend/    # Next.js 16 (App Router), features colocalizadas en src/features/
│   └── backend/     # NestJS 11, módulos en src/modules/, legacy MySQL en src/modules/legacy/
├── packages/
│   └── shared/      # @vivero/shared — schemas Zod y constantes
├── docs/
│   ├── agents/      # Perfiles de agentes (fuente de verdad de arquitectura)
│   ├── deployment/  # Guía de despliegue de producción
│   └── project-documentation/
├── design-system/   # Tokens y patrones de UI
├── .github/         # Workflows de GitHub Actions
└── .agents/         # Skills de agentes (no versionado)
```

## Documentación

- Arquitectura y estándares: `docs/agents/tech_stack_guide.md` (fuente de verdad).
- Despliegue de producción: `docs/deployment/production.md`.
- Convenciones de commits: `COMMIT_CONVENTIONS.md`.

## Troubleshooting

- **Puerto ocupado (3000/3001):** busca el proceso y termínalo (ver `README` del sistema operativo).
- **Caché de pnpm corrupta:** `pnpm store prune` + borrar `node_modules` + `pnpm install`.
- **Errores de base de datos:** verifica `apps/backend/.env` (`BACKEND_NODE_ENV` y hosts/puertos de MariaDB).

## Licencia

MIT
