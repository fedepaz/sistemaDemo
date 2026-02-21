# Enterprise TDD & CI/CD Guide - vivero-client-alpha

Philosophy: Write tests so good that you sleep peacefully knowing your enterprise clients are happy and your app won't wake you up at 3 AM.

---

## Testing Strategy

### Collaboration Model

- **Frontend Specialist**: Responsible for writing **unit and component tests**.
- **QA & Test Automation Engineer**: Responsible for building and maintaining the comprehensive **E2E test suite**.

---

## The "Sleep Well" Testing Pyramid

- **E2E (5% - Critical user flows)**: Owned by the QA Engineer. Covers critical paths like trial signup and entity lifecycle management.
- **Integration (15% - API contracts & component interactions)**: A shared responsibility.
- **Unit (80% - Business logic & components)**: Owned by developers. Every piece of business logic and every UI component must have unit tests.

## Testing Philosophy

Rule #1: If it can break at 3 AM and wake you up, it needs a test.
Rule #2: If a client can lose money because of it, it needs integration tests.
Rule #3: If it's business logic, it needs unit tests.

---

## CI/CD Pipeline Configuration

The canonical CI/CD workflow structure is defined in `docs/agents/cicd_agent.md`.

1.  `pr-checks.yml`: Quality Assurance.
2.  `deploy.yml`: Deployments.
3.  `scheduled.yml`: Maintenance.
4.  `reusable-setup.yml`: Common steps.

---

## Quality Gates & Metrics

### Code Coverage Requirements
- **Global Threshold**: 80% for branches, functions, lines, and statements.

---

## Monitoring & Alerting Integration

### Health Check Endpoints
Implement endpoints to monitor database connectivity, cache health, and critical system services.

---

## Deployment Verification

1.  **Health Check**: Verify health endpoint.
2.  **Database connectivity**: Ensure DB is reachable.
3.  **Cache connectivity**: Ensure cache is reachable.
4.  **Smoke tests**: Run basic post-deployment checks.

---

The goal is to build it once, test it thoroughly, and then just monitor the money coming in while your enterprise clients are happy. 💰😎
This setup gives you the confidence to sleep well knowing your system is bulletproof and your clients are getting enterprise-grade reliability.
