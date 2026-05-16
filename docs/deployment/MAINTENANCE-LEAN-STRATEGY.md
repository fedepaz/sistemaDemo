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
# Root level
rm -rf design-system/ docs/ nginx/ .github/ .husky/ .turbo/ .vscode/ .gemini/ .commits/ _trash_/
rm -f .dockerignore .env.example .gitignore commitlint.config.js COMMIT_CONVENTIONS.md
rm -f docker-compose.yml docker-compose.dev.yml GEMINI.md README.md turbo.json
rm -f ecosystemWin.config.js   # if Linux server only

# Backend
rm -rf apps/backend/src/ apps/backend/test/ apps/backend/scripts/
rm -rf apps/backend/.turbo/ apps/backend/node/
rm -f apps/backend/Dockerfile apps/backend/.env.example apps/backend/.prettierrc
rm -f apps/backend/eslint.config.mjs apps/backend/nest-cli.json apps/backend/README.md
rm -f apps/backend/tsconfig.json apps/backend/tsconfig.build.json apps/backend/tsconfig.seed.json
rm -f apps/backend/prisma/seed-admin.ts apps/backend/prisma/seed-users.ts  # if not seeding on deploy

# Frontend
rm -rf apps/frontend/src/ apps/frontend/.turbo/ apps/frontend/node/
rm -rf apps/frontend/.next/cache
rm -f apps/frontend/Dockerfile apps/frontend/.env.example apps/frontend/README.md
rm -f apps/frontend/eslint.config.mjs apps/frontend/tsconfig.json
rm -f apps/frontend/postcss.config.mjs apps/frontend/postcss.config.test.mjs
rm -f apps/frontend/components.json apps/frontend/clerk.lock
rm -f apps/frontend/vitest.config.mts apps/frontend/vitest.setup.ts

# Shared
rm -rf packages/shared/src/ packages/shared/.turbo/ packages/shared/node/
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

---

# Root

.env
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
ecosystemLinux.config.js # PM2 config, needed for pnpm start
ecosystemWin.config.js # if deploying on Windows server

# Backend

apps/backend/.env
apps/backend/.env.production
apps/backend/package.json
apps/backend/dist/
apps/backend/prisma/schema.prisma
apps/backend/prisma/schema/
apps/backend/prisma/migrations/
apps/backend/prisma.config.ts
apps/backend/prisma/seed-admin.ts # only if you run seeds on deploy
apps/backend/prisma/seed-users.ts # same ^

# Frontend

apps/frontend/.env
apps/frontend/.env.production
apps/frontend/package.json
apps/frontend/next.config.ts
apps/frontend/next-env.d.ts
apps/frontend/.next/ # excluding .next/cache
apps/frontend/public/

# Shared

packages/shared/package.json
packages/shared/dist/
