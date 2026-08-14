refactor(alerts, users): extract action buttons into dedicated components

Extract AlertSolvedButton and RestorePasswordButton from their parent
data tables into standalone components colocated with their features.
Each component owns its mutation hook, loading state, and icon logic.
