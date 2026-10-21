# Design: devProductos legacy seeder

Date: 2026-10-21
Status: Approved (brainstorming session; Approach 1 — tsx script + package.json hook)

## Goal

A dev-only seeder that inserts two rows into the **legacy** `martin3.articulo`
table so the on-read sync can be verified end-to-end in local dev:

- `perlita` — already exists in Prisma `vivero_dev.Producto`
  (active, `legacyCodigo = NULL`) → sync must **adopt** it (byte-exact
  `nombre` match) and link its codigo.
- `ushuaia` — absent from Prisma → sync must **create** it already linked.

Local dev currently has **zero** rows matching the sync select
(`hai='O' AND tipo='PF'`), so before seeding the sync finds nothing.

## Execution contract

- The AI writes the script and the package.json entry only.
- **The user runs `pnpm --filter backend db:seed:devProductos`** — the AI must
  never execute it (it writes to both DBs' shared dev environment; the user
  performs the manual sync check themselves).
- Production: nothing is ever seeded. The script connects via
  `DATABASE_LEGACY_URL` only when the user chooses to run it locally.

## Script

File: `apps/backend/prisma/seed-devProductos.ts`
Hook: `"db:seed:devProductos": "pnpm tsx prisma/seed-devProductos.ts"` in
`apps/backend/package.json` — same pattern as the existing `db:seed:admin` /
`db:seed:users` (tsx + `import 'dotenv/config'` + `main().catch`).

Connection: parse `DATABASE_LEGACY_URL` with `new URL()` and pass discrete
host/port/user/password/database to `mysql2/promise` — no assumptions about
URL-string support; no Prisma (the legacy DB is not Prisma-managed).

### Rows (fixed constants)

| codigo | nombre | tipo | hai | unidad | rubro |
|---|---|---|---|---|---|
| `PERLITA01` | `perlita` | `PF` | `O` | `BOLSA` | `NULL` |
| `USHUAIA01` | `ushuaia` | `PF` | `O` | `BOLSA` | `NULL` |

- `nombre` lowercase, byte-exact — adoption matches on exact `nombre`
  (`perlita` matches; `Perlita` would silently duplicate).
- `tipo='PF'` + `hai='O'` satisfy the sync select verbatim.
- `rubro = NULL` deliberately: keeps the rows out of the `rubro='10.02'`
  sustrato list — these are productos, not sustratos.
- `unidad` is cosmetic (sync ignores it; `BOLSA` matches legacy style).

### Guards (no unique key exists on `articulo.codigo`)

Per row: `SELECT codigo FROM articulo WHERE codigo = ?` — if present, log
`skipped (already exists)` and do not touch it; if absent, `INSERT`. The two
fixed codigos are distinct from each other, so no self-collision. Re-running
the script is idempotent (both skipped).

### Closing output

Run the sync's exact select (`WHERE hai='O' AND tipo='PF' ORDER BY codigo`)
and print the rows `GET /productos` will see, then print the expected outcome:
`perlita` adopted onto the existing Prisma row (gains `legacyCodigo`),
`ushuaia` created already linked; both therefore show no Sistema Web badge,
while `kekila`/`rubia` keep theirs.

## Testing

- No unit tests — consistent with the other `prisma/seed-*` dev scripts.
- Type-check/lint cover the script's code.
- The functional test is manual and user-executed: run the seeder, re-run
  (idempotency), log into the productos page, confirm sync behavior.

## Out of scope

- Any seeding of `vivero_dev` (Prisma side stays untouched — option A,
  legacy-only).
- Cleanup/rollback commands (one-time dev check; reset manually if needed).
- Production tooling of any kind.
