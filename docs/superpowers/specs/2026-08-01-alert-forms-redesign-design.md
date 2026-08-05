# Alert Forms Redesign — Type-Specific Visual Identity + Conversation-Style Edit

## Overview

Redesign the alert view form and edit form to give each alert type its own visual identity, and convert the edit form into a conversation-style messaging interface.

## Current State

- **View form** (`alerts-view-form.tsx`): Generic `InfoRow` list for all 4 alert types. No visual distinction between types. Shows comments below.
- **Edit form** (`alert-edit-form.tsx`): Header with partida/year + textarea. No alert context, no message history.

## Goals

1. Each alert type gets a unique visual identity (icon, color, key metric)
2. Edit form becomes a conversation: message history + input, with left/right alignment by user
3. Maintain existing comment CRUD flow (create via mutation, invalidate queries)

## Approach: Config-Driven Layout

Single view component + single edit component, driven by a config object per alert type. The config defines: icon, color, key metric, and field list. No dedicated components per type.

---

## Section 1: Alert Type Config

### Config Interface

```ts
interface AlertTypeConfig {
  icon: React.ElementType;
  color: string;          // tailwind text color class
  bgColor: string;        // tailwind bg color class
  label: string;
  keyMetric?: {
    field: string;
    label: string;
    icon: React.ElementType;
  };
  fields: Array<{
    field: string;
    label: string;
    icon: React.ElementType;
  }>;
}
```

### Per-Type Configs

| Type | Icon | Color | Key Metric | Fields |
|------|------|-------|------------|--------|
| Siembra Retrasada | `Scissors` | `text-orange-500` | `fechaSugeridaSiembra` ("Fecha Sug.") | injerto, semSiembra, semEntrega, estado |
| Falta Germinacion | `Sprout` | `text-amber-500` | `fPrimer` ("Fecha Primer") | injerto, pr |
| Faltante Plantas | `AlertTriangle` | `text-red-500` | `solicito` vs `porPr` ("Faltante") | hai, fPrimer, pr, stIniPr |
| Falta Pre-Expedicion | `Package` | `text-blue-500` | `fPreexp` ("Fecha Pre-Exp") | injerto, pe |

The key metric is displayed large (like `Stock` in `ExtendidosViewForm`). Fields use the existing `SpecGridCell` pattern (compact grid).

---

## Section 2: View Form Layout

### Structure

```
┌─────────────────────────────────────────┐
│  [Icon] TYPE LABEL                      │  ← type-specific header
│  Partida #1045/0 · Año 2026             │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  [icon]  Key Metric Label       │    │  ← key metric (large)
│  │          Value                   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌──────┬──────┬──────┐                │  ← compact spec grid
│  │Field1│Field2│Field3│                │    (3-col, SpecGridCell)
│  └──────┴──────┴──────┘                │
│                                         │
│  ──── Comentarios (N) ────              │
│  [chat bubbles — left-aligned]          │
└─────────────────────────────────────────┘
```

### Changes from Current

1. **Type-specific header** — icon + colored background + type label. Replaces generic header. Uses config's `icon`, `color`, `bgColor`.
2. **Key metric highlighted** — large value in a card. Uses `keyMetric.field` to pull value from alert data.
3. **Remaining fields** — compact 3-col grid using `SpecGridCell`. Uses config's `fields` array.
4. **Comments** — unchanged (left-aligned chat bubbles with avatar).

### Implementation

- `AlertTypeConfig` object defined in a separate `alert-type-config.ts` file
- `AlertsViewForm` reads config based on `alertType` prop
- `getSharedSpecGrid()` and `getTypeSpecificRows()` replaced by config-driven rendering
- Comment section unchanged

---

## Section 3: Edit Form Layout (Conversation Style)

### Structure

```
┌─────────────────────────────────────────┐
│  [Icon] TYPE LABEL                      │  ← same type header
│  Partida #1045/0 · Año 2026             │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ 👤 admin        hace 2h          │   │  ← other user (left)
│  │ Sembrada el lunes pasado         │   │
│  └──────────────────────────────────┘   │
│                                         │
│           ┌──────────────────────────┐  │
│           │  Yo          hace 1h     │  │  ← current user (right)
│           │  Revisada, falta germinar│  │
│           └──────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ 👤 operador      ahora           │   │  ← other user (left)
│  │ OK, la proceso hoy               │   │
│  └──────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│  ┌──────────────────────────────────┐   │  ← input at bottom
│  │ Escribe tu comentario...     [➤] │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Changes from Current

1. **Messages as conversation bubbles** — other users left-aligned with avatar, current user right-aligned with primary color background
2. **User identification** — `comment.userId === userProfile.id` determines alignment. Uses `useAuthContext()` from `@/features/auth/providers/AuthProvider`.
3. **Input at bottom** — textarea + send button, pinned to sheet footer area. Replaces the "Agregar Comentario" button flow.
4. **Header** — same type-specific header as view form (reuses config)
5. **No separate view/edit modes** — edit form is self-contained with its own message history

### Implementation

- `AlertEditForm` fetches comments via `useAlertComments` hook (already exists)
- Messages rendered with alignment logic: `comment.userId === userProfile.id ? "right" : "left"`
- Current user obtained via `const { userProfile } = useAuthContext()`
- Textarea + send button in a fixed bottom bar
- On submit: `createAlertComment` mutation, then refetch comments (handled by query invalidation)
- The `SlideOverForm` wrapper in `AlertsDataTable` needs adjustment: edit mode no longer uses `formId`/`form` props for the footer button — the input is inside the form content

### SlideOverForm Adjustment

Currently `AlertsDataTable` passes `formId="alert-comment-form"` and `form={formAlertComment}` to `SlideOverForm`. In the new design:
- **View mode**: No change (read-only, "Cerrar" button)
- **Edit mode**: The `SlideOverForm` footer should show "Cancelar" + "Enviar" buttons that submit the form. The textarea + message thread are the form content. The `formId` prop links the footer submit button to the form element.

---

## Files to Change

| File | Action | Description |
|------|--------|-------------|
| `alert-type-config.ts` | NEW | Config object for all 4 alert types |
| `alerts-view-form.tsx` | REWRITE | Config-driven layout with type-specific header + key metric |
| `alert-edit-form.tsx` | REWRITE | Conversation-style: header + message thread + textarea input |
| `alerts-data-table.tsx` | MODIFY | Adjust edit mode props for new form structure |

## Files Unchanged

- `alertCommentsService.ts` — API service unchanged
- `useAlertComments.ts` — hook unchanged
- `useAlertCommentsMutation.ts` — hook unchanged
- `alert-columns.tsx` — table columns unchanged
- `alerts.schema.ts` — shared DTOs unchanged
- `queryKeys.ts` — query keys unchanged
- `query-invalidation-map.ts` — invalidation unchanged

## Testing

- Existing alert comments tests (service + hooks) remain valid
- View form: no dedicated tests (renders config-driven content, covered by integration)
- Edit form: no dedicated tests (conversation styling, covered by integration)
- Run: `pnpm --filter frontend test && pnpm --filter frontend lint`

## Constraints

- Follow existing patterns: shadcn/ui, SlideOverForm, ExtendidosViewForm reference
- Spanish-only UI strings
- Zero-Scroll design: dvh, flex-1 overflow-hidden
- Enterprise DataTable style: bg-card/40, border-border/40, shadow-premium
- OKLCH tokens only
- `useAuthContext()` for current user identification
- Conventional Commits for commit message
