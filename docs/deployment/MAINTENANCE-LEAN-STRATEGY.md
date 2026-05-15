# 🛠️ Maintenance & Operations (Lean Deployment)

This strategy focuses on **Building Locally** and **Deploying a "Client-Clean" Artifact**. By excluding all source code, development tools, and heavy caches, we create a minimal, secure, and high-performance production environment.

## 🚀 The Deployment Workflow

### 1. Local Preparation
Before every deployment, generate the production builds on your local machine:
```bash
# Build the entire monorepo
pnpm build
```

### 2. The "Client-Clean" Purge
To prepare the folder for the server, you must remove the "Development Garbage." 

**⚠️ WARNING:** Running these commands in your development folder will delete your source code. **Always perform this on a copy of the project.**

#### What to KEEP (The Runtime Essentials)
- **Root**: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`.
- **Backend**: `dist/`, `prisma/`, `package.json`.
- **Frontend**: `.next/` (except cache), `public/`, `package.json`, `next.config.ts`.
- **Shared**: `dist/`, `package.json`.

#### Cleanup Command (Run on the deployment copy)
```bash
# 1. Remove Top-Level Dev Folders
rm -rf docs/ design-system/ infra/ logs/ nginx/ .github/ .husky/ .turbo/ .vscode/ _trash_/

# 2. Remove Root Dev Configs
rm -f .dockerignore .env.example .gitignore COMMIT_CONVENTIONS.md commitlint.config.js docker-compose.dev.yml docker-compose.yml ecosystemLinux.config.js ecosystemWin.config.js GEMINI.md README.md turbo.json

# 3. Remove App-Specific Dev Files
# Backend
rm -rf apps/backend/src apps/backend/test apps/backend/scripts
rm -f apps/backend/.env.example apps/backend/.prettierrc apps/backend/Dockerfile apps/backend/eslint.config.mjs apps/backend/nest-cli.json apps/backend/README.md apps/backend/tsconfig.*

# Frontend
rm -rf apps/frontend/src apps/frontend/test apps/frontend/.next/cache
rm -f apps/frontend/clerk.lock apps/frontend/components.json apps/frontend/Dockerfile apps/frontend/eslint.config.mjs apps/frontend/postcss.config.* apps/frontend/README.md apps/frontend/tsconfig.json apps/frontend/vitest.*

# Shared
rm -rf packages/shared/src
rm -f packages/shared/tsconfig.json
```

### 3. Server Setup
Once the clean files are on the server:

1.  **Environment**: Ensure production `.env` files are in `apps/backend/` and `apps/frontend/`.
2.  **Install Production Dependencies**:
    ```bash
    # This removes all devDependencies (TypeScript, Linters, etc.)
    pnpm install --prod
    ```
3.  **Run Migrations**:
    ```bash
    # Apply pending database changes
    pnpm --filter backend db:migrate
    ```
4.  **Start the System**:
    ```bash
    # Starts Frontend and Backend concurrently
    pnpm start
    ```

---

## 🧰 Management Checklist

- [ ] **Database Status**: Run `pnpm --filter backend db:status` to verify migration sync.
- [ ] **Health Check**: Confirm `http://localhost:3001/api/health` returns 200 OK.
- [ ] **Node Version**: Ensure `node -v` matches the engine requirement (>=18).
- [ ] **Port Audit**: Verify ports 3000 (Web) and 3001 (API) are open in the server firewall.
