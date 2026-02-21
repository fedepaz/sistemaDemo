# 📑 GEMINI.md

This document outlines the specialized agents that assist in the development of the vivero-client-alpha application. Each agent has a specific role and expertise.

**Rule:** Before making any changes to the codebase, you **must** first consult the relevant agent profile in the `docs/agents/` directory. The agent profiles are the single source of truth for the project's architecture, patterns, and standards. Do not deviate from the guidelines documented in the agent profiles.

---

### Rule: Workflow for Reviewing Code Changes

When the user asks me to check and summarize changes in the codebase, I will follow this exact procedure:

1.  **Inspect Commits**: Use `github.list_commits` and `github.get_commit` to retrieve the details of the recent changes.
2.  **Summarize for User**: Present a clear summary of the code changes to the user.
3.  **Internal Alignment Check**: Compare the code changes against the agent documentation in the `docs/agents/` directory to check for deviations or new patterns.
4.  **Propose All Documentation Updates**: Formulate a single, comprehensive proposal for all necessary documentation changes.
5.  **Request User Confirmation**: Present the complete proposal to the user before writing any files.

---

### Rule: Workflow for Conducting Research

1.  **Prioritize Specialized Documentation**: Use `get_library_docs` and `github search_code`.
2.  **Use General Web Search**: Only if specialized tools are insufficient.
3.  **Synthesize and Cite**: Provide a concise answer with sources.

---

### Rule: Workflow for Committing and Pushing New Work

1.  **Execute "Workflow for Reviewing Code Changes"**.
2.  **Execute "Workflow for Conducting Research"**.
3.  **Generate and Internally Validate Commit Message**: Must comply with `commitlint` rules.
4.  **Propose a Comprehensive Plan**.
5.  **Execute Commit and Push** after final approval.

---

## 🎯 Purpose

This file defines how AI agents must operate when generating, reviewing, or refactoring code and documentation for the **vivero-client-alpha Platform**.

---

## 📂 Core Reference Documents

Agents must **always read and apply** the following project guides:

1. `docs/agents/tech_stack_guide.md`
2. `docs/agents/tdd_cicd_guide.md`
3. `docs/agents/cicd_agent.md`
4. `docs/agents/devops_agent.md`
5. `docs/agents/product-agent.md`
6. `docs/agents/backend-agent.md`
7. `docs/agents/frontend-agent.md`
8. `docs/agents/shared-agent.md`
9. `docs/agents/ux-ui-agent.md`

---

## ⚖️ Rules of Engagement

- **Do not invent tech.** Only use tools defined in `tech_stack_guide.md`.
- **Default backend stack** = `NestJS + Prisma + MariaDB 10.9+`.
- **Default frontend stack** = `Next.js 14 App Router + Tailwind + shadcn/ui`.
- **Shared Contracts:** All data contracts must be synchronized via the `@plant-mgmt/shared` package.
- **Testing must follow TDD** as outlined in `tdd_cicd_guide.md`.

---

## 🛠️ Development Standards

- **Monorepo with pnpm workspaces**.
- **Build System**: Turborepo.
- **Local Quality Gates**: Husky + commitlint.
- **Commit Message Convention**: Conventional Commits.

---

## 🤖 Agent Roles

- **`ux-ui-designer`**: Designs the user experience and user interface. See `docs/agents/ux-ui-agent.md`.
- **`cicd-pipeline-engineer`**: Creates and manages the CI/CD pipelines. See `docs/agents/cicd_agent.md`.
- **`devops-engineer`**: Handles infrastructure and deployment. See `docs/agents/devops_agent.md`.
- **`backend-engineer`**: Implements the backend using NestJS and Prisma. See `docs/agents/backend-agent.md`.
- **`frontend-specialist`**: Implements the frontend using Next.js and Tailwind. See `docs/agents/frontend-agent.md`.
- **`product-manager`**: Defines product vision and features. See `docs/agents/product-agent.md`.
- **`qa-engineer`**: Ensures enterprise-grade quality. See `docs/agents/qa-agent.md`.
- **`shared-package-engineer`**: Maintains type-safe contracts in the shared package. See `docs/agents/shared-agent.md`.
- **`solo-developer-roadmap`**: Timeline for solo development. See `docs/agents/solo_developer_roadmap.md`.

---

## ✅ Success Criteria

- Generated code runs with the defined stack.
- Tests exist **before** feature code (TDD).
- Product features align with enterprise SaaS workflows.
- Interfaces provide a modern user experience with skeleton loading states.

---

🌱💻🚀 _This file is the AI agent’s constitution. Always follow it._
