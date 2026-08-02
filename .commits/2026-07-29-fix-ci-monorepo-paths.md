fix(ci): correct monorepo paths and package references

- Remove working-directory input from setup action (monorepo root is repo root)
- Fix cache-dependency-path to point to root pnpm-lock.yaml
- Add explicit working-directory for prisma generate in apps/backend
- Fix @repo/shared to @vivero/shared in ci-test.yml
- Remove unnecessary working-directory: app from ci-test steps
- Upgrade actions to v6 (checkout, setup-node, pnpm/action-setup)
