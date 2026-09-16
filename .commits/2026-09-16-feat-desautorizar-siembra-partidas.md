feat(siembraPartidas): add de-authorize toggle via isActive flag

- Add PATCH /siembra-partidas/:id/desautorizar endpoint
- Modify autorizarSiembra to support re-authorization of deactivated rows
- Add frontend API service, mutation hook, and conditional SlideOverForm
- Add tests for new endpoints and re-authorization behavior
