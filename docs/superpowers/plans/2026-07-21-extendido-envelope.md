# Curly Brace Envelope Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `[webApp]` tag with `{message}` envelope in `partidas.repository.ts` to differentiate new app data from legacy MariaDB data.

**Architecture:** Single file modification — swap the static tag for dynamic envelope logic that wraps the user's message in curly braces, or appends empty braces `{}` if no message provided.

**Tech Stack:** TypeScript, NestJS, MariaDB

## Global Constraints

- MariaDB text field — curly braces `{}` are safe characters
- No frontend changes needed — already sends current `extendido` value from DB
- No schema changes needed — `extendido` is already `z.string().default("")`
- Max ~5 messages expected — envelope stacking is acceptable

---

### Task 1: Modify Repository Envelope Logic

**Files:**
- Modify: `apps/backend/src/modules/legacy/partidas/repositories/partidas.repository.ts:80-88`

**Interfaces:**
- Consumes: `data.extendido` (string from frontend, current DB value)
- Consumes: `data.detalle` (optional string from frontend)
- Produces: `finalExtendido` (string with envelope appended)
- Produces: `finalDetalle` (string with envelope appended)

- [ ] **Step 1: Replace tag logic with envelope**

Current code (lines 80-88):
```typescript
const webAppTag = '[webApp]';

// We append the tag to the detail if provided, or just use the tag
const finalDetalle = data.detalle
  ? `${data.detalle} ${webAppTag}`.trim()
  : webAppTag;

// We append the tag to the extendido field
const finalExtendido = `${data.extendido} ${webAppTag}`.trim();
```

New code:
```typescript
// Envelope new message in curly braces, or append empty braces if no message
const finalDetalle = data.detalle
  ? `${data.detalle} {${data.detalle}}`.trim()
  : '{}';

const finalExtendido = `${data.extendido} {${data.extendido || ''}}`.trim();
```

- [ ] **Step 2: Run lint to verify no syntax errors**

Run: `pnpm lint`
Expected: PASS (no lint errors)

- [ ] **Step 3: Verify YAML/TypeScript compilation**

Run: `pnpm --filter backend build`
Expected: PASS (build succeeds)

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/modules/legacy/partidas/repositories/partidas.repository.ts
git commit -m "fix(partidas): replace [webApp] tag with curly brace envelope for extendido differentiation"
```
