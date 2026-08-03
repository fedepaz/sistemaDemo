# Alert Forms Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign alert view and edit forms with type-specific visual identity and conversation-style messaging.

**Architecture:** Single config object per alert type drives both view and edit components. No dedicated components per type. Config defines icon, color, key metric, and field list. Edit form uses conversation bubbles with left/right alignment by user.

**Tech Stack:** React, shadcn/ui, Tailwind CSS, `useAuthContext()` for user identification, `useAlertComments`/`useAlertCommentsMutation` for CRUD.

## Global Constraints

- Conventional Commits enforced (`<type>(<scope>): <subject>`)
- "use client" on all provider and component files
- Spanish-only UI strings
- Zero-Scroll design: dvh, flex-1 overflow-hidden
- Enterprise DataTable style: bg-card/40, border-border/40, shadow-premium
- OKLCH tokens only, no new palettes/typography/spacing
- Follow existing patterns: shadcn/ui, SlideOverForm, ExtendidosViewForm reference
- `useAuthContext()` for current user identification (`userProfile.id` for comparison)
- `CommentDto.userId` = user ID, `CommentDto.userName` = `user.username`
- Conventional Commits for commit message

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `apps/frontend/src/features/alerts/components/v1/alert-type-config.ts` | CREATE | Config object for all 4 alert types + `AlertTypeConfig` interface |
| `apps/frontend/src/features/alerts/components/v1/alerts-view-form.tsx` | REWRITE | Config-driven layout: type header + key metric + compact fields + comments |
| `apps/frontend/src/features/alerts/components/v1/alert-edit-form.tsx` | REWRITE | Conversation-style: type header + message thread + textarea input |
| `apps/frontend/src/features/alerts/components/v1/alerts-data-table.tsx` | MODIFY | Adjust edit mode props for new form structure |

---

## Task 1: Create Alert Type Config

**Files:**
- Create: `apps/frontend/src/features/alerts/components/v1/alert-type-config.ts`

**Interfaces:**
- Consumes: Lucide icons, `AlertType` type
- Produces: `AlertTypeConfig` interface, `ALERT_TYPE_CONFIGS` record keyed by `AlertType`

**Imports needed:**
```ts
import type React from "react";
import { Scissors, Sprout, AlertTriangle, Package, Calendar, Truck, Flag, Leaf, Hash, Percent, MessageSquare } from "lucide-react";
import type { AlertType } from "@/features/alerts/types";
```

- [ ] **Step 1: Create config file**

```ts
import type React from "react";
import {
  Scissors,
  Sprout,
  AlertTriangle,
  Package,
  Calendar,
  Truck,
  Flag,
  Leaf,
  Hash,
  Percent,
  MessageSquare,
} from "lucide-react";
import type { AlertType } from "@/features/alerts/types";

export interface AlertTypeConfig {
  icon: React.ElementType;
  color: string;
  bgColor: string;
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

export const ALERT_TYPE_CONFIGS: Record<AlertType, AlertTypeConfig> = {
  SIEMBRA_RETRASADA: {
    icon: Scissors,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    label: "Siembra Retrasada",
    keyMetric: {
      field: "fechaSugeridaSiembra",
      label: "Fecha Sug.",
      icon: Calendar,
    },
    fields: [
      { field: "injerto", label: "Injerto", icon: Leaf },
      { field: "semSiembra", label: "Sem. Siembra", icon: Calendar },
      { field: "semEntrega", label: "Sem. Entrega", icon: Truck },
      { field: "estado", label: "Estado", icon: Flag },
    ],
  },
  FALTA_GERMINACION: {
    icon: Sprout,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    label: "Falta Germinación",
    keyMetric: {
      field: "fPrimer",
      label: "Fecha Primer",
      icon: Calendar,
    },
    fields: [
      { field: "injerto", label: "Injerto", icon: Leaf },
      { field: "pr", label: "PR", icon: Percent },
    ],
  },
  FALTA_DE_PLANTAS: {
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "Faltante Plantas",
    keyMetric: {
      field: "solicito",
      label: "Faltante",
      icon: AlertTriangle,
    },
    fields: [
      { field: "hai", label: "HAI", icon: Hash },
      { field: "fPrimer", label: "Fecha Primer", icon: Calendar },
      { field: "pr", label: "PR", icon: Percent },
      { field: "stIniPr", label: "ST", icon: Hash },
    ],
  },
  FALTA_PRE_EXPEDICION: {
    icon: Package,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Falta Pre-Expedición",
    keyMetric: {
      field: "fPreexp",
      label: "Fecha Pre-Exp",
      icon: Calendar,
    },
    fields: [
      { field: "injerto", label: "Injerto", icon: Leaf },
      { field: "pe", label: "PE", icon: Hash },
    ],
  },
};
```

- [ ] **Step 2: Verify no lint errors**

Run: `pnpm --filter frontend lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/alerts/components/v1/alert-type-config.ts
git commit -m "feat(alerts): add alert type config for view/edit redesign"
```

---

