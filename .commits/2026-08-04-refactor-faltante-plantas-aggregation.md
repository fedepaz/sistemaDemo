refactor(alerts): simplify faltante plantas to aggregated per-partida view

Replace per-index rows with GROUP BY aggregation. Each row now represents
one partida with siembra count, produced quantity, and difference from
requested amount. Removes sub-row nesting.
