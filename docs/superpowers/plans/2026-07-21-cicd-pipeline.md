# CI/CD Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix and extend sistemaDemo's CI/CD infrastructure based on appFinance patterns — composite action, reusable workflow, and cleaned-up PR/deploy/scheduled workflows.

**Architecture:** Create a composite action for shared setup (pnpm + Node + deps + Prisma), a reusable workflow with 3 jobs (lint, unit-tests, integration-tests), then rewrite PR checks and deploy to use these building blocks. Update scheduled workflow's pnpm version.

**Tech Stack:** GitHub Actions, YAML, pnpm 10.33.2, Node 20, Prisma

## Global Constraints

- pnpm version: 10.33.2 (not 8.15.0)
- Node version: 20
- Integration tests mock at service layer — no PostgreSQL container needed
- Branch structure: `main` ← `dev` ← feature branches (ephemeral)
- No commit until user explicitly approves

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `.github/actions/setup/action.yml` | CREATE | Shared setup: pnpm + Node + deps + Prisma |
| `.github/workflows/ci-test.yml` | CREATE | Reusable workflow: lint + unit + integration tests |
| `.github/workflows/pr-checks.yml` | REWRITE | PR gate: calls ci-test.yml on PRs to main/dev |
| `.github/workflows/deploy.yml` | REWRITE | Build verification: frontend + backend builds |
| `.github/workflows/scheduled.yml` | UPDATE | pnpm version bump only |

---

### Task 1: Create Composite Action

**Files:**
- Create: `.github/actions/setup/action.yml`

**Interfaces:**
- Consumes: None (standalone)
- Produces: Reusable setup step for all workflows

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p .github/actions/setup
```

- [ ] **Step 2: Write composite action**

```yaml
# .github/actions/setup/action.yml
name: Setup
description: Setup pnpm + Node + deps + Prisma

inputs:
  node-version:
    description: Node.js version
    default: '20'
  pnpm-version:
    description: pnpm version
    default: '10.33.2'

runs:
  using: composite
  steps:
    - uses: pnpm/action-setup@v4
      with:
        version: ${{ inputs.pnpm-version }}

    - uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'pnpm'

    - run: pnpm install --frozen-lockfile
      shell: bash

    - run: npx prisma generate
      shell: bash
```

- [ ] **Step 3: Validate YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/actions/setup/action.yml'))"
```

Expected: No output (valid YAML)

- [ ] **Step 4: Commit**

```bash
git add .github/actions/setup/action.yml
git commit -m "ci: add composite action for pnpm + Node + deps + Prisma"
```

---

### Task 2: Create Reusable Workflow

**Files:**
- Create: `.github/workflows/ci-test.yml`

**Interfaces:**
- Consumes: Composite action from Task 1
- Produces: Reusable workflow called by PR checks and deploy

- [ ] **Step 1: Write reusable workflow**

```yaml
# .github/workflows/ci-test.yml
name: CI Tests

on:
  workflow_call:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: pnpm lint

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: pnpm test

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: pnpm --filter backend test:integration
```

- [ ] **Step 2: Validate YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci-test.yml'))"
```

Expected: No output (valid YAML)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci-test.yml
git commit -m "ci: add reusable workflow for lint, unit tests, and integration tests"
```

---

### Task 3: Rewrite PR Checks

**Files:**
- Rewrite: `.github/workflows/pr-checks.yml`

**Interfaces:**
- Consumes: Reusable workflow from Task 2
- Produces: PR gate that runs on PRs to main/dev

- [ ] **Step 1: Read existing file (already read in brainstorming)**

- [ ] **Step 2: Rewrite PR checks**

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    branches:
      - main
      - dev

jobs:
  ci:
    uses: ./.github/workflows/ci-test.yml
```

- [ ] **Step 3: Validate YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/pr-checks.yml'))"
```

Expected: No output (valid YAML)

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/pr-checks.yml
git commit -m "ci: rewrite PR checks to use reusable workflow"
```

---

### Task 4: Rewrite Deploy Workflow

**Files:**
- Rewrite: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: Composite action from Task 1
- Produces: Build verification on push to main/dev

- [ ] **Step 1: Read existing file (already read in brainstorming)**

- [ ] **Step 2: Rewrite deploy workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy (Build Verification)

on:
  push:
    branches:
      - main
      - dev

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: pnpm --filter frontend build

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: pnpm --filter backend build
```

- [ ] **Step 3: Validate YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))"
```

Expected: No output (valid YAML)

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: rewrite deploy workflow as build-only verification"
```

---

### Task 5: Update Scheduled Workflow

**Files:**
- Update: `.github/workflows/scheduled.yml`

**Interfaces:**
- Consumes: None
- Produces: Updated pnpm version in scheduled workflow

- [ ] **Step 1: Read existing file (already read in brainstorming)**

- [ ] **Step 2: Update pnpm version**

Change line 19 from:
```yaml
          version: 8.15.0
```
to:
```yaml
          version: 10.33.2
```

- [ ] **Step 3: Validate YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/scheduled.yml'))"
```

Expected: No output (valid YAML)

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/scheduled.yml
git commit -m "ci: update scheduled workflow pnpm version to 10.33.2"
```

---

### Task 6: Final Verification

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: All tasks above
- Produces: Confirmation that pipeline is correct

- [ ] **Step 1: Verify all files exist**

```bash
ls -la .github/actions/setup/action.yml
ls -la .github/workflows/ci-test.yml
ls -la .github/workflows/pr-checks.yml
ls -la .github/workflows/deploy.yml
ls -la .github/workflows/scheduled.yml
```

Expected: All 5 files exist

- [ ] **Step 2: Verify YAML syntax for all files**

```bash
for f in .github/actions/setup/action.yml .github/workflows/ci-test.yml .github/workflows/pr-checks.yml .github/workflows/deploy.yml .github/workflows/scheduled.yml; do
  python3 -c "import yaml; yaml.safe_load(open('$f'))" && echo "✅ $f" || echo "❌ $f"
done
```

Expected: All 5 files show ✅

- [ ] **Step 3: Verify no placeholder content**

```bash
grep -r "TBD\|TODO\|FIXME\|placeholder" .github/
```

Expected: No output (no placeholders)

- [ ] **Step 4: Final commit (if needed)**

```bash
git status
```

Review any uncommitted changes and commit if needed.
