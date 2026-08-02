# Alert Comments Feature — Design Spec

**Date:** 2026-07-28
**Status:** Approved
**Scope:** Siembra Retrasada + Faltante Plantas (extendable to all 4 alert types)

## Goal

Add a comment thread system to alerts. Users can pin notes on specific partidas — like a school blackboard. Comments are informational only; they don't affect alert queries or trigger actions. The actual resolution happens in other screens (siembra screen, external systems).

## Constraints

- **No backend DTOs** — All schemas live in `packages/shared/src/schemas/alerts.schema.ts`
- **No `l-` prefix on API paths** — This is the main Prisma DB, not legacy
- **Module location:** `apps/backend/src/modules/alertComments/` (not `legacy/`)
- **Permission:** Uses existing `alerts` entity with `PROCESS` type for write access
- **Scope:** Siembra Retrasada + Faltante Plantas only (client requirement), infrastructure supports all 4

## Architecture

### Database: Prisma-managed `alert_comments` table

New file: `apps/backend/prisma/schema/alertComment.prisma`

```prisma
model AlertComment {
  id        String   @id @default(cuid())
  alertType String   @db.VarChar(30)  // "SIEMBRA_RETRASADA" | "FALTANTE_PLANTAS"
  partidaId Int
  anio      Int
  indice    Int
  content   String   @db.VarChar(500)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([alertType, partidaId, anio, indice])
  @@map("alert_comments")
}
```

Add to `prisma/schema/user.prisma`:
```prisma
alertComments AlertComment[]
```

### commentCount Strategy

Alert queries run against the **legacy MySQL database** (via `LegacyMysqlService`). The `alert_comments` table is in the **main Prisma database**. Cannot JOIN across separate databases.

**Solution — batch query:**

1. `AlertsService` fetches alerts from legacy DB (existing queries unchanged)
2. `AlertCommentsRepository.getCommentCounts(alertType, keys[])` — single Prisma `GROUP BY` query
3. Service merges `commentCount` into each DTO before response

```
Legacy DB (alerts) ──→ AlertsService ──→ merge commentCount ──→ DTO response
Main DB (comments) ──→ AlertCommentsRepository (batch count) ──┘
```

### Row Indicator

Table rows with comments show a small dot next to the `MessageSquare` icon:

```tsx
<div className="relative">
  <MessageSquare className="h-4 w-4 text-muted-foreground" />
  {commentCount > 0 && (
    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
  )}
</div>
```

## Shared Schemas

File: `packages/shared/src/schemas/alerts.schema.ts`

### Add `commentCount` to all 4 existing alert DTOs

```typescript
// Add to SiembraRetrasadaDtoSchema:
commentCount: z.number().default(0)

// Add to FaltaGerminacionDtoSchema:
commentCount: z.number().default(0)

// Add to FaltantePlantasDtoSchema:
commentCount: z.number().default(0)

// Add to FaltaPreExpedicionDtoSchema:
commentCount: z.number().default(0)
```

### New alert comment schemas

```typescript
export const AlertCommentSchema = z.object({
  id: z.string(),
  alertType: z.string(),
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  content: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  createdAt: z.string(),
});

export type AlertCommentDto = z.infer<typeof AlertCommentSchema>;

export const CreateAlertCommentSchema = z.object({
  alertType: z.enum(["SIEMBRA_RETRASADA", "FALTANTE_PLANTAS"]),
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  content: z.string().min(1).max(500),
});

export type CreateAlertCommentDto = z.infer<typeof CreateAlertCommentSchema>;
```

## Backend Module

Location: `apps/backend/src/modules/alertComments/`

```
alertComments/
├── alertComments.module.ts
├── alertComments.controller.ts
├── alertComments.service.ts
├── alertComments.repository.ts
└── __tests__/
    ├── alertComments.service.spec.ts
    └── alertComments.controller.spec.ts
```

**No `dto/` directory** — imports schemas from `@vivero/shared`.

