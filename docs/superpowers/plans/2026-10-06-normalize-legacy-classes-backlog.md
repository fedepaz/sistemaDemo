# Legacy Class Normalization — Pre-existing Violations (main-only files) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate every design-token violation (arbitrary `text-[Npx]`, flattened/duplicate utility pairs, plain `h-3.5` icons, `md:` inside SlideOver children) from the ~17 pre-existing `main`-only frontend files, using only the project docs as the standard.

**Architecture:** Pure class-string normalization. No logic, markup structure, or props change. Every replacement comes from the **Legacy Class Normalization table** in `docs/agents/ux-ui-agent.md` (rows R1–R12) plus two doc rules: `loading-strategy`-adjacent SlideOver rule (ux-ui-agent.md:139, "SlideOver children locked to mobile density — all `md:` removed") and the SelectContent exception (ux-ui-agent.md:192, `max-h-[250px] md:max-h-[300px]` is mandatory and MUST be kept).

**Tech Stack:** Next.js 16 + Tailwind v4 (tokens in `apps/frontend/src/app/globals.css`), pnpm + Turborepo, ESLint + tsc + Vitest as gates.

## Global Constraints

- Source of truth (read before editing): `docs/agents/ux-ui-agent.md` (Legacy Class Normalization table + Responsive Design section), `docs/agents/loading-strategy.md`, `globals.css` tokens. Never invent replacements outside the table.
- Token facts: `text-xs` renders 11px, `text-sm` 14px, `text-base` 16px (globals.css remap). `h-4` = 16px (icon size), `h-6`..`h-10` = control heights 24..40px.
- **Excluded from scope (do NOT touch):** `components/ui/*` (shadcn registry primitives), all `*-skeleton.tsx` files (structural placeholder dims), responsive icon pairs NOT in the table (`dashboard-kpi.tsx` `[&>svg]` scaling, `dashboard-alerts.tsx` `h-2.5 sm:h-3.5`), and `permissions-user-manager.tsx:228` / `permissions-entity-manager.tsx:57` (`h-3 md:h-3.5 w-3 md:h-3.5` — not a table pattern; contains a pre-existing `md:h`/width typo, log as observation only).
- **SelectContent exception:** keep `max-h-[250px] md:max-h-[300px]` everywhere, even inside slide-overs (doc rule overrides SlideOver `md:` removal).
- SlideOver children (confirmed): `user-edit-form`, `entity-create-form`, `alerts-view-form`, `auditLog-form`, `taskShift` (rendered via `a-sembrar-edit-form` → `a-sembrar-data-table` SlideOverForm). For these, remove ALL `md:` keeping base, EXCEPT SelectContent `max-h`.
- Non-slide-over files: responsive `md:`/`sm:` on non-bracket classes is legitimate (ux-ui-agent.md:137) — keep; only fix bracket sizes, table-listed collapses, and table-listed icon patterns.
- Verification order before each commit: scan (below) must return zero NEW violations, then pre-commit hook runs `pnpm lint`. Full gate before Task 4: `pnpm lint && pnpm type-check && pnpm test` (358 tests must pass).
- Commits: Conventional Commits via `.commits/YYYY-MM-DD-*.md` + `git commit -F` (`.commits/` is gitignored — do not stage it). Explicit `git add <files>`, never `git add .`. Branch: `feat/finish-mescla`. No push.
- TDD deviation (acknowledged): these are cosmetic class renames with no behavioral surface; no new tests are written. The gate is the existing suite (76 suites / 358 tests) plus the zero-hit scans — the same verification used for the already-approved Phase 1 commits.

## Scan Commands (used after every task)

Run from `apps/frontend/src`. Each must print nothing under `REMAINING-IN-SCOPE` (filter: files NOT in `/tmp/opencode/vs_main.txt`; regenerate with `git diff main...HEAD --name-only > /tmp/opencode/vs_main.txt` from repo root first if stale):

