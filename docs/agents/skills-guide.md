# Skills Guide

This document describes the skills system used to extend agent capabilities in the project.

## Overview

Skills are modular capabilities that can be activated to provide specialized functionality for various development tasks. They are stored in the `.agents/skills/` directory and tracked via `skills-lock.json`.

## Directory Structure

```
.agents/
└── skills/
    ├── frontend-design/
    ├── shadcn/
    ├── nestjs-best-practices/
    ├── prisma-client-api/
    └── ... (other skills)
```

## Skills Registry

The `skills-lock.json` file tracks all installed skills with:
- **Source**: The registry or repository where the skill was installed from
- **Source Type**: The type of source (e.g., `autoskills-registry`)
- **Computed Hash**: A hash of the skill content for integrity verification

## Available Skills

### Frontend Development
- **frontend-design**: Create distinctive, production-grade frontend interfaces
- **shadcn**: Manage shadcn components and projects
- **tailwind-css-patterns**: Comprehensive Tailwind CSS utility-first styling patterns
- **next-best-practices**: Next.js best practices and conventions
- **react-best-practices**: React and Next.js performance optimization guidelines

### Backend Development
- **nestjs-best-practices**: NestJS architecture patterns for production-ready applications
- **nodejs-backend-patterns**: Node.js backend services with Express/Fastify
- **prisma-client-api**: Prisma Client API reference for database queries
- **prisma-cli**: Prisma CLI commands reference

### Quality & Testing
- **accessibility**: Audit and improve web accessibility (WCAG 2.2)
- **seo**: Optimize for search engine visibility
- **vitest**: Fast unit testing framework powered by Vite
- **zod**: Zod schema validation best practices

### DevOps & Infrastructure
- **bash-defensive-patterns**: Defensive Bash programming techniques
- **turborepo**: Turborepo monorepo build system guidance

### TypeScript
- **typescript-advanced-types**: Advanced type system including generics, conditional types

### Workflow
- **commit-workflow**: Master commit workflow composing review and research
- **review-code-changes**: Review code changes and summarize
- **conduct-research**: Conduct technical research

## Using Skills

### Activating a Skill

To use a skill, activate it with the `skill()` function:

```javascript
// Example: Activate a frontend design skill
skill("frontend-design")
```

### Skill Integration

Skills are automatically integrated into agent workflows when activated. They provide:
- Specialized knowledge and best practices
- Code examples and patterns
- Domain-specific guidelines

## Managing Skills

### Installation

Skills are installed from registries and tracked in `skills-lock.json`. The installation process:
1. Downloads skill content from the source
2. Computes a hash for integrity
3. Stores the skill in `.agents/skills/`
4. Updates `skills-lock.json` with metadata

### Version Control

The `.agents/skills/` directory is excluded from version control via `.gitignore`. This means:
- Skills are not committed to the repository
- Each developer installs skills locally
- The `skills-lock.json` file tracks installed skills for reference

### Security

- Skills are sourced from trusted registries
- Hash verification ensures integrity
- Local installation prevents external dependencies at runtime

## Best Practices

1. **Use relevant skills**: Activate skills that match the task at hand
2. **Follow skill guidelines**: Adhere to the patterns and practices provided by skills
3. **Keep skills updated**: Regularly update skills to get the latest best practices
4. **Document custom skills**: If creating custom skills, document them in this guide

## Troubleshooting

### Skill Not Found

If a skill is not found:
1. Check that the skill is installed in `.agents/skills/`
2. Verify the skill name is correct
3. Check `skills-lock.json` for the skill entry

### Skill Not Working

If a skill is not working as expected:
1. Ensure the skill is activated with `skill("skill-name")`
2. Check for conflicts with other skills
3. Review the skill's documentation in its directory

## Adding New Skills

To add a new skill:
1. Create a new directory in `.agents/skills/`
2. Add the skill files following the established structure
3. Update `skills-lock.json` with the skill metadata
4. Document the skill in this guide

## Related Files

- `skills-lock.json` - Skills registry and tracking
- `.gitignore` - Excludes `.agents/` directory from version control
- `GEMINI.md` - Contains skill system overview