# Guía de Convenciones para Commits

Este proyecto utiliza **Conventional Commits** para mantener un historial de Git limpio, legible y automatizable. Seguir estas reglas es fundamental.

---

### Estructura del Mensaje de Commit

Un mensaje de commit se estructura de la siguiente manera:

```
<tipo>(<ámbito>): <asunto>

[cuerpo opcional]

[pie de página opcional]
```

---

### 1. El Encabezado (Obligatorio)

La primera línea del commit es el encabezado y es la parte más importante.

**`<tipo>` (Requerido)**
Define la categoría del cambio. Los tipos estándar son:

*   **feat**: Una nueva funcionalidad para el usuario.
*   **fix**: Una corrección de un bug.
*   **docs**: Cambios exclusivos en la documentación.
*   **style**: Cambios de estilo que no afectan la lógica (formateo, espacios, etc.).
*   **refactor**: Un cambio en el código que no corrige un bug ni añade una funcionalidad.
*   **perf**: Un cambio en el código que mejora el rendimiento.
*   **test**: Añadir o corregir tests.
*   **build**: Cambios que afectan al sistema de build o a dependencias externas (ej: pnpm, Webpack).
*   **ci**: Cambios en los archivos y scripts de configuración de CI (ej: GitHub Actions).
*   **chore**: Otros cambios que no modifican el código fuente o los tests (ej: actualizar `.gitignore`).
*   **revert**: Revierte un commit anterior.

**`<ámbito>` (Opcional)**
Un sustantivo entre paréntesis que describe la parte del código afectada.
*   *Ejemplos:* `(api)`, `(auth)`, `(ui)`, `(db)`, `(deps)`

**`<asunto>` (Requerido)**
Una descripción corta, en imperativo y minúsculas, del cambio realizado.
*   **Correcto:** `agregar página de login`
*   **Incorrecto:** `Agregada la página de login`

---

### 2. El Cuerpo (Opcional)

*   Se utiliza para explicaciones más largas.
*   Debe estar separado del encabezado por una línea en blanco.
*   Úsalo para explicar el "porqué" de tu cambio, no solo el "qué".

---

### 3. El Pie de Página (Opcional)

*   También separado del cuerpo por una línea en blanco.
*   Se usa principalmente para dos cosas:
    *   **Referenciar issues:** `Fixes #123`, `Closes #456`.
    *   **Indicar "BREAKING CHANGES" (cambios que rompen la compatibilidad).**

---

### BREAKING CHANGES

Si tu commit introduce un cambio que rompe la compatibilidad con versiones anteriores, **debes** indicarlo de una de estas dos formas:

1.  Añade un `!` después del tipo: `feat!:` o `refactor!:`
2.  Añade una sección `BREAKING CHANGE:` en el pie de página, explicando qué ha cambiado y qué deben hacer los usuarios.

---

### Ejemplos

**Commit simple:**
Para un cambio pequeño, puedes usar el flag `-m`:
```sh
git commit -m "fix: corregir error ortográfico en el botón de login"
```

**Commit con ámbito:**
También puedes usar `-m` y añadir un ámbito para dar más contexto:
```sh
git commit -m "feat(auth): implementar flujo de reseteo de contraseña"
```

**Commit con cuerpo:**
Para añadir un cuerpo, ejecuta `git commit` y escribe lo siguiente en el editor:
```
perf(db): añadir índice a la tabla de usuarios

La consulta de búsqueda de usuarios se estaba volviendo lenta. Añadir un índice en la columna de email acelera significativamente las peticiones de autenticación.
```

**Commit con un breaking change:**
Este también requiere el editor. Ejecuta `git commit` y escribe:
```
feat!(api): eliminar los endpoints v1 de usuarios

BREAKING CHANGE: El endpoint `/api/v1/users` ha sido eliminado. Todos los clientes deben migrar al endpoint `/api/v2/users`.
```

---

### Cómo Escribir un Commit Multi-línea (con Cuerpo y Pie de Página)

Para escribir un mensaje de commit que incluya un cuerpo o un pie de página, no puedes usar la opción `-m`. En su lugar, sigue estos pasos:

1.  Añade tus archivos al staging como de costumbre:
    ```sh
    git add .
    ```

2.  Ejecuta el comando `git commit` sin ningún otro argumento:
    ```sh
    git commit
    ```

3.  Este comando abrirá tu editor de texto por defecto (como Vim, Nano o VS Code).

4.  En el editor, escribe tu mensaje de commit siguiendo la estructura de encabezado, cuerpo y pie de página, **asegurándote de dejar una línea en blanco entre cada sección**.

    **Plantilla en el editor:**
    ```
    <tipo>(<ámbito>): <asunto>
    <-- Línea en blanco -->
    [cuerpo opcional: explicación detallada del cambio]
    <-- Línea en blanco -->
    [pie de página opcional: BREAKING CHANGE o Closes #123]
    ```

    **Ejemplo práctico en el editor:**
    ```
    feat!(api): eliminar los endpoints v1 de usuarios

    Los endpoints de la v1 han sido marcados como obsoletos durante 6 meses y ahora se eliminan para reducir la complejidad del código y los costos de mantenimiento.

    BREAKING CHANGE: El endpoint `/api/v1/users` ha sido eliminado. Todos los clientes deben migrar al endpoint `/api/v2/users`.
    Closes: #78
    ```

5.  Guarda el archivo y cierra el editor. Git tomará el texto que escribiste como el mensaje de commit.

---

### Otros Comandos de Git Útiles

Aquí tienes una lista de comandos útiles para el flujo de trabajo diario de staging y commits:

*   `git status`
    *   Muestra el estado de tus archivos (modificados, en staging, sin seguimiento).

*   `git add <archivo>`
    *   Añade un archivo específico al área de staging, preparándolo para el commit.

*   `git add .`
    *   Añade todos los archivos modificados y nuevos al área de staging.

*   `git diff`
    *   Muestra los cambios en tus archivos que aún no has añadido al staging.

*   `git diff --staged`
    *   Muestra los cambios que ya están en staging. Es una revisión final de lo que se incluirá en tu commit.

*   `git reset <archivo>`
    *   Quita un archivo del área de staging, pero mantiene los cambios en tu directorio de trabajo.

*   `git checkout -- <archivo>`
    *   **¡Cuidado!** Descarta permanentemente todos los cambios en un archivo, devolviéndolo a como estaba en el último commit.

*   `git commit --amend`
    *   Permite modificar el último commit. Puedes cambiar el mensaje o añadir/quitar archivos que olvidaste.