```bash
# S1: bracket font sizes, duplicate pairs, grid dupes (expect: no output)
grep -rn 'text-\[[0-9]*px\]\|grid-cols-1 grid-cols-2\|text-xs text-sm\|text-base text-lg' features/ components/ \
| while IFS=: read f l rest; do grep -q "apps/frontend/src/$f$" /tmp/opencode/vs_main.txt || echo "$f:$l"; done
# S2: slide-over md: leakage (expect: only SelectContent max-h lines from excluded ui files)
grep -rn 'md:' features/users/components/user-edit-form.tsx features/entities/components/entity-create-form.tsx \
  features/alerts/components/v1/alerts-view-form.tsx features/auditLogs/components/auditLog-form.tsx \
  features/taskshift/components/taskShift.tsx
# S3: plain legacy icons in scope files (expect: no output)
grep -rn 'h-3\.5 w-3\.5' components/data-display/data-table/data-table.tsx components/layout/desktop-sidebar.tsx \
  components/layout/mobile-navigation.tsx features/auth/components/login-form.tsx features/auth/components/register-form.tsx \
  features/users/components/user-data-table.tsx features/permissions/components/permission-row-item.tsx
```

---

### Task 1: SlideOver children — full normalization (5 files)

**Files:**
- Modify: `apps/frontend/src/features/users/components/user-edit-form.tsx`
- Modify: `apps/frontend/src/features/entities/components/entity-create-form.tsx`
- Modify: `apps/frontend/src/features/alerts/components/v1/alerts-view-form.tsx`
- Modify: `apps/frontend/src/features/auditLogs/components/auditLog-form.tsx`
- Modify: `apps/frontend/src/features/taskshift/components/taskShift.tsx`

**Interfaces:**
- Consumes: normalization table rows R1–R12; SlideOver rule (ux-ui-agent.md:139); SelectContent exception (ux-ui-agent.md:192).
- Produces: these 5 files clean under scan S1+S2; no other task depends on them.

- [ ] **Step 1: user-edit-form.tsx** — exact replacements (verify counts with grep first):

| line | old | new | count |
|---|---|---|---|
| 46 | `grid grid-cols-1 grid-cols-2` | `grid grid-cols-2` | 1 |
| 52,70,88 | `text-[10px] text-xs font-bold` | `text-xs font-bold` | 3 |
| 60,77,96 | `<FormMessage className="text-[10px]" />` | `<FormMessage className="text-xs" />` | 3 |
| 95 | `text-[9px] text-[11px] font-medium` | `text-xs font-medium` | 1 |

- [ ] **Step 2: entity-create-form.tsx**:

| line | old | new | count |
|---|---|---|---|
| 43,64,84 | `text-[10px] md:text-xs font-bold` | `text-xs font-bold` | 3 |
| 52,72 | `text-[9px] md:text-[11px] font-medium` | `text-xs font-medium` | 2 |
| 55,75,97 | `<FormMessage className="text-[10px]" />` | `<FormMessage className="text-xs" />` | 3 |
| 91 | SelectContent `max-h-[250px] md:max-h-[300px]` | KEEP untouched | — |

- [ ] **Step 3: alerts-view-form.tsx**:

| line | old | new | count |
|---|---|---|---|
| 58 | `text-[9px] font-bold` | `text-xs font-bold` | 1 |
| 119,122 | `text-[10px] font-mono` | `text-xs font-mono` | 2 |

- [ ] **Step 4: auditLog-form.tsx** — remove every `md:` keeping base (this file has NO SelectContent). Explicit list:

