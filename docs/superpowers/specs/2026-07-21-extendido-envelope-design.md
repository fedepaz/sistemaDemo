# Curly Brace Envelope for Extendido Differentiation

**Date:** 2026-07-21
**Status:** Approved
**Approach:** Simple replacement (no strip-then-append)

---

## Goal

Replace `[webApp]` tag with `{message}` envelope to differentiate new app data from legacy MariaDB data. The envelope wraps each new message individually, allowing identification of data origin without losing any information.

---

## Behavior

| Scenario | `extendido` result | `detalle` result |
|---|---|---|
| Old data "hello", new message "world" | `hello {world}` | `{world}` |
| Previous `{world}`, new message "foo" | `hello {world} {foo}` | `{world} {foo}` |
| No message provided | `hello {}` | `{}` |
| Old data "hello", no previous envelope | `hello {world}` | `{world}` |

---

## Design

### Approach: Simple Replacement

- Swap `[webApp]` tag content with `{message}` or `{}`
- Both `detalle` and `extendido` fields use the same envelope logic
- Stacking is acceptable (max ~5 messages expected)
- No stripping of existing envelopes

### Changes Required

**File: `apps/backend/src/modules/legacy/partidas/repositories/partidas.repository.ts`**

1. Replace `const webAppTag = '[webApp]';` with dynamic envelope logic
2. For `detalle`: if `data.detalle` exists → `{data.detalle}`, else `{}`
3. For `extendido`: append `{data.extendido}` or `{}` to existing value

### No Changes Needed

- **Frontend** — already sends current `extendido` value from DB via `selectedPartida.extendido || selectedPartida.detalle || ""`
- **Schema** — `extendido` is already `z.string().default("")` in `AsignarUbicacionDtoSchema`
- **View form** — displays raw value, no tag filtering needed
- **Service layer** — passes data through, no modification needed

---

## Edge Cases

- **Empty message**: Appends `{}` — ensures envelope is always present for new app data
- **MariaDB compatibility**: Curly braces `{}` are safe in MariaDB text fields
- **Existing `[webApp]` tags**: Left as-is in legacy data — the envelope format is visually distinct
- **Multiple edits**: Envelopes stack naturally: `hello {world} {foo} {}` — acceptable for max ~5 messages
