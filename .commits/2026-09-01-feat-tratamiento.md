feat(tratamiento): add tratamiento search with backend API

- Add LegacyTratamientoModule (controller, service, repository)
- Add TratamientoDto schema (codigo: string, nombre, precio)
- Change tratamientoSemilla from boolean to string (CHAR(1)) in schema and Prisma
- Add TratamientoSearch component (search by code/name, single-select)
- Add useTratamientos hook and fetchTratamientos service method
- Add tratamientos query key
- Fix filter bug and type mismatches in search component
- Update all test data from boolean to string
