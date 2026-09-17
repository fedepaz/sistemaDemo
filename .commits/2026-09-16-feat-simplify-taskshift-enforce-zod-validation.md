feat(siembra): simplify TaskShift flow, enforce required fields via Zod

- Simplify TaskShift to 2-button flow (Iniciar → Finalizar) with
  editable hour/minute selects after Finalizar, remove Reiniciar
- Make prensadoSustrato required in schema (force explicit selection),
  form initializes with undefined so Select shows placeholder
- Make sustrato, startTime, endTime required in CreateSiembraPartidaSchema
- Add sustrato field label and summary field to confirmation dialog
- Replace especie with rubro in programacionSiembra data table columns
- Show Check/X icons for boolean summary values in SlideOverForm
- Pass sustrato/startTime/endTime through in backend partidas service
