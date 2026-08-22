feat(alerts, users): add tooltip, accessibility, and confirmation dialogs to action buttons

Improve UX on AlertSolvedButton and RestorePasswordButton with:
- Tooltip wrapping with descriptive Spanish text
- aria-label on buttons for screen readers
- cursor-pointer on interactive elements
- AlertDialog confirmation before destructive/important actions
- Non-destructive dialog styling (bg-primary/10 icon container)
- min-h-[48px] touch targets on dialog buttons
