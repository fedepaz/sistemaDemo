feat(users): add user activation endpoint and UI

Add PATCH /activate/:userId backend endpoint with validation for
existing and already-active users. Frontend adds ActivateUserButton
with AlertDialog confirmation, mutation hook with toast feedback,
query invalidation for both user lists, and distinct success-green
styling. SlideOver conditionally shows activate or restore-password
button based on table context.
