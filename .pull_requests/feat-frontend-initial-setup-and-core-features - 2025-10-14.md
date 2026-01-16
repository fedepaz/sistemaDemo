Title: feat(frontend): Initial Frontend Setup and Core Features

Description:
This pull request introduces the foundational setup and core features for the frontend application, preparing it for further development and ensuring adherence to project standards.

Key areas covered in this feature branch include:

1. Core Frontend Architecture & Setup:
- Initial restructuring and setup of the frontend application.
- Alignment of feature and component structures with the project's feature-centric architecture.
- Integration of Clerk for authentication and theme management.

2. Internationalization (i18n) Implementation:
- Comprehensive implementation of `next-intl` for multi-language support.
- Component-scoped translations and dynamic message loading.
- Custom 404 page and resolution of missing translation issues.

3. Dashboard & Data Table Components:
- Development of a new dashboard, including KPI cards, feature navigation, alerts, and recent activity.
- Implementation of reusable data table components with features like editing, deleting, and adding entries.
- Adoption of a skeleton loading pattern for data tables and dashboard elements to enhance perceived performance.

4. Frontend Testing Environment Setup:
- Integration of Vitest for unit and component testing.
- Configuration of `vitest.config.mts` for Next.js, React, and `next-intl` compatibility.
- Global `next-intl` mock in `vitest.setup.ts` to streamline testing.
- Implementation of a test-specific PostCSS configuration in `postcss.config.test.mjs` to resolve conflicts with Next.js's PostCSS processing.
- Addition of a component test for `RootDashboard` (`RootDashboard.test.tsx`) to verify the setup.
- Modification of `kpi-card-skeleton.tsx` to include a `data-testid` for testability.

5. CI/CD & Tooling Enhancements:
- Integration of Husky and Commitlint for pre-commit checks.
- Updates to GitHub Actions workflows and agent documentation (`GEMINI.md`, `frontend-agent-guide.md`) to reflect new standards and processes.

This comprehensive set of changes establishes a solid foundation for the frontend, enabling efficient development, robust testing, and consistent code quality.