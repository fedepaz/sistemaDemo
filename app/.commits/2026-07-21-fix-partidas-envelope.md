fix(partidas): replace [webApp] tag with curly brace envelope for extendido differentiation

Replace static [webApp] tag with dynamic curly brace envelope in partidas.repository.ts.
New messages are wrapped as {message}, empty messages as {}.
Applies to both detalle and extendido fields.

Co-authored-by: opencode <opencode@opencode.ai>