### Endpoints

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/alert-comments/:alertType/:partidaId/:anio/:indice` | `alerts:read` | List comments for a partida |
| POST | `/alert-comments` | `alerts:create` | Add comment (authorId from JWT) |

### GET Response

```json
[
  {
    "id": "cuid...",
    "alertType": "SIEMBRA_RETRASADA",
    "partidaId": 1045,
    "anio": 2026,
    "indice": 1,
    "content": "Sembrada el lunes, pendiente revisión",
    "authorId": "user-cuid...",
    "authorName": "Juan Perez",
    "createdAt": "2026-07-28T10:30:00.000Z"
  }
]
```

### POST Body

```json
{
  "alertType": "SIEMBRA_RETRASADA",
  "partidaId": 1045,
  "anio": 2026,
  "indice": 1,
  "content": "Sembrada el lunes, pendiente revisión"
}
```

`authorId` comes from `@CurrentUser()` decorator (JWT token), not request body.

### Repository Methods

```typescript
alertComments.repository.ts:

findByPartida(alertType, partidaId, anio, indice): Promise<AlertComment[]>
  // SELECT ac.*, u.username as authorName
  // FROM alert_comments ac
  // JOIN users u ON u.id = ac.authorId
  // WHERE ac.alertType = ? AND ac.partidaId = ? AND ac.anio = ? AND ac.indice = ?
  // ORDER BY ac.createdAt DESC

getCommentCounts(alertType, keys: {partidaId, anio, indice}[]): Promise<Map<string, number>>
  // SELECT alertType, partidaId, anio, indice, COUNT(*) as count
  // FROM alert_comments
  // WHERE alertType = ? AND (partidaId, anio, indice) IN (...)
  // GROUP BY alertType, partidaId, anio, indice

create(data: CreateAlertCommentDto, authorId: string): Promise<AlertComment>
```

### Service Methods

```typescript
alertComments.service.ts:

getComments(alertType, partidaId, anio, indice): Promise<AlertCommentDto[]>
getCommentCounts(alertType, keys[]): Promise<Map<string, number>>
  // Used by AlertsService to merge counts into alert DTOs
createComment(dto: CreateAlertCommentDto, authorId: string): Promise<AlertCommentDto>
```

### Integration with AlertsService

Modify `alerts.service.ts` to merge `commentCount`:

```typescript
async getSiembraRetrasada(): Promise<SiembraRetrasadaDto[]> {
  const rows = await this.alertsRepo.findSiembraRetrasada();
  const dtos = rows.map((row) => this.mapSiembraRetrasada(row));

  // Batch fetch comment counts
  const keys = dtos.map((d) => ({ partidaId: d.partidaId, anio: d.anio, indice: d.indice }));
  const counts = await this.alertCommentsRepo.getCommentCounts('SIEMBRA_RETRASADA', keys);

  // Merge counts
  return dtos.map((dto) => ({
    ...dto,
    commentCount: counts.get(`${dto.partidaId}-${dto.anio}-${dto.indice}`) ?? 0,
  }));
}
```

Same pattern for `getFaltantePlantas()`.

### Permission Change

The `alerts` entity in the database needs `permissionType` updated from `READ_ONLY` to `PROCESS`. This is a data migration (SQL UPDATE), not a schema change.

## Frontend

### New Files

```
src/features/alerts/
├── api/alertCommentsService.ts          # API calls
├── hooks/useAlertComments.ts            # useSuspenseQuery + useMutation
├── components/shared/alert-comment-sheet.tsx  # Sheet with thread + input
```

### alertCommentsService.ts

```typescript
export const alertCommentsService = {
  fetchComments: (alertType: string, partidaId: number, anio: number, indice: number) =>
    clientFetch<AlertCommentDto[]>(
      `alert-comments/${alertType}/${partidaId}/${anio}/${indice}`,
      { method: 'GET' }
    ),

  createComment: (data: CreateAlertCommentDto) =>
    clientFetch<AlertCommentDto>('alert-comments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
```

### useAlertComments.ts

```typescript
export function useAlertComments(alertType: string, partidaId: number, anio: number, indice: number) {
  return useSuspenseQuery({
    queryKey: alertCommentsQueryKeys.byPartida(alertType, partidaId, anio, indice),
    queryFn: () => alertCommentsService.fetchComments(alertType, partidaId, anio, indice),
  });
}

export function useCreateAlertComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: alertCommentsService.createComment,
    onSuccess: () => {
      invalidateQueries(queryClient, 'createAlertComment');
    },
  });
}
```

### Query Keys

Add to `src/lib/queryKeys.ts`:

```typescript
export const alertCommentsQueryKeys = {
  all: () => ["alert-comments"] as const,
  byPartida: (alertType: string, partidaId: number, anio: number, indice: number) =>
    [...alertCommentsQueryKeys.all(), alertType, partidaId, anio, indice] as const,
};
```

### Mutation Invalidation

Add to `src/lib/query-invalidation-map.ts`:

```typescript
createAlertComment: {
  queries: (data: CreateAlertCommentDto) => [
    alertCommentsQueryKeys.byPartida(data.alertType, data.partidaId, data.anio, data.indice),
  ],
},
```

### AlertCommentSheet

Reuses `Sheet` + `SheetContent` pattern from `slide-over-form.tsx`:

- Header: Partida info + close button
- Body: Comment thread (newest first) + ScrollArea
- Footer: Text input + send button (only for `PROCESS` users)
- Spanish-only UI strings

### Column Updates (`alert-columns.tsx`)

Add `MessageSquare` icon to SiembraRetrasada and FaltantePlantas columns:

```tsx
{
  id: 'comments',
  header: '',
  cell: ({ row }) => {
    const count = row.original.commentCount;
    return (
      <button
        onClick={() => onCommentClick(row.original)}
        className="relative p-1 hover:bg-muted rounded cursor-pointer"
        aria-label={`Comentarios (${count})`}
      >
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
        )}
      </button>
    );
  },
  size: 40,
}
```

## Testing

### Backend

- `alertComments.service.spec.ts` — Test CRUD operations, comment count merging
- `alertComments.controller.spec.ts` — Test endpoints with mocked service
- Update `alerts.service.spec.ts` — Test commentCount merging logic

### Frontend

- `alertCommentsService.test.ts` — Test API calls
- `useAlertComments.test.tsx` — Test hooks with mocked service
- `alert-comment-sheet.test.tsx` — Test sheet renders, submit, empty state

## Files Changed

| File | Change |
|------|--------|
| `packages/shared/src/schemas/alerts.schema.ts` | Add `commentCount` to 4 DTOs + new AlertComment schemas |
| `packages/shared/src/schemas/__tests__/alerts.schema.spec.ts` | Add tests for new schemas |
| `apps/backend/prisma/schema/alertComment.prisma` | NEW — Prisma model |
| `apps/backend/prisma/schema/user.prisma` | Add `alertComments` relation |
| `apps/backend/src/modules/alertComments/*` | NEW — Full module |
| `apps/backend/src/modules/legacy/alerts/alerts.service.ts` | Merge commentCount |
| `apps/backend/src/modules/legacy/alerts/alerts.service.spec.ts` | Test commentCount |
| `apps/frontend/src/features/alerts/api/alertCommentsService.ts` | NEW — API service |
| `apps/frontend/src/features/alerts/hooks/useAlertComments.ts` | NEW — Hooks |
| `apps/frontend/src/features/alerts/components/shared/alert-comment-sheet.tsx` | NEW — Sheet |
| `apps/frontend/src/features/alerts/components/shared/alert-columns.tsx` | Add comment icon |
| `apps/frontend/src/lib/queryKeys.ts` | Add alertCommentsQueryKeys |
| `apps/frontend/src/lib/query-invalidation-map.ts` | Add createAlertComment |
| `apps/frontend/src/features/alerts/index.ts` | Export new components/hooks |