## Task 2: Rewrite View Form (Config-Driven)

**Files:**
- Rewrite: `apps/frontend/src/features/alerts/components/v1/alerts-view-form.tsx`

**Interfaces:**
- Consumes: `ALERT_TYPE_CONFIGS` from Task 1, `AlertType`
- Produces: Updated `AlertsViewFormProps` with `alertType` prop

- [ ] **Step 1: Read current file to understand existing structure**

Read: `apps/frontend/src/features/alerts/components/v1/alerts-view-form.tsx`

- [ ] **Step 2: Rewrite the view form**

Replace the entire file with:

```tsx
"use client";

import { Loader2, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlertComments } from "@/features/alerts/hooks/useAlertComments";
import { cn } from "@/lib/utils";
import type { AlertDto } from "@vivero/shared/schemas/alerts.schema";
import { ALERT_TYPE_CONFIGS } from "./alert-type-config";

interface AlertsViewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: AlertDto | null;
  alertType: "SIEMBRA_RETRASADA" | "FALTA_GERMINACION" | "FALTA_DE_PLANTAS" | "FALTA_PRE_EXPEDICION";
}

function SpecGridCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="bg-muted/50 p-2 rounded-lg border border-border/40">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold truncate">{String(value)}</p>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin}m`;
  if (diffH < 24) return `hace ${diffH}h`;
  return `hace ${diffD}d`;
}

