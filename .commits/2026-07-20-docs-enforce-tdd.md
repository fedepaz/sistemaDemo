docs: enforce TDD and update agent docs to match current stack

- add unit test gate to pre-commit hook (pnpm test after lint)
- update qa-agent.md: Vitest→Jest 30, Next.js 14→16, @plant-mgmt→@vivero
- update tdd_cicd_guide.md: coverage thresholds to match actual config
- update AGENTS.md: Next.js 15→16
