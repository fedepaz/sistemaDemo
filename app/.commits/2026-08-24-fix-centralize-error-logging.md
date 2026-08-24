fix(backend): centralize error logging in global exception filter and remove dead loggers

The global exception filter only logged 401/403/500 errors, leaving 400/404/409/422
untracked. When clients reported errors, there was no server-side log to find.

- Add CLIENT ERROR logging for all 4xx responses in security-exception.filter.ts
- Remove unused Logger declarations from 6 services (entities, permissions,
  alertComments, alertSolved, siembraPartidas, mezcla) — these declared
  loggers but never called this.logger.*, making them dead code