| line | old | new |
|---|---|---|
| 80 | `h-3.5 w-3.5 md:h-4 md:w-4 text-primary` | `h-4 w-4 text-primary` (table collapse row) |
| 83,139,155,194,197,214,224,244,272,351,378 | `text-xs md:text-xs` | `text-xs` |
| 87 | `text-xs md:text-base` | `text-xs` |
| 128 | `max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)]` | `max-h-[calc(100dvh-130px)]` |
| 147,351,378 | `h-4 md:h-5` | `h-4` |
| 158 | `max-w-[100px] md:max-w-[140px]` | `max-w-[100px]` |
| 191 | `h-2.5 w-2.5 md:h-3 md:w-3` | `h-2.5 w-2.5` |
| 211 | `h-10 md:h-14` | `h-10` |
| 218,228 | `h-3 w-3 md:h-3.5 md:w-3.5` | `h-3 w-3` |
| 245,273 | `h-3 w-3 md:h-4 md:w-4` | `h-3 w-3` |
| 283,304,316 | `text-xs md:text-sm` | `text-xs` |
| 296 | `text-xs md:text-xs … md:min-w-[100px]` | `text-xs … ` — keep ONLY `min-w-[80px]`; drop `md:min-w-[100px]` entirely (amended after Task 1 review: duplicate `min-w` utilities are order-nondeterministic; SlideOver rule keeps mobile values) |

(Quick method: `sed -i 's/ md:text-xs//g; s/ md:text-sm//g; s/ md:text-base//g'` style edit is NOT allowed — use the Edit tool per line so counts are verified; or Edit with `replaceAll` on each distinct old string above.)

- [ ] **Step 5: taskShift.tsx** — full list:

| line | old | new |
|---|---|---|
| 83,212 | `h-3.5 w-3.5 md:h-4 md:w-4` | `h-4 w-4` |
| 85,214 | `text-[10px] md:text-xs` | `text-xs` |
| 88 | `text-xs md:text-sm font-medium leading-tight md:leading-relaxed` | `text-xs font-medium leading-tight` |
| 112,129,153,170 | SelectContent `max-h-[250px] md:max-h-[300px]` | KEEP untouched |
| 186,198 | `h-10 md:h-14 rounded-xl text-xs md:text-sm` | `h-10 rounded-xl text-xs` |

- [ ] **Step 6: verify** — run scans S1 and S2. Expected: S1 empty; S2 shows ONLY the 5 known SelectContent `max-h` lines (taskShift 112,129,153,170 + entity-create 91) — these are the mandatory exception, everything else must be gone.
- [ ] **Step 7: gate + commit**

```bash
pnpm lint && pnpm type-check && pnpm test   # expect: 0 errors, 358 tests pass
# then commit-workflow: write .commits/2026-10-06-style-normalize-slide-over-legacy-classes.md
# subject: style(frontend): normalize legacy utility classes in slide-over children
git add apps/frontend/src/features/users/components/user-edit-form.tsx \
        apps/frontend/src/features/entities/components/entity-create-form.tsx \
        apps/frontend/src/features/alerts/components/v1/alerts-view-form.tsx \
        apps/frontend/src/features/auditLogs/components/auditLog-form.tsx \
        apps/frontend/src/features/taskshift/components/taskShift.tsx
git commit -F .commits/2026-10-06-style-normalize-slide-over-legacy-classes.md
```

---

### Task 2: Bracket font sizes in non-slide-over features + shared layout (9 files)

**Files:**
- Modify: `apps/frontend/src/features/permissions/components/permissions-user-manager.tsx` (7 hits: 226,246,253,286,350,362,371)
- Modify: `apps/frontend/src/features/permissions/components/permissions-entity-manager.tsx` (6 hits: 55,72,96,123,152,158)
- Modify: `apps/frontend/src/features/permissions/components/permission-selector.tsx` (118,125)
- Modify: `apps/frontend/src/features/permissions/components/user-selector.tsx` (113,120)
- Modify: `apps/frontend/src/features/permissions/components/PermissionsDashboard.tsx` (62,72)
- Modify: `apps/frontend/src/features/auth/components/register-form.tsx` (108,120,144,155,176,187)
- Modify: `apps/frontend/src/components/layout/dashboard-header.tsx` (32,36,101,106,119)
- Modify: `apps/frontend/src/components/common/user-avatar.tsx` (12)
- Modify: `apps/frontend/src/features/permissions/components/permission-row-item.tsx` (99 — icon only)

