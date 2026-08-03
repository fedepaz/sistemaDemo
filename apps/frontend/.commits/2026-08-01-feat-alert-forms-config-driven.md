feat(alerts): refactor alert forms with config-driven layout and semantic tokens

- Single source of truth: alert-type-config.ts drives icons, colors, labels
- View form: pure content component, extendidos spec grid pattern
- Edit form: conversation-style with Form/formId integration
- Summary cards: import from ALERT_TYPE_CONFIGS (no duplicate config)
- Remove dead filter-tabs.tsx (no longer imported)
