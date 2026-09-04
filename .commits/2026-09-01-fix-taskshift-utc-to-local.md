fix(taskshift): convert UTC timestamps to local time for display

- Add utcToLocalTime() utility to date-utils.ts
- Update taskShift.tsx to use utcToLocalTime() instead of manual string splitting
- Backend stores UTC, frontend now correctly displays local time