**Interfaces:**
- Consumes: table rows R1–R3 (bracket→token), R7 (icon collapse `h-3.5 w-3.5 md:h-4 md:w-4`→`h-4 w-4`).
- Produces: zero `text-[Npx]` anywhere in `features/` or `components/` (scan S1) except excluded files (none have bracket text).

**Steps:**

- [ ] **Step 1: replacements**

| file:line | old | new | count |
|---|---|---|---|
| permissions-user-manager 226 | `font-bold text-[9px] md:text-[10px] uppercase` | `font-bold text-xs uppercase` | 1 |
| permissions-user-manager 246,286,350,362,371 | `text-[10px] md:text-xs` | `text-xs` | 5 |
| permissions-user-manager 253 | `mt-3 h-8 text-[10px]"` | `mt-3 h-8 text-xs"` | 1 |
| permissions-entity-manager 55 | `font-bold text-[9px] md:text-[10px] uppercase` | `font-bold text-xs uppercase` | 1 |
| permissions-entity-manager 72 | `text-[10px] md:text-xs` | `text-xs` | 1 |
| permissions-entity-manager 96 | `text-[9px] md:text-[10px] font-mono` | `text-xs font-mono` | 1 |
| permissions-entity-manager 123 | `text-[8px] md:text-[10px] font-bold` | `text-xs font-bold` | 1 |
| permissions-entity-manager 152 | `text-[9px] md:text-[10px] font-semibold` | `text-xs font-semibold` | 1 |
| permissions-entity-manager 158 | `text-[9px] md:text-[11px] font-bold` | `text-xs font-bold` | 1 |
| permission-selector 118 / user-selector 113 | `text-[10px] font-mono` | `text-xs font-mono` | 1 each |
| permission-selector 125 / user-selector 120 | `text-[9px] uppercase` | `text-xs uppercase` | 1 each |
| PermissionsDashboard 62,72 | `text-[10px] font-bold` | `text-xs font-bold` | 2 |
| register-form 120,155,187 | `text-[10px] font-bold font-sans text-xs sm:text-sm` | `font-bold font-sans text-xs sm:text-sm` | 3 |
| dashboard-header 32,36,101,106,119 | `text-[10px]` | `text-xs` | 5 (replaceAll) |
| user-avatar 12 | `sm: "h-6 w-6 text-[10px]"` | `sm: "h-6 w-6 text-xs"` | 1 |
| permission-row-item 99 | `h-3.5 w-3.5 md:h-4 md:w-4 text-primary` | `h-4 w-4 text-primary` | 1 |
| register-form 108,144,176 | `<User className="h-3.5 w-3.5 text-primary" />` | `<User className="h-4 w-4 text-primary" />` | 3 |

Keep all `md:`/`sm:` on non-bracket classes in these files (responsive, doc-allowed). Do NOT touch `permissions-user-manager:228` / `permissions-entity-manager:57`.

- [ ] **Step 2: verify** — scan S1 (expect empty) + `grep -rn 'text-\[' features/ components/` empty except excluded skeletons (there are none).
- [ ] **Step 3: gate + commit**

```bash
pnpm lint && pnpm type-check && pnpm test
# .commits/2026-10-06-style-replace-arbitrary-font-sizes-with-tokens.md
# subject: style(frontend): replace arbitrary font sizes with design tokens
git add apps/frontend/src/features/permissions/components/permissions-user-manager.tsx \
        apps/frontend/src/features/permissions/components/permissions-entity-manager.tsx \
        apps/frontend/src/features/permissions/components/permission-selector.tsx \
        apps/frontend/src/features/permissions/components/user-selector.tsx \
        apps/frontend/src/features/permissions/components/PermissionsDashboard.tsx \
        apps/frontend/src/features/permissions/components/permission-row-item.tsx \
        apps/frontend/src/features/auth/components/register-form.tsx \
        apps/frontend/src/components/layout/dashboard-header.tsx \
        apps/frontend/src/components/common/user-avatar.tsx
git commit -F .commits/2026-10-06-style-replace-arbitrary-font-sizes-with-tokens.md
```

