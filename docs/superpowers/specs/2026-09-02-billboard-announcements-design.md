# Billboard / In-App Announcements System

## Overview

A database-backed billboard system for displaying update announcements to users. Messages are permission-targeted, tag-grouped (for superseding), and shown as a dismissible modal after login. Developers manage messages via seed scripts (no admin UI).

## Goals

- Announce new features and changes to users at login
- Target messages by exact permission match (entity + action + scope)
- Supersede older messages automatically via tag grouping
- Allow users to dismiss and read later
- Serve as a changelog/version-control for non-developer clients

## Non-Goals

- Admin UI for creating billboard messages (developer-only via seeds/DB)
- Push notifications or real-time updates
- Per-message read tracking (read-all or none)

---

## Database Schema

### BillboardMessage

```prisma
model BillboardMessage {
  id                String    @id @default(cuid())
  title             String    @db.VarChar(200)
  body              String    @db.VarChar(500)
  tag               String    @db.VarChar(50)
  permissionTable   String    @db.VarChar(50)
  permissionAction  String    @db.VarChar(20)
  permissionScope   String    @db.VarChar(10)
  targetNewUsers    Boolean   @default(false)
  effectiveFrom     DateTime?
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedByUserId   String?
  deletedAt         DateTime? @db.Timestamp(0)

  reads             UserBillboardRead[]
}
```

### UserBillboardRead

```prisma
model UserBillboardRead {
  id                 String           @id @default(cuid())
  userId             String
  billboardMessageId String
  readAt             DateTime         @default(now())

  user               User             @relation(fields: [userId], references: [id])
  billboardMessage   BillboardMessage @relation(fields: [billboardMessageId], references: [id])

  @@unique([userId, billboardMessageId])
}
```

### User Model Update

Add relation to `user.prisma`:

```diff
  alertsSolved        AlertsSolved[]
+ billboardReads      UserBillboardRead[]
```

### Field Details

| Field | Type | Purpose |
|-------|------|---------|
| `tag` | String | Grouping key for superseding — only latest message per tag is shown |
| `permissionTable` | String | Exact entity name to match against user's permissions (e.g. `"alerts"`) |
| `permissionAction` | String | Action to match: `"create"`, `"read"`, `"update"`, `"delete"` |
| `permissionScope` | String | Scope to match: `"NONE"`, `"OWN"`, `"ALL"` |
| `targetNewUsers` | Boolean | If true, shows to users created after message was posted |
| `effectiveFrom` | DateTime? | If set, only shows to users with `createdAt >= effectiveFrom` |

---

## Backend

### Module Structure

```
apps/backend/src/modules/billboard/
  billboard.module.ts
  billboard.controller.ts
  billboard.service.ts
  repositories/
    billboard.repository.ts
  __tests__/
    billboard.service.spec.ts
```

Follows existing module pattern (same as `alertComments/`, `taskShifts/`).

### Endpoints

| Method | Route | Permission | Description |
|--------|-------|------------|-------------|
| `GET` | `/billboard/unread` | `@RequirePermission({ tableName: 'user_profile', action: 'read', scope: 'OWN' })` | Returns unread messages for the authenticated user |
| `POST` | `/billboard/read` | `@RequirePermission({ tableName: 'user_profile', action: 'read', scope: 'OWN' })` | Marks messages as read |

Using `user_profile` entity — every authenticated user has this permission. No new entity registration needed.

### GET /billboard/unread — Filtering Logic

```
1. Fetch all active BillboardMessages (deletedAt IS NULL, isActive = true)
2. Filter by user's permissions:
   - For each message, check if user has a UserPermission where:
     entityId matches message.permissionTable
     AND the action boolean (canCreate/canRead/canUpdate/canDelete) is true
     AND scope >= message.permissionScope
3. Filter by effectiveFrom:
   - If message.effectiveFrom IS NOT NULL, skip if user.createdAt < message.effectiveFrom
4. Filter by targetNewUsers:
   - If message.targetNewUsers = false AND user.createdAt > message.createdAt, skip
5. Group by tag, keep only the latest message per group (ORDER BY createdAt DESC)
6. Exclude messages already in UserBillboardRead for this user
7. Return sorted by createdAt DESC
```

### POST /billboard/read — Mark as Read

