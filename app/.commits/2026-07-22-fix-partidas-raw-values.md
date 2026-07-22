# Commit: fix(partidas): remove envelope logic and pass extendido/detalle raw

## Description
Remove curly brace envelope logic from partidas.repository.ts, reverting to raw passthrough of extendido and detalle values to the database.

## Changes
- Removed envelope wrapping (`{message}`) for both extendido and detalle fields
- Pass raw `data.detalle` and `data.extendido` directly to DB queries
- Simplified code by removing intermediate variables

## Testing
- Verified insert and update queries receive raw values
- No envelope/tag artifacts in stored data

## Related Issues
- Fixes duplicate key rendering caused by duplicate depositos table rows (data issue, resolved)
- Simplifies differentiation flow for partidas