fix(partidas): remove envelope logic and pass extendido/detalle raw

Remove curly brace envelope logic, reverting to raw passthrough of
extendido and detalle values to the database.

- Removed envelope wrapping for both fields
- Pass raw data values directly to DB queries
- Simplified code by removing intermediate variables

Fixes duplicate key rendering caused by duplicate depositos table rows
(data issue, resolved)