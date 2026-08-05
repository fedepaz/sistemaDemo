fix(alerts): align DTOs with SQL queries, remove contenedor field

- Remove espvar/contenedor from interfaces, map SQL `planta` alias to codigoEspecie
- Remove contenedor from all 4 shared DTO schemas
- Update service mappers to use row.planta instead of row.espvar
- Condense SQL queries, remove contenedor from frontend columns/exports
- Update all test mocks to match new DTOs
