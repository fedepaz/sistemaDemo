feat(legacy-sustrato): add sustrato search from articulo table

Add legacy sustrato module querying articulo WHERE rubro=10.02,
with backend endpoints and frontend SustratoSearch component
mirroring the existing TratamientoSearch pattern. Add sustrato
field to SiembraPartida schema for form integration.
