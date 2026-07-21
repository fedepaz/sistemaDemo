ci: modernize CI/CD pipeline with composite action and reusable workflow

- Create composite action .github/actions/setup/action.yml for shared setup
- Create reusable workflow .github/workflows/ci-test.yml with 3 parallel jobs
- Rewrite PR checks .github/workflows/pr-checks.yml to call reusable workflow
- Rewrite deploy .github/workflows/deploy.yml as build-only verification
- Update scheduled .github/workflows/scheduled.yml pnpm version to 10.33.2
- Update docs/agents/cicd_agent.md to reflect new 5-file CI/CD architecture
- Update docs/agents/tdd_cicd_guide.md to reference new workflow structure