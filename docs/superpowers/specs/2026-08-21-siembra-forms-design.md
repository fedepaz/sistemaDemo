# Siembra Forms Redesign

## Context

The siembra (sowing) feature was recently refactored to split the `asignar-ubicacion` endpoint into separate extendidos and siembra flows. The `SiembraDto` now includes new fields (`propiedad`, `solicito`, `nrocont`, `extendido`, `germin`) and the `AsignarUbiSiembraDto` uses `cg` (camera), `cantidaNroCont` (confirmed quantity), and `germin` (germination). The current view and edit forms are incomplete and inconsistent with the project's UX patterns.

## Goal

Update `siembra-view-form.tsx` and `siembra-edit-form.tsx` to:
1. Display all SiembraDto fields in the view form
2. Follow the extendidos tabbed layout pattern for consistency
3. Implement a "confirm quantity" UX in the edit form (read-only default, edit button to switch to input)
4. Hide `germin` from the edit form (inject automatically on submit)
5. Keep `cg` (camera) as always required

## Design

### View Form (`siembra-view-form.tsx`)

**Structure**: Tabbed layout matching `extendido-view-form.tsx`

**Product Header** (shrink-0, always visible):
- Left: Species icon + `codigoEspecie` (large) + `nombreEspecie` (badge style)
- Right: `nrocont` labeled "Bandejas"

**Basic Specs Grid** (4 columns, shrink-0):
| Column | Field | Icon |
|--------|-------|------|
| 1 | Año (`anio`) | Calendar |
| 2 | Índice (`indice`) | Hash |
| 3 | HAI (mapped label) | Info |
| 4 | Injerto (`injerto`) | Activity |

**Tab 1 — "Datos"** (default tab):
- InfoRow: Propiedad (`propiedad`) — Warehouse icon
- InfoRow: Solicitó (`solicito`) — ClipboardList icon
- InfoRow: Fecha Sugerida (`fechaSugeridaSiembra`) — Calendar icon
- InfoRow: Germinación (`germin`) — Activity icon

**Tab 2 — "Notas"**:
- Card with extendido text (`extendido`)
- Fallback: "Sin observaciones." if empty
- Same card-style as extendidos notes tab

### Edit Form (`siembra-edit-form.tsx`)

**Product Header** (shrink-0):
- Same as view form

**Camera Select** (required):
- Label: "Cámara de Destino" with Warehouse icon
- Select dropdown filtering `depositos.filter(d => d.camara !== "")`
- Same styling as extendidos edit form

**Quantity Section** (two-state component, local `useState<boolean>` for edit mode):
- **Read-only state (default)**:
  - Label: "Cantidad" with Activity icon
  - Styled read-only box showing `nrocont` value (same `p-4 flex items-center` style as extendidos "Bandejas Recibidas")
  - Small "Editar" button (text link style, `text-primary text-xs font-bold`) positioned at the bottom-right of the box
- **Edit state** (after pressing "Editar"):
  - Number input replacing the read-only box
  - Same styling as extendidos baja input (h-12 md:h-16, text-xl md:text-3xl font-black px-4)
  - "Cancelar" text button to revert to read-only state and restore original value
- Pre-filled with `parseInt(selectedExtendido.nrocont)` as default form value

**Observaciones** (textarea):
- Label: "Observaciones" with FileText icon
- Field: `detalle`
- Placeholder: "Notas de ubicación..."
- Same styling as extendidos

**No germin field** in the edit form.

### Schema & Submit Handling

The `AsignarUbiSiembraDtoSchema` requires `germin: z.number().int().positive()`. Since germin is hidden from the form:

- The `handleAsignarUbicacionSiembra` function in `siembra-data-table.tsx` will inject `germin: parseInt(selectedPartida.germin)` into the form data before calling the mutation
- Form default values will include `germin` from the selected partida
- The germin input is removed from the edit form entirely

### Files to Modify

1. `apps/frontend/src/features/siembra/components/siembra-view-form.tsx` — full rewrite
2. `apps/frontend/src/features/siembra/components/siembra-edit-form.tsx` — remove germin field, add quantity toggle
3. `apps/frontend/src/features/siembra/components/siembra-data-table.tsx` — update form defaults (pre-fill cantidaNroCont, inject germin)

### UX Patterns to Follow

All patterns from `extendido-view-form.tsx` and `extendido-edit-form.tsx`:
- `InfoRow` component for view form rows
- Card + CardContent for tab content
- Tabs / TabsList / TabsTrigger / TabsContent for tabbed navigation
- Product header with bg-primary/5, rounded-xl, border-primary/20
- Basic specs grid with bg-background, border-border/60
- Form field styling: icon in bg-primary/10 rounded-lg, label in text-[10px] md:text-xs font-black uppercase tracking-widest
- Select trigger: h-10 md:h-14 rounded-xl border-border/60
- Textarea: min-h-[80px] md:min-h-[120px] rounded-xl

### Out of Scope

- Backend changes (no API or schema changes needed)
- Column definitions in `columns.tsx` (already updated)
- Query invalidation (already works)
