# Shared Partida Header Helpers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render every partida identity string through `features/shared/utils/header.ts` so all forms and slide-overs agree.

**Architecture:** Two conventions only. Slide-over titles → ``Partida ${formatPartidaNumber(x)}``. Identity headers → `h2 = formatSpecies(x)`, subtitle = `formatPartidaNumber(x)`. Alert forms keep `h2 = config.label` (the alert type matters more than the species) and use `formatPartidaHeader` / `formatSpecies` on their subtitle lines.

**Tech Stack:** Next.js 16 + TypeScript, Jest/React Testing Library, `@vivero/shared` DTOs (all extend `LegacyHeaderSchema`, so every helper accepts them).

## Global Constraints

- Helpers live at `apps/frontend/src/features/shared/utils/header.ts` — do not add new ones.
- Only `LegacyHeader`-shaped DTOs: `SiembraPartidaDto`, `ProgramacionSiembraDto`, `ExtendidoDto`, `AlertBaseDto`.
- Design tokens only (`docs/agents/ux-ui-agent.md`); keep each form's existing `<p>`/`<h2>` classes — only the **content** changes.
- Verification order: `pnpm lint && pnpm type-check && pnpm test`.
- 3 tests are already red (`registradas` view ×2, registradas data-table ×1) — they must be green by end of Task 1.
- Branch: `fix/programacion-siembra-tabs`.
- **NO COMMITS during tasks.** Subagents only edit files. The controller records a `git write-tree` snapshot at each task boundary and reviews tree-to-tree diffs. One `commit workflow` at the end splits the work into Conventional Commits (message in `.commits/YYYY-MM-DD-<type>-<slug>.md`, gitignored).

## Rendered Conventions (locked)

| Surface | Result |
|---|---|
| Slide-over title | `Partida #456/2` |
| aSembrar slide-over title | `Completar Siembra — Partida #456/2` |
| Identity header h2 | `ABCOM · PLA.ALBAHACA COMPACTA M009` |
| Identity header subtitle | `#456/2` |
| Alert view subtitle | `#456/2 - ABCOM · PLA.ALBAHACA COMPACTA M009` (unchanged) |
| Alert edit subtitle | `Partida #456/2 · Año 2025` + `ABCOM · PLA.ALBAHACA COMPACTA M009` |

---

### Task 1: Registradas header (finishes the in-flight work)

**Files:**
- Modify: `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx`
- Modify: `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-data-table.tsx:61`
- Test: `apps/frontend/src/features/siembraPartidas/components/__tests__/siembra-partidas-registradas-view-form.test.tsx`
- Test: `apps/frontend/src/features/siembraPartidas/components/__tests__/siembra-partidas-registradas-data-table.test.tsx`

**Interfaces:**
- Consumes: `formatPartidaNumber(header)`, `formatSpecies(header)` from `@/features/shared/utils/header`.
- Produces: header renders `ABCOM · PLA.ALBAHACA COMPACTA M009` / `#456/2`; slide-over title renders `Partida #456/2`.

- [x] **Step 1: Rewrite the failing tests**

`siembra-partidas-registradas-view-form.test.tsx` — replace lines 43-62 with:

```tsx
  it("renders header with species and partida number", () => {
    render(<SiembraPartidasRegistradasViewForm selectedPartida={mockPartida} />);

    expect(
      screen.getByText("ABCOM · PLA.ALBAHACA COMPACTA M009"),
    ).toBeInTheDocument();
    expect(screen.getByText("#456/2")).toBeInTheDocument();
  });
```

Also delete `displays specs grid with year, index, and especie` (the grid is gone) and rename `renders sustrato in header` → `renders sustrato in siembra tab` (assertion unchanged).

- [x] **Step 2: Run to verify failure**

Run: `pnpm --filter frontend test -- siembra-partidas`
Expected: FAIL — `Unable to find an element with the text: ABCOM · PLA.ALBAHACA COMPACTA M009`

- [x] **Step 3: Implement**

`siembra-partidas-registradas-view-form.tsx` — remove `Sprout,` from the lucide import and add:

```tsx
import { formatPartidaNumber, formatSpecies } from "@/features/shared/utils/header";
```

Replace the header block (lines 69-74):

```tsx
              <h2 className="text-base font-black tracking-tight leading-none text-foreground uppercase">
                {formatSpecies(selectedPartida)}
              </h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                {formatPartidaNumber(selectedPartida)}
              </p>
```

`siembra-partidas-registradas-data-table.tsx` — add the same import and change line 61:

```tsx
          title={`Partida ${formatPartidaNumber(selectedPartida)}`}
```

- [x] **Step 4: Update the data-table test**

Add to `mockPartidas[0]`: `codigoEspecie: "ABCOM", nombreEspecie: "PLA.ALBAHACA COMPACTA M009",`

Widen the SlideOverForm mock:

```tsx
  SlideOverForm: ({
    open,
    title,
    children,
  }: {
    open: boolean;
    title: string;
    children: React.ReactNode;
  }) =>
    open ? (
      <div data-testid="slide-over-form">
        <span data-testid="slide-over-title">{title}</span>
        {children}
      </div>
    ) : null,
```

Replace line 106:

```tsx
    expect(screen.getByTestId("slide-over-title")).toHaveTextContent("Partida #456/2");
    expect(screen.getByText("ABCOM · PLA.ALBAHACA COMPACTA M009")).toBeInTheDocument();
```

- [x] **Step 5: Run**

Run: `pnpm --filter frontend test -- siembra-partidas` → Expected: PASS (no commit — Task 5 runs the commit workflow)

---

### Task 2: View forms — programacionSiembra + extendidos

