feat(siembra): refactorizar consulta legacy para incluir datos de lote y semilla

- Agrega JOIN con partidas1/partidas2 para traer datos de lote (semxgr, c, g)
- Filtra partidas desde 2025: no sembradas o sembradas pero NO extendidas
- Actualiza SiembraDto y frontend para mostrar nuevos campos
- Simplifica vista eliminando tabs (Notas ya no aplica)
