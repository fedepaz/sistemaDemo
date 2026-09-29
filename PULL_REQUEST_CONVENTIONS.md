# Guía de Convenciones para Pull Requests

Este proyecto aplica **Conventional Commits** también a los títulos de los Pull Requests, para que el historial de GitHub sea legible y automatizable. La guía de commits (tipos, ámbitos, asunto) está en [`COMMIT_CONVENTIONS.md`](./COMMIT_CONVENTIONS.md) y aplica aquí sin cambios.

---

### Estructura del Título (Obligatorio)

```
<tipo>(<ámbito>): <asunto>
```

- **Mismos tipos** que Conventional Commits: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **`release`**: tipo exclusivo para PRs de release (fusión `dev` → `main`).
- **`<ámbito>`** (opcional): parte del código afectada, ej. `(siembra)`, `(ui)`, `(api)`.
- **`<asunto>`** (obligatorio): corto, en imperativo, minúsculas.
- **Máximo 100 caracteres.**
- El título se valida en CI con commitlint (job `PR Title Check`). Si falla, corrígelo editando el título del PR.

---

### El Cuerpo (Estructura)

El cuerpo usa la plantilla `.github/PULL_REQUEST_TEMPLATE.md`, que GitHub inserta automáticamente al crear el PR:

- **Summary** (obligatorio): 1-3 frases con el qué y el porqué.
- **Features**: lista con viñetas de funcionalidad nueva.
- **Fixes**: lista con viñetas de bugs corregidos.
- **Testing & Security**: tests añadidos/actualizados, auditorías, vulnerabilidades.
- **Deployment notes**: migraciones, variables de entorno o pasos manuales para producción.

Las secciones son opcionales: elimina las que no apliquen (deja `Summary` siempre).

---

### Flujo por Tipo de PR

| Tipo de PR | Rama origen → destino | Tipo de título |
|---|---|---|
| Feature | `feat/*` → `dev` | `feat(ámbito): ...` |
| Hotfix / fix | `fix/*` → `dev` | `fix(ámbito): ...` |
| Release | `dev` → `main` | `release: ...` |

- `main` y `dev` **solo reciben código vía Pull Requests** (el hook `pre-commit` lo bloquea directamente).
- El cuerpo del PR de release (`dev` → `main`) resume lo acumulado: agrupa por Features / Fixes / Testing y cuenta los commits y PRs fusionados (`git log main..dev --oneline`, `gh pr list --state merged --base dev`).

---

### Ejemplos

**PR de feature:**

```
feat(siembra): add week filter to data table toolbar
```

**PR de hotfix:**

```
fix(ui): prevent SelectContent clipping in forms
```

**PR de release (dev → main):**

```
release: dev → main — siembra overhaul, stock traceability, UI density, test coverage
```

Cuerpo de ejemplo para release:

```markdown
## Summary
Merges 5 weeks of development from `dev` into `main` (PRs #118–#137, 217 commits).

### Features
- **Programación Siembra refactor**: ... bullets ...

### Fixes
- Select dropdown clipping (`SelectContent` max-height)

### Testing & Security
- Backend integration tests for 7 modules ...

### Deployment notes
- Run `pnpm --filter backend db:migrate` before/with deploy
```

---

### Automatización

- **CI**: `.github/workflows/pr-title.yml` valida el título con commitlint en `opened`, `edited` y `reopened` contra `dev` y `main`.
- **Skill**: cuando se pide un PR en este repo, usar la skill `pull-request-workflow`, que redacta título y cuerpo siguiendo esta guía y espera tu aprobación antes de crear el PR con `gh pr create`.