**Files:**
- Modify: `apps/frontend/src/features/programacionSiembra/components/programacionSiembra-view-form.tsx:60-65`
- Modify: `apps/frontend/src/features/extendidos/components/extendido-view-form.tsx:96-101`
- Test: `apps/frontend/src/features/programacionSiembra/components/__tests__/siembra-view-form.test.tsx:26-30`
- Test: `apps/frontend/src/features/extendidos/components/__tests__/extendido-view-form.test.tsx:33`

**Interfaces:**
- Consumes: same two helpers.
- Produces: both headers render `ESP001 · Especie Test` / `#123/1`.

- [x] **Step 1: Write the failing tests**

`siembra-view-form.test.tsx` lines 28-29 →

```tsx
    expect(screen.getByText("ESP001 · Especie Test")).toBeInTheDocument();
    expect(screen.getByText("#123/1")).toBeInTheDocument();
```

`extendido-view-form.test.tsx` line 33 →

```tsx
    expect(screen.getByText('ESP001 · Especie Test')).toBeInTheDocument();
    expect(screen.getByText('#123/1')).toBeInTheDocument();
```

- [x] **Step 2: Run to verify failure**

Run: `pnpm --filter frontend test -- siembra-view-form extendido-view-form`
Expected: FAIL

- [x] **Step 3: Implement**

In both files swap the import to `formatPartidaNumber, formatSpecies`, h2 → `{formatSpecies(selectedExtendido)}`, subtitle → `{formatPartidaNumber(selectedExtendido)}`. Keep each file's existing `<p>` classes (`text-xs ...` in programacionSiembra, `text-[9px] ...` in extendidos).

- [x] **Step 4: Run to verify pass**

Run: `pnpm --filter frontend test -- siembra-view-form.test.tsx` then `pnpm --filter frontend test -- extendido-view-form.test.tsx` → Expected: PASS

---

### Task 3: Edit forms (4 files, no tests exist today)

**Files:**
- `apps/frontend/src/features/extendidos/components/extendido-edit-form.tsx:61-65`
- `apps/frontend/src/features/aSembrar/components/a-sembrar-edit-form.tsx:129-133`
- `apps/frontend/src/features/programacionSiembra/components/autorizar-programacionSiembra-edit-form.tsx:82-86`
- `apps/frontend/src/features/alerts/components/v1/alert-edit-form.tsx:76-81`

- [x] **Step 1:** For the first three, same swap as Task 2: h2 `{formatSpecies(x)}`, subtitle `{formatPartidaNumber(x)}`, add the import.
- [x] **Step 2:** `alert-edit-form.tsx` — h2 stays `{config.label}`; replace the two hand-rolled lines:

```tsx
                <p className="text-[9px] text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                  Partida {formatPartidaNumber(selectedAlert)} · Año {selectedAlert.anio}
                </p>
                <p className="text-[9px] text-[11px] font-mono text-primary mt-0.5">
                  {formatSpecies(selectedAlert)}
                </p>
```

- [x] **Step 3:** Evidence: `pnpm lint && pnpm type-check` → 0 errors, no new warnings. These 4 forms have no test files today; adding RTL coverage would require form-provider/auth mocks and is out of scope for this pass.
- [x] **Step 4:** No commit. Report the files you touched for the tree-diff review.

---

### Task 4: Slide-over titles (remaining 4)

**Files & exact edits:**

| File:line | From | To |
|---|---|---|
| `programacionSiembra-data-table.tsx:197` | `` `Partida Nº ${selectedPartida.partidaId}` `` | `` `Partida ${formatPartidaNumber(selectedPartida)}` `` |
| `extendido-data-table.tsx:208` | same | same |
| `alerts-data-table.tsx:114` | `` `Partida #${selectedAlert.partidaId}/${selectedAlert.indice}` `` | `` `Partida ${formatPartidaNumber(selectedAlert)}` `` |
| `a-sembrar-data-table.tsx:103` | `` `Completar Siembra — Partida Nº ${selectedPartida.partidaId}` `` | `` `Completar Siembra — Partida ${formatPartidaNumber(selectedPartida)}` `` |

Plus the import in each file (registradas already done in Task 1).

- [x] **Step 1:** Append to the existing `capturedProps` assertions in `siembra-data-table.test.tsx`, `extendido-data-table.test.tsx`, `a-sembrar-data-table.test.tsx`, `alerts-data-table.test.tsx` (all mocks use `partidaId: 1, indice: 1`):

```tsx
    expect(capturedProps.title).toBe("Partida #1/1");
```

(aSembrar: `expect(capturedProps.title).toBe("Completar Siembra — Partida #1/1");`)

- [x] **Step 2:** Run `pnpm --filter frontend test -- data-table` → Expected: PASS
- [x] **Step 3:** No commit. Report the files you touched for the tree-diff review.

---

### Task 5: Full verification

```bash
pnpm lint && pnpm type-check && pnpm test
```

Expected: 0 lint errors (the new `Sprout` warning is gone), type-check clean, 315+ tests pass.

Residue check (must return nothing):

```bash
grep -rn "Partida Nº\|Partida #\${" apps/frontend/src --include="*.tsx"
```

- [x] **Step 1:** Run the three gates above → Expected: 0 lint errors (the new `Sprout` warning is gone), type-check clean, 315+ tests pass, residue grep empty.
- [x] **Step 2:** Final whole-branch review (superpowers:requesting-code-review).
- [x] **Step 3:** Commit workflow — split into Conventional Commits, e.g.:
  - `feat(siembraPartidas): align registradas header with shared helpers`
  - `refactor(frontend): render headers and slide-over titles via shared helpers`
