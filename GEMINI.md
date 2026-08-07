# 📑 GEMINI.md

This document outlines the specialized agents that assist in the development of the AgriManage (vivero-client-alpha) application. Each agent has a specific role and expertise.

**Rule:** All communication with the user must be in **English** (unless the user writes in another language).

**Rule:** Before making any changes to the codebase, you **must** first consult the relevant agent profile in the `docs/agents/` directory. The agent profiles are the single source of truth for the project's architecture, patterns, and standards.

---

### Rule: Workflow for Reviewing Code Changes

1.  **Inspect Commits**: Use `git status && git diff HEAD` to retrieve the details of the recent changes.
2.  **Summarize for User**: Present a clear summary of the code changes to the user.
3.  **Internal Alignment Check**: Compare the code changes against the agent documentation in the `docs/agents/` directory to check for deviations or new patterns.
4.  **Propose All Documentation Updates**: Formulate a single, comprehensive proposal for all necessary documentation changes.
5.  **Request User Confirmation**: Present the complete proposal to the user before writing any files.

---

### Rule: Workflow for Conducting Research

1.  **Prioritize Specialized Documentation**: Use library docs and `github search_code` where available.
2.  **Use General Web Search**: Only if specialized tools are insufficient.
3.  **Synthesize and Cite**: Provide a concise answer with sources.

---

### Rule: Workflow for Committing and Pushing New Work

1.  **Execute "Workflow for Reviewing Code Changes"**.
2.  **Execute "Workflow for Conducting Research"**.
3.  **Generate and Internally Validate Commit Message**: Must comply with `commitlint` rules (Conventional Commits).
4.  **Propose a Comprehensive Plan**.
5.  **Execute Commit and Push** after final approval.

---

### Rule: Workflow for UX/UI Feature Review

1.  **Activate Specialized Skill**: Use `ui-ux-pro-max` (or the `ux-review` skill).
2.  **Analyze Against Guidelines**: Evaluate the feature's components against `docs/agents/ux-ui-agent.md` and the design system in `design-system/vivero-client-alpha/MASTER.md`.
3.  **Check Core Areas**:
    - **Color Tokens**: Verify use of OKLCH variables from `globals.css` (no hardcoded hex/colors).
    - **Responsiveness**: Ensure mobile-first and adaptive layouts.
    - **Skeleton Strategy**: Verify Level 1 (`loading.tsx`) and Level 2 (`Suspense`) implementations.
    - **Component Patterns**: Check for `SlideOverForm`, `DataTable`, etc.
4.  **Propose Improvements**: Suggest specific code changes to align with standards.
5.  **Seek Approval**: Present the analysis and documentation updates to the user.

---

## 🎯 Purpose

This file defines how AI agents must operate when generating, reviewing, or refactoring code and documentation for the **AgriManage (vivero-client-alpha) Platform**.

---

## 📂 Core Reference Documents

Agents must **always read and apply** the following project guides:

1. `docs/agents/tech_stack_guide.md` — the actual technology stack (source of truth)
2. `docs/agents/tdd_cicd_guide.md`
3. `docs/agents/cicd_agent.md`
4. `docs/agents/devops_agent.md`
5. `docs/agents/product-agent.md`
6. `docs/agents/backend-agent.md`
7. `docs/agents/frontend-agent.md`
8. `docs/agents/shared-agent.md`
9. `docs/agents/ux-ui-agent.md`
10. `docs/agents/qa-agent.md`
11. `docs/agents/solo_developer_roadmap.md`
12. `docs/agents/skills-guide.md`

---

## ⚖️ Rules of Engagement

- **Do not invent tech.** Only use tools defined in `tech_stack_guide.md`. Nothing in the docs may reference software that is not installed in the repo.
- **Default backend stack** = `NestJS 11 + Prisma + MariaDB` (plus legacy MySQL via raw queries).
- **Default frontend stack** = `Next.js 16 App Router + Tailwind v4 + shadcn/ui`.
- **Shared Contracts:** All data contracts must be synchronized via the `@vivero/shared` package (Zod schemas).
- **Testing must follow TDD** as outlined in `tdd_cicd_guide.md` (Jest + supertest; **no** Vitest/Playwright).

---

## 🛠️ Development Standards

- **Monorepo with pnpm workspaces** + Turborepo.
- **Local Quality Gates**: Husky + commitlint.
- **Commit Message Convention**: Conventional Commits (`COMMIT_CONVENTIONS.md`).
- **Verification before committing**: `pnpm lint && pnpm type-check && pnpm test`.

---

## 🤖 Agent Roles

- **`ux-ui-designer`**: Designs the user experience and user interface. See `docs/agents/ux-ui-agent.md`.
- **`cicd-pipeline-engineer`**: Creates and manages the CI/CD workflows. See `docs/agents/cicd_agent.md`.
- **`devops-engineer`**: Handles infrastructure and deployment. See `docs/agents/devops_agent.md`.
- **`backend-engineer`**: Implements the backend using NestJS and Prisma. See `docs/agents/backend-agent.md`.
- **`frontend-specialist`**: Implements the frontend using Next.js and Tailwind. See `docs/agents/frontend-agent.md`.
- **`product-manager`**: Defines product vision and features. See `docs/agents/product-agent.md`.
- **`qa-engineer`**: Ensures quality. See `docs/agents/qa-agent.md`.
- **`shared-package-engineer`**: Maintains type-safe contracts in the shared package. See `docs/agents/shared-agent.md`.
- **`solo-developer-roadmap`**: Development roadmap. See `docs/agents/solo_developer_roadmap.md`.

---

## ✅ Success Criteria

- Generated code runs with the defined stack.
- Tests exist **before** feature code (TDD).
- Features align with the actual product workflows (users, alerts, partidas, siembra, extendidos, permissions, audit).
- Interfaces provide a modern user experience with skeleton loading states and Spanish-only UI.

---

## 🧩 Skills System

This project uses a modular skills system to extend agent capabilities. Skills are installed in the `.agents/skills/` directory and tracked via `skills-lock.json`. See `docs/agents/skills-guide.md` for details.

- **Frontend**: `frontend-design`, `shadcn`, `tailwind-css-patterns`, `next-best-practices`, `vercel-react-best-practices`
- **Backend**: `nestjs-best-practices`, `nodejs-backend-patterns`, `prisma-client-api`, `prisma-cli`
- **Quality**: `accessibility`, `seo`, `zod`, `vitest`
- **DevOps**: `bash-defensive-patterns`, `turborepo`
- **TypeScript**: `typescript-advanced-types`
- **Workflow**: `commit-workflow`, `review-code-changes`, `conduct-research`

---

🌱🚀 _This file is the AI agent's constitution. Always follow it._
