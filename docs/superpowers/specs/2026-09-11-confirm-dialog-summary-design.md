# Design Spec: Confirmation Dialog Form Summary

**Date:** 2026-09-11
**Status:** Approved

## Problem

The `SlideOverForm` confirmation dialog shows title, description, and a label — but
no form data summary. Users must rely on memory to verify what they're about to submit.
For forms with many fields (e.g., A Sembrar with 10+ fields), this is error-prone.

## Solution

Add a `summaryFields: string[]` prop to `ConfirmConfig`. When non-empty, the
AlertDialog renders a summary table showing each listed field's label and value,
using `form.getValues()` and the existing `fieldLabels` prop.

## Type Change

`ConfirmConfig` in `slide-over-form.tsx`:

```ts
export type ConfirmConfig = {
  title: string;
  description: string;
  label?: string;
  summaryFields: string[];  // required — [] means no summary
};
```

## Summary Rendering

When `confirm.summaryFields.length > 0`, render a summary section between the
description and the footer in `AlertDialogContent`.

### Layout

```
¿Deseas confirmar la siembra?

Resumen:
┌─────────────────────────────────┐
│ Cámara de Destino    │ CG-03   │
│ Fecha de Siembra     │ 10/09/26│
│ Bandejas Confirmadas │ 120     │
│ Cantidad gr          │ 450     │
└─────────────────────────────────┘
```

### Formatting Rules (auto-applied by SlideOverForm)

| Value type        | Format                                      |
| ----------------- | ------------------------------------------- |
| `string`          | As-is                                       |
| `number`          | Locale string                               |
| `boolean`         | `Si` / `No`                                 |
| `Date` / ISO str  | `formatShortDate()` from `@/lib/date-utils` |
| `null` / `""`     | `—` (em dash)                               |

### Label Source

Each field label is resolved from the `fieldLabels` prop:
`fieldLabels[fieldName]`. Falls back to camelCase → Title Case if not found.

## Per-Consumer Changes

| Feature       | File                            | `summaryFields`                                                   |
| ------------- | ------------------------------- | ----------------------------------------------------------------- |
| Users         | `user-data-table.tsx`           | `["firstName", "lastName", "email"]`                              |
| Entities      | `entity-data-table.tsx`         | `["name", "label", "permissionType"]`                             |
| Extendidos    | `extendido-data-table.tsx`      | `["ubicacion", "baja", "extendido"]`                              |
| A Sembrar     | `a-sembrar-data-table.tsx`      | `["cg", "f_siembra", "cantidaNroCont", "cantidadGrs", "ajuste", "prensadoSemilla", "profundidadSemilla", "tratamientoSemilla", "metodoMaquina", "detalleExtendido"]` |
| Siembra       | `siembra-data-table.tsx`        | `["partidaId", "anio", "indice"]`                                 |
| Alerts        | `alerts-data-table.tsx`         | `["content"]`                                                     |

## Files Changed

1. `apps/frontend/src/components/data-display/data-table/slide-over-form.tsx` — type change + summary rendering
2. `apps/frontend/src/features/users/components/user-data-table.tsx` — add `summaryFields`
3. `apps/frontend/src/features/entities/components/entity-data-table.tsx` — add `summaryFields`
4. `apps/frontend/src/features/extendidos/components/extendido-data-table.tsx` — add `summaryFields`
5. `apps/frontend/src/features/aSembrar/components/a-sembrar-data-table.tsx` — add `summaryFields`
6. `apps/frontend/src/features/siembra/components/siembra-data-table.tsx` — add `summaryFields`
7. `apps/frontend/src/features/alerts/components/v1/alerts-data-table.tsx` — add `summaryFields`
