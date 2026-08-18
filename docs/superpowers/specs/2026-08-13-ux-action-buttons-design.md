# Design: UX/UI Improvements for Action Buttons

**Date:** 2026-08-13
**Status:** Approved
**Scope:** Tooltip, accessibility, confirmation dialogs for AlertSolvedButton and RestorePasswordButton

## Problem

The newly extracted `AlertSolvedButton` and `RestorePasswordButton` components lack tooltips, aria-labels, and confirmation dialogs that the rest of the app consistently provides.

## Constraints

- Empty `catch {}` blocks are intentional — global error provider handles errors
- Must follow existing tooltip pattern: `<Tooltip>` → `<TooltipTrigger asChild>` → `<TooltipContent className="border border-border shadow-md">`
- Must follow existing AlertDialog pattern from `DeleteDialog` but with non-destructive styling
- Spanish-language labels throughout
- `min-h-[48px]` touch targets on dialog buttons
- `TooltipProvider` is already globally configured with `delayDuration={200}`

## Changes

### Both components get:

1. `<Tooltip>` wrapping with descriptive Spanish text
2. `aria-label` on the button
3. `cursor-pointer` class
4. `<AlertDialog>` confirmation before action

### AlertSolvedButton

- Tooltip: "Oculta esta alerta de la lista"
- Dialog icon: `Check` in `bg-primary/10` container
- Dialog title: "Marcar como resuelta"
- Dialog description: "Esta alerta se ocultará de la lista. ¿Deseas continuar?"
- Confirm button: "Marcar como resuelta"

### RestorePasswordButton

- Tooltip: "Genera una nueva contraseña para el usuario"
- Dialog icon: `KeyRound` in `bg-primary/10` container
- Dialog title: "Restaurar contraseña"
- Dialog description: "Se generará una nueva contraseña para este usuario. ¿Deseas continuar?"
- Confirm button: "Restaurar"

## Files Modified

| File | Change |
|------|--------|
| `apps/frontend/src/features/alerts/components/shared/alert-solved-button.tsx` | Add Tooltip, aria-label, cursor-pointer, AlertDialog |
| `apps/frontend/src/features/users/components/restore-password-button.tsx` | Add Tooltip, aria-label, cursor-pointer, AlertDialog |

## What's NOT in scope

- Changes to parent components (data tables)
- Changes to mutation hooks
- New design tokens or theme variables
- Toast notifications (handled by mutation hooks already)
- Error handling changes (global error provider handles errors)