---

### Task 3: Plain legacy icons in shared data-table + layout + auth (5 files)

**Files:**
- Modify: `apps/frontend/src/components/data-display/data-table/data-table.tsx` (461,475,489,492,536,567,709,729)
- Modify: `apps/frontend/src/components/layout/desktop-sidebar.tsx` (67,139,191,346,348)
- Modify: `apps/frontend/src/components/layout/mobile-navigation.tsx` (109,159,186)
- Modify: `apps/frontend/src/features/auth/components/login-form.tsx` (63,89)
- Modify: `apps/frontend/src/features/users/components/user-data-table.tsx` (114,146)

**Interfaces:**
- Consumes: table row R5 (`h-3.5 w-3.5` → `h-4 w-4`).
- Produces: scan S3 empty.

**Steps:**

- [ ] **Step 1: replacements** — in each of the 5 files, Edit tool with `replaceAll: true`, old `h-3.5 w-3.5` → new `h-4 w-4`. Expected match counts: data-table 8, desktop-sidebar 5, mobile-navigation 3, login-form 2, user-data-table 2 (verify with `grep -c 'h-3\.5 w-3\.5' <file>` BEFORE editing; abort if count differs).
- [ ] **Step 2: verify** — scan S3 (expect empty).
- [ ] **Step 3: full gate + commit**

```bash
pnpm lint && pnpm type-check && pnpm test
# .commits/2026-10-06-style-normalize-legacy-icon-sizes.md
# subject: style(frontend): normalize plain legacy icon sizes to h-4
git add apps/frontend/src/components/data-display/data-table/data-table.tsx \
        apps/frontend/src/components/layout/desktop-sidebar.tsx \
        apps/frontend/src/components/layout/mobile-navigation.tsx \
        apps/frontend/src/features/auth/components/login-form.tsx \
        apps/frontend/src/features/users/components/user-data-table.tsx
git commit -F .commits/2026-10-06-style-normalize-legacy-icon-sizes.md
```

---

### Task 4: Final verification — zero-violation proof

- [ ] **Step 1: regenerate in-diff list** (now includes Tasks 1–3 files):

```bash
cd /home/fedepaz/Documents/proyectos/sistemaDemo
git diff main...HEAD --name-only > /tmp/opencode/vs_main.txt
```

- [ ] **Step 2: run scans S1, S2, S3** — all must print nothing (S2 must be empty: Task 1 removed every `md:` from the 5 slide-over files including SelectContent? NO — SelectContent `md:max-h` lines remain in taskShift:112/129/153/170 and entity-create:91 by design. Adjust S2 expectation: ONLY those 5 known SelectContent lines may appear.)
- [ ] **Step 3: full suite**

```bash
pnpm lint && pnpm type-check && pnpm test
# expect: lint 0 errors (4 known pre-existing warnings), type-check clean, 76 suites / 358 tests pass
```

- [ ] **Step 4: report** — list the 3 commits + scan outputs to the user; STOP (no push, no further changes).

## Observations logged (out of scope — do not fix in this plan)

1. `permissions-user-manager.tsx:228` and `permissions-entity-manager.tsx:57`: `h-3 md:h-3.5 w-3 md:h-3.5` — `md:h-3.5` appears twice where the second should be `md:w-3.5` (width never scales). Pre-existing typo on `main`, not a table pattern.
2. Registry sync backlog (from earlier review): `docs/project-documentation/components-list.md` missing Formula*/Producto*/VolumeCalculator/FormulaSelector/EntityEditForm/EntityViewForm rows; `apps/frontend/components.json` stale.
3. PDF export margins (`constants/export-config.ts` 30→5pt) — open user decision.
4. `entities/entity-dashboard-skeleton.tsx` (V7 dead file) — deletion decision.
