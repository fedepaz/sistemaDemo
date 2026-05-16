# 🛠️ Maintenance & Operations (Lean Deployment Strategy)

This strategy focuses on **Building Locally** and **Deploying a "Runtime-Only" Artifact**. By excluding source code, development tools, and heavy build caches, we create a minimal, secure, and high-performance production environment.

---

## 🚀 The Deployment Lifecycle

### 1. Local Preparation

Before every deployment, generate the production builds on your development machine to ensure the artifacts are ready for synchronization.

```bash
# Build the entire monorepo
pnpm build
```

### 2. The "Lean Purge" (Server Cleanup)

To maintain a clean production environment, we remove "Development Garbage." This reduces the attack surface and minimizes disk usage.

**⚠️ WARNING:** Running these commands in your development folder will delete your source code. **Always perform this on the production server directory after build.**

#### Runtime Essentials (What to KEEP)

- **Root**: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`.
- **Backend**: `dist/`, `prisma/`, `package.json`.
- **Frontend**: `.next/` (excluding cache), `public/`, `package.json`, `next.config.ts`.
- **Shared**: `dist/`, `package.json`.

#### Cleanup Script

Run these commands in the deployment directory to strip the project down to its runtime essentials:

````bash
# 1. Remove Top-Level Development Folders
rm -rf docs/ design-system/ infra/ logs/ nginx/ .github/ .husky/ .turbo/ .vscode/ _trash_/

# 2. Remove Root Development Configurations
rm -f .dockerignore .env.example .gitignore COMMIT_CONVENTIONS.md commitlint.config.js docker-compose.dev.yml docker-compose.yml ecosystemLinux.config.js ecosystemWin.config.js GEMINI.md README.md turbo.json

# 3. Remove App-Specific Source Code
# Backend
rm -rf apps/backend/src apps/backend/test apps/backend/scripts
rm -f apps/backend/.env.example apps/backend/.prettierrc apps/backend/Dockerfile apps/backend/eslint.config.mjs apps/backend/nest-cli.json apps/backend/README.md apps/backend/tsconfig.*

# Frontend
rm -rf apps/frontend/src apps/frontend/test apps/frontend/.next/cache
rm -f apps/frontend/clerk.lock apps/frontend/components.json apps/frontend/Dockerfile apps/frontend/eslint.config.mjs apps/frontend/postcss.config.* apps/frontend/README.md apps/frontend/tsconfig.json apps/frontend/vitest.*

# Shared
rm -rf packages/shared/src
rm -f packages/shared/tsconfig.json

## 🔄 Git-Resilient Update Flow

The Lean Strategy leverages Git's internal behavior to allow seamless updates without maintaining local commits for the "purge" operations.

### How it Works
1. **Uncommitted Deletions**: When you delete source folders, Git tracks them as "deleted" in your working directory but does **not** record them in the history (since you don't commit them).
2. **Automatic Restoration**: When you run `git pull`, Git fetches new updates and merges them. Because your local branch has no commits reflecting the deletions, Git treats the missing files as "no local change" and **automatically restores them** to their latest state from the remote.
3. **Repeatable Cycle**: This allows you to pull, build, and re-purge in a continuous cycle without merge conflicts or branch switching.

### Operational Sequence

#### A. Initial Deployment
```bash
git pull origin main
pnpm install
pnpm build
# [Run Cleanup Script here]
pnpm install --prod
pnpm start
````

#### B. Continuous Updates

```bash
# 1. Restore and Update
git pull origin main  # ✅ Restores missing source files and applies updates
pnpm install          # Install new dependencies if any

# 2. Re-Build
pnpm build            # Re-generate production artifacts

# 3. Re-Purge
# [Run Cleanup Script here]
pnpm install --prod   # Strip devDependencies

# 4. Restart
pnpm start            # Deploy the updated "Lean" version
```

---

## 🧰 Management Checklist

- [ ] **Database Status**: Run `pnpm --filter backend db:status` to verify migration sync.
- [ ] **Health Check**: Confirm `http://localhost:3001/api/health` returns `200 OK`.
- [ ] **Node Version**: Ensure `node -v` matches the engine requirement (>=18).
- [ ] **Port Audit**: Verify ports 3000 (Web) and 3001 (API) are open in the server firewall.
