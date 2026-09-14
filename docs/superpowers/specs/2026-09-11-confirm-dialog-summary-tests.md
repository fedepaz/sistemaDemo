# Test Plan: Confirmation Dialog Form Summary

**Date:** 2026-09-11
**Status:** Approved
**Approach:** TDD (write failing tests first, then implement)

## Scope

1. **SlideOverForm component tests** — test the real component (not mocked) with summary rendering
2. **Consumer tests** — verify each consumer passes correct `summaryFields`

## TDD Strategy

Since the feature is already implemented, TDD flow:
1. Write tests that exercise the feature
2. If any test fails → fix the implementation
3. All tests green → feature verified

## Test File 1: SlideOverForm

**File:** `apps/frontend/src/components/data-display/data-table/__tests__/slide-over-form.test.tsx`

### Setup

- Mock `useForm` with controllable `getValues()` return value
- Mock `formatShortDate` to return predictable output
- Render real `SlideOverForm` (not mocked) with `confirm` prop
- Use `@testing-library/react` + `screen` queries

### Test Cases

| # | Test name | Setup | Assertion |
|---|-----------|-------|-----------|
| 1 | renders summary section when summaryFields has entries | `summaryFields: ["name", "email"]`, `getValues` returns `{ name: "John", email: "john@test.com" }` | `screen.getByText("Resumen:")` exists, both field labels visible |
| 2 | does NOT render summary when summaryFields is empty | `summaryFields: []` | `screen.queryByText("Resumen:")` is null |
| 3 | renders field labels from fieldLabels prop | `fieldLabels: { name: "Nombre" }`, `summaryFields: ["name"]` | `screen.getByText("Nombre")` exists |
| 4 | falls back to Title Case for unknown labels | `fieldLabels: {}`, `summaryFields: ["firstName"]` | `screen.getByText("First Name")` exists |
| 5 | formats boolean true as Si | `summaryFields: ["active"]`, `getValues` returns `{ active: true }` | `screen.getByText("Si")` exists |
| 6 | formats boolean false as No | `summaryFields: ["active"]`, `getValues` returns `{ active: false }` | `screen.getByText("No")` exists |
| 7 | formats null as em dash | `summaryFields: ["note"]`, `getValues` returns `{ note: null }` | `screen.getByText("—")` exists |
| 8 | formats empty string as em dash | `summaryFields: ["note"]`, `getValues` returns `{ note: "" }` | `screen.getByText("—")` exists |
| 9 | formats ISO date string | `summaryFields: ["date"]`, `getValues` returns `{ date: "2026-09-10" }` | `formatShortDate` called, result displayed |
| 10 | formats numbers | `summaryFields: ["count"]`, `getValues` returns `{ count: 450 }` | `screen.getByText("450")` exists |
| 11 | renders confirm title and description | `confirm: { title: "Test", description: "Are you sure?", summaryFields: [] }` | Both texts visible in AlertDialog |

## Test File 2: Consumer Tests

For each consumer, verify the `confirm` prop includes correct `summaryFields`:

| Consumer | File | Test |
|----------|------|------|
| A Sembrar | `a-sembrar-data-table.test.tsx` (new) | renders confirm with 10 summaryFields |
| Siembra | `siembra-data-table.test.tsx` (existing) | renders confirm with 3 summaryFields |
| Extendidos | `extendido-data-table.test.tsx` (new) | renders confirm with 3 summaryFields |
| Users | `user-data-table.test.tsx` (new) | renders confirm with 3 summaryFields |
| Entities | `entity-data-table.test.tsx` (new) | renders confirm with 3 summaryFields |
| Alerts | `alerts-data-table.test.tsx` (existing) | renders confirm with 1 summaryField |

### Consumer Test Pattern

Each consumer test:
1. Mocks `SlideOverForm` to capture props (not trivial stub)
2. Renders the consumer component
3. Triggers the confirm flow (click edit/execute button)
4. Asserts `SlideOverForm` received `confirm.summaryFields` with correct array

## Files Changed

| File | Action |
|------|--------|
| `apps/frontend/src/components/data-display/data-table/__tests__/slide-over-form.test.tsx` | Create |
| `apps/frontend/src/features/aSembrar/components/__tests__/a-sembrar-data-table.test.tsx` | Create |
| `apps/frontend/src/features/extendidos/components/__tests__/extendido-data-table.test.tsx` | Create |
| `apps/frontend/src/features/users/components/__tests__/user-data-table.test.tsx` | Create |
| `apps/frontend/src/features/entities/components/__tests__/entity-data-table.test.tsx` | Create |
| `apps/frontend/src/features/siembra/components/__tests__/siembra-data-table.test.tsx` | Modify (add summaryFields test) |
| `apps/frontend/src/features/alerts/components/v1/__tests__/alerts-data-table.test.tsx` | Modify (add summaryFields test) |