export function AlertsViewForm({
  open,
  onOpenChange,
  alert,
  alertType,
}: AlertsViewFormProps) {
  const config = ALERT_TYPE_CONFIGS[alertType];
  const { data: comments, isLoading: commentsLoading } = useAlertComments(
    alert?.partida,
    alert?.anoSiembra,
  );

  if (!alert) return null;

  const keyMetricValue = config.keyMetric
    ? (alert as Record<string, unknown>)[config.keyMetric.field]
    : null;

  const TypeIcon = config.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col h-dvh p-0 overflow-hidden"
        side="right"
      >
        {/* Type-specific header */}
        <div className={cn("px-6 py-4", config.bgColor)}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <TypeIcon className={cn("h-5 w-5", config.color)} />
            </div>
            <div>
              <SheetTitle className={cn("text-base font-semibold", config.color)}>
                {config.label}
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                Partida #{alert.partida}/{alert.anoSiembra} · Año {alert.anoSiembra}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Key Metric Card */}
          {config.keyMetric && keyMetricValue !== null && keyMetricValue !== undefined && (
            <div className="bg-card/40 p-4 rounded-xl border border-border/40 shadow-premium">
              <div className="flex items-center gap-2 mb-1">
                <config.keyMetric.icon className={cn("h-4 w-4", config.color)} />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {config.keyMetric.label}
                </span>
              </div>
              <p className={cn("text-2xl font-bold", config.color)}>
                {String(keyMetricValue)}
              </p>
            </div>
          )}

          {/* Spec Grid */}
          {config.fields.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {config.fields.map((field) => {
                const value = (alert as Record<string, unknown>)[field.field];
                return (
                  <SpecGridCell
                    key={field.field}
                    icon={field.icon}
                    label={field.label}
                    value={value as string | number | null}
                  />
                );
              })}
            </div>
          )}

          {/* Separator + Comments */}
          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Comentarios {comments ? `(${comments.length})` : ""}
              </span>
            </div>

            {commentsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs bg-muted">
                      {getInitials(comment.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium truncate">
                        {comment.userName}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground break-words">
                      {comment.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay comentarios aún
              </p>
            )}
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t">
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 3: Verify no lint errors**

Run: `pnpm --filter frontend lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/alerts/components/v1/alerts-view-form.tsx
git commit -m "feat(alerts): rewrite view form with config-driven layout"
```

---

## Task 3: Rewrite Edit Form (Conversation Style)

**Files:**
- Rewrite: `apps/frontend/src/features/alerts/components/v1/alert-edit-form.tsx`

**Interfaces:**
- Consumes: `ALERT_TYPE_CONFIGS` from Task 1, `useAlertComments`, `useAlertCommentsMutation`, `useAuthContext`
- Produces: Updated `AlertEditFormProps` with `alertType` prop

- [ ] **Step 1: Read current file to understand existing structure**

Read: `apps/frontend/src/features/alerts/components/v1/alert-edit-form.tsx`

- [ ] **Step 2: Rewrite the edit form**

Replace the entire file with:

```tsx
"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import { useAlertComments } from "@/features/alerts/hooks/useAlertComments";
import { useAlertCommentsMutation } from "@/features/alerts/hooks/useAlertCommentsMutation";
import { cn } from "@/lib/utils";
import type { AlertDto } from "@vivero/shared/schemas/alerts.schema";
import { ALERT_TYPE_CONFIGS } from "./alert-type-config";

interface AlertEditFormProps {
  alert: AlertDto | null;
  alertType: "SIEMBRA_RETRASADA" | "FALTA_GERMINACION" | "FALTA_DE_PLANTAS" | "FALTA_PRE_EXPEDICION";
  onSubmitted?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin}m`;
  if (diffH < 24) return `hace ${diffH}h`;
  return `hace ${diffD}d`;
}

export function AlertEditForm({
  alert,
  alertType,
  onSubmitted,
}: AlertEditFormProps) {
  const { userProfile } = useAuthContext();
  const [message, setMessage] = useState("");
  const config = ALERT_TYPE_CONFIGS[alertType];

  const { data: comments, isLoading: commentsLoading } = useAlertComments(
    alert?.partida,
    alert?.anoSiembra,
  );

  const { mutate: createComment, isPending } = useAlertCommentsMutation();

  if (!alert || !userProfile) return null;

  const handleSubmit = () => {
    if (!message.trim()) return;

    createComment(
      {
        partida: alert.partida,
        anoSiembra: alert.anoSiembra,
        message: message.trim(),
      },
      {
        onSuccess: () => {
          setMessage("");
          onSubmitted?.();
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const TypeIcon = config.icon;

  return (
    <div className="flex flex-col h-full">
      {/* Type-specific header */}
      <div className={cn("px-6 py-4 border-b shrink-0", config.bgColor)}>
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", config.bgColor)}>
            <TypeIcon className={cn("h-5 w-5", config.color)} />
          </div>
          <div>
            <h3 className={cn("text-base font-semibold", config.color)}>
              {config.label}
            </h3>
            <p className="text-xs text-muted-foreground">
              Partida #{alert.partida}/{alert.anoSiembra} · Año {alert.anoSiembra}
            </p>
          </div>
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {commentsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3",
                  i % 2 === 0 ? "" : "flex-row-reverse"
                )}
              >
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => {
            const isMe = comment.userId === userProfile.id;
            return (
              <div
                key={comment.id}
                className={cn(
                  "flex items-start gap-3",
                  isMe && "flex-row-reverse"
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-xs",
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {getInitials(comment.userName)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "flex-1 min-w-0",
                    isMe && "flex flex-col items-end"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-baseline gap-2",
                      isMe && "flex-row-reverse"
                    )}
                  >
                    <span className="text-sm font-medium truncate">
                      {isMe ? "Yo" : comment.userName}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "mt-1 px-3 py-2 rounded-xl text-sm break-words max-w-[80%]",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    )}
                  >
                    {comment.message}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay comentarios. Escribe el primero.
          </p>
        )}
      </div>

      {/* Input area */}
      <div className="border-t px-6 py-4 shrink-0 bg-background">
        <div className="flex items-end gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu comentario..."
            className="min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!message.trim() || isPending}
            className="shrink-0"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify no lint errors**

Run: `pnpm --filter frontend lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/alerts/components/v1/alert-edit-form.tsx
git commit -m "feat(alerts): rewrite edit form with conversation-style messaging"
```

---

## Task 4: Update AlertsDataTable (Edit Mode Props)

**Files:**
- Modify: `apps/frontend/src/features/alerts/components/v1/alerts-data-table.tsx`

**Interfaces:**
- Consumes: `ALERT_TYPE_CONFIGS` from Task 1, updated `AlertsViewForm` and `AlertEditForm` signatures
- Produces: Updated `AlertsDataTableProps` with `alertType` prop

- [ ] **Step 1: Read current file to understand existing structure**

Read: `apps/frontend/src/features/alerts/components/v1/alerts-data-table.tsx`

- [ ] **Step 2: Modify the edit mode in SlideOverForm**

In the `renderEdit` callback inside `SlideOverForm`, the edit mode currently uses `formId` and `form` props. Update to match the new form structure:

```tsx
renderEdit={() => (
  <div className="flex-1 overflow-hidden">
    <AlertEditForm
      alert={formAlert}
      alertType={alertType}
      onSubmitted={() => {
        onOpenChange(false);
      }}
    />
  </div>
)}
```

The `SlideOverForm` footer for edit mode should submit the form:

```tsx
footer={
  editMode === "edit" ? (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Cancelar
      </Button>
      <Button type="submit" form="alert-comment-form" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Enviar"
        )}
      </Button>
    </div>
  ) : undefined
}
```

- [ ] **Step 3: Verify no lint errors**

Run: `pnpm --filter frontend lint`
Expected: PASS

- [ ] **Step 4: Run existing tests**

Run: `pnpm --filter frontend test`
Expected: PASS (no new tests for this task, existing tests should still pass)

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/alerts/components/v1/alerts-data-table.tsx
git commit -m "feat(alerts): update DataTable edit mode for new form structure"
```

---

## Task 5: Final Verification

- [ ] **Step 1: Run full lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 2: Run full type-check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 3: Run all tests**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 4: Commit any remaining fixes**

If any lint/type errors found, fix and commit:

```bash
git add -A
git commit -m "fix(alerts): address lint and type errors from forms redesign"
```

- [ ] **Step 5: Final commit with all changes**

```bash
git add -A
git commit -m "feat(alerts): redesign alert view/edit forms with type-specific visual identity and conversation-style messaging"
```