```
Input: { messageIds?: string[] }
- If messageIds provided: mark specific messages as read
- If not provided: mark ALL currently unread messages as read
- Upsert into UserBillboardRead (skip duplicates via @@unique)
- Return { markedCount: number }
```

### Shared Schema

File: `packages/shared/src/schemas/billboard.schema.ts`

```typescript
export const BillboardMessageSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  tag: z.string(),
  createdAt: z.string().datetime(),
});

export const MarkBillboardReadSchema = z.object({
  messageIds: z.array(z.string()).optional(),
});
```

---

## Frontend

### Feature Structure

```
apps/frontend/src/features/billboard/
  index.ts
  types.ts
  api/
    billboardService.ts
  hooks/
    useUnreadBillboard.ts
    useMarkBillboardRead.ts
  components/
    BillboardModal.tsx
```

### Flow

```
User logs in
  → Dashboard layout mounts
  → useUnreadBillboard() fires GET /billboard/unread
  → If messages.length > 0 → show BillboardModal
  → User scrolls through messages
  → User clicks "Entendido" → POST /billboard/read → modal closes
  → OR user clicks X/backdrop → AlertDialog warning → user can dismiss
  → Query cache invalidated — next check returns empty
```

### BillboardModal Behavior

- Uses shadcn `Dialog` component (same pattern as `AlertModalDialog`)
- Full-screen overlay with `max-h-[90vh]` content area for scrolling
- Each message as a card: title, body, date
- Messages grouped by tag, newest first
- Sticky footer with `Button` "Entendido"

**Close options:**

1. **"Entendido" button** — marks all as read, closes modal
2. **X button or backdrop click** — triggers `AlertDialog`:
   - Title: "¿Cerrar sin marcar como leído?"
   - Description: "Los mensajes no se marcarán como leídos. Los verás en tu próximo inicio de sesión."
   - "Cerrar de todos modos" — closes without marking read
   - "Volver" — stays on modal
3. **Query failure** — modal doesn't show, app works normally

### Trigger Point

In `apps/frontend/src/app/(dashboard)/layout.tsx`:

```tsx
function BillboardCheck() {
  const { data: messages } = useUnreadBillboard();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (messages && messages.length > 0) setOpen(true);
  }, [messages]);

  if (!messages?.length) return null;
  return <BillboardModal open={open} messages={messages} />;
}
```

### Query Keys

Added to `queryKeys.ts`:

```typescript
billboard: {
  unread: () => ["billboard", "unread"] as const,
}
```

### Cache Invalidation

After marking as read, invalidate `billboard:unread`.

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| `GET /billboard/unread` fails | Modal doesn't show, app works normally |
| `POST /billboard/read` fails | Modal stays open, toast "No se pudo marcar como leído. Intenta de nuevo." |
| DB connection issue | Graceful fallback — billboard is nice-to-have, not critical path |

---

## Testing

### Backend Unit Tests

- `BillboardService.getUnreadMessages`:
  - Filters by permissions correctly
  - Groups by tag, keeps only latest
  - Respects effectiveFrom
  - Respects targetNewUsers
  - Excludes already-read messages
- `BillboardService.markAsRead`:
  - Bulk upsert works
  - Idempotent (duplicate clicks don't fail)

### Backend Integration Tests

- `GET /billboard/unread` — mock DB, verify response shape
- `POST /billboard/read` — verify UserBillboardRead records created

### Frontend Unit Tests

- `useUnreadBillboard` — mock API, test loading/error states
- `BillboardModal` — render with mock messages, verify scroll, click "Entendido", backdrop dismiss with AlertDialog

### Shared Schema Tests

- `BillboardMessageSchema` — valid/invalid payloads
- `MarkBillboardReadSchema` — with and without messageIds

---

## Seed Script Example

A billboard message is created via Prisma seed or direct DB insert:

```typescript
await prisma.billboardMessage.create({
  data: {
    title: "Alertas resueltas ahora cubre todas las alertas",
    body: "La funcionalidad de alertas resueltas ahora aplica a todas las alertas, no solo una. Ya no necesitas marcar cada alerta individualmente.",
    tag: "alerts-solved",
    permissionTable: "alerts",
    permissionAction: "update",
    permissionScope: "ALL",
    targetNewUsers: true,
  },
});
```

This message shows to any user with `alerts` + `canUpdate = true` + `scope = ALL`.
