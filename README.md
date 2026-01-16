# AgriManage

[![Deploy](https://github.com/fedepaz/viveroApp/actions/workflows/deploy.yml/badge.svg)](https://github.com/fedepaz/viveroApp/actions/workflows/deploy.yml)
[![PR Checks](https://github.com/fedepaz/viveroApp/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/fedepaz/viveroApp/actions/workflows/pr-checks.yml)
[![Scheduled](https://github.com/fedepaz/viveroApp/actions/workflows/scheduled.yml/badge.svg)](https://github.com/fedepaz/viveroApp/actions/workflows/scheduled.yml)

Aplicación de gestión agrícola. Monorepo con Node.js + pnpm.

## Requisitos

- Node.js >= 16.0.0 - [descargar](https://nodejs.org/)
- pnpm - [instalar](https://pnpm.io/installation)

## Instalación inicial

### 1. Clonar el repositorio

```bash
# HTTPS
git clone https://github.com/fedepaz/viveroApp.git
cd viveroApp

# SSH
git clone git@github.com:fedepaz/viveroApp.git
cd viveroApp
```

### 2. Instalar pnpm (si no lo tienes)

**PowerShell (Windows):**

```powershell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

**Bash/Zsh (Linux/Mac):**

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

**Alternativa con npm:**

```bash
npm install -g pnpm
```

### 3. Instalar dependencias

```bash
pnpm install
```

### 4. Ejecutar en desarrollo

```bash
pnpm dev
```

La app estará disponible en `http://localhost:3000` (o el puerto indicado en consola).

---

## Actualizar el proyecto

### Opción 1: Con Git (recomendado)

Si clonaste el repo con git, para traer los últimos cambios:

```bash
# Guardar cambios locales (si los hay)
git stash

# Traer últimos cambios
git pull origin main

# Restaurar cambios locales
git stash pop

# Actualizar dependencias
pnpm install

# Iniciar
pnpm dev
```

**¿Qué hace cada comando?**

- `git stash` - Guarda temporalmente tus cambios sin hacer commit
- `git pull` - Descarga los cambios del repositorio remoto
- `git stash pop` - Restaura tus cambios guardados
- `pnpm install` - Actualiza las dependencias si cambiaron

### Opción 2: Sin Git (descarga manual)

Si bajaste el ZIP originalmente:

1. **Respaldar tus cambios**:

   - Copia las carpetas/archivos que modificaste a otro lugar

2. **Descargar el ZIP actualizado**:

   - Ve a https://github.com/fedepaz/viveroApp
   - Click en `Code` → `Download ZIP`
   - Extrae en una carpeta temporal

3. **Reemplazar archivos**:

   - Borra tu carpeta vieja del proyecto
   - Copia la nueva carpeta descargada
   - Restaura tus cambios personalizados (si los hay)

4. **Reinstalar dependencias**:
   ```bash
   cd viveroApp
   pnpm install
   pnpm dev
   ```

---

## CI/CD Workflows

El proyecto usa GitHub Actions para automatización. Estos workflows se ejecutan automáticamente:

### deploy.yml

Despliega la aplicación a producción cuando se hace push a la rama main. Compila el código, ejecuta tests y sube los archivos al servidor.

### pr-checks.yml

Se ejecuta cuando abres un Pull Request. Verifica que el código compile, pase los tests y cumpla con las reglas de estilo (linting) antes de permitir el merge.

### scheduled.yml

Tareas programadas que se ejecutan automáticamente (por ejemplo, limpieza de caché, backups, actualizaciones de dependencias). Se ejecuta en horarios predefinidos usando cron.

**Ver estado de los workflows:** [Actions tab](https://github.com/fedepaz/viveroApp/actions)

Los badges en la parte superior muestran si cada workflow está pasando (verde) o fallando (rojo).

---

## Scripts disponibles

```bash
pnpm dev          # Desarrollo con hot-reload
pnpm build        # Build para producción
pnpm test         # Ejecutar tests
pnpm lint         # Linter
pnpm format       # Formatear código
```

---

## Troubleshooting

### Error de permisos en Windows PowerShell

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Puerto ocupado

**Linux/Mac:**

```bash
lsof -ti:3000 | xargs kill -9
```

**Windows PowerShell:**

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Limpiar caché de pnpm

Si algo no funciona después de actualizar:

```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

**Windows (PowerShell):**

```powershell
pnpm store prune
Remove-Item -Recurse -Force node_modules
pnpm install
```

---

## Estructura del proyecto

```
viveroApp/
├── apps/           # Aplicaciones del monorepo
├── packages/       # Paquetes compartidos
├── .github/        # Configuración de GitHub Actions
│   └── workflows/  # Archivos de CI/CD
├── docs/           # Documentación
└── package.json    # Configuración principal
```

---

## Licencia

MIT

---

**¿Problemas?** [Abrir un issue](https://github.com/fedepaz/viveroApp/issues)
