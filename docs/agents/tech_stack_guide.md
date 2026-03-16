# TECH-STACK.md - vivero-client-alpha

## 🎯 Mission Statement

Build a bulletproof, enterprise-grade management system that converts 30-day trials into €50k+ annual contracts while you sleep peacefully knowing nothing will break at 3 AM.

---

## 🏗️ Core Technology Stack

### Frontend Stack

```typescript
Framework: Next.js 14+ (App Router)
├── UI Foundation: Tailwind CSS
├── Component Registry: shadcn/ui
├── Icons: Lucide React
├── State Management: TanStack Query (React Query)
├── Tables/Grids: TanStack Table + AG Grid Enterprise (optional)
├── Forms: React Hook Form + Zod validation
├── Charts: Recharts + Tremor
├── Authentication: Custom username/password with database
└── Styling: Tailwind CSS + MUI theming
```

### Backend Stack

```typescript
Framework: NestJS (TypeScript-first)
├── Database ORM: Prisma
├── Database: MariaDB 11+
├── Authentication: Manages users, permissions, and session tokens
├── Caching: Valkey (Redis 8+ compatible fork)
├── Queue System: BullMQ (Valkey/Redis-based)
├── File Storage: AWS S3 compatible
├── Email: SendGrid / AWS SES
├── Background Jobs: Node.js workers
└── API Documentation: Swagger/OpenAPI
```

### Infrastructure & DevOps

```yaml
Package Manager: pnpm 8+
Container Runtime: Docker + Docker Compose (Unified Dev/Prod Strategy)
Orchestration: Kubernetes + Helm (for scale-out)
Infrastructure as Code: Terraform
CI/CD: GitHub Actions
Monitoring: DataDog / New Relic
Logging: ELK Stack (Elasticsearch, Logstash, Kibana)
Error Tracking: Sentry
Metrics: Prometheus + Grafana
Tracing: OpenTelemetry + Jaeger
Load Balancer: Nginx / Cloudflare
CDN: Cloudflare / AWS CloudFront
```

### Testing Stack

```typescript
Unit Testing: Vitest + Testing Library
Integration Testing: Jest + Supertest
E2E Testing: Playwright
Load Testing: k6
Security Testing: OWASP ZAP
Coverage: Vitest coverage (80%+ required)
```

---

## 🏛️ Architecture Decisions

### Multi-Tenancy Strategy

```typescript
Pattern: Database-per-tenant (maximum isolation)

Rationale:
✅ Complete data isolation (security requirement)
✅ Easy backup/restore per client
✅ Custom schemas per tenant possible
✅ Regulatory compliance (GDPR)
❌ More complex deployment
❌ Higher infrastructure costs
✅ Worth it for enterprise clients paying €50k+
```

### Deployment Strategy

```typescript
Pattern: Container-first (Docker / Docker Compose)

Rationale:
✅ Identical environments for Dev, Staging, and Prod.
✅ Consistent dependency management.
✅ Automated migrations inside containers.
✅ Service health synchronization.
```

### Authentication Strategy

```typescript
Authentication Workflow:
The platform uses a traditional username/password authentication model managed by the backend.
```

### Caching Strategy

```typescript
Multi-Level Caching:
L1: React Query (browser cache) - 5 minutes
L2: Valkey 8 (server cache) - 1 hour
L3: Database query optimization - indexes
L4: CDN (static assets) - 30 days
```

---

## 🚀 Development Environment Setup

### Prerequisites

```bash
# Required software versions
Node.js: 18.18.0+
pnpm: 8.15.0+
Docker: 24.0+ (and Docker Compose)
MariaDB: 11+
Valkey: 8+
```

---

## 🔒 Security Configuration

```typescript
✅ JWT tokens with short expiration (15 min access + refresh tokens)
✅ Rate limiting (100 requests/minute per IP)
✅ Input validation with Zod schemas
✅ SQL injection prevention (Prisma ORM)
✅ XSS protection (helmet middleware)
✅ CORS configuration
✅ Environment variable validation
✅ API key rotation strategy
✅ Audit logging for all data changes
✅ Encryption at rest (database + file storage)
✅ TLS 1.3 for all connections
✅ Regular dependency updates (Dependabot + pnpm audit in CI/CD)
✅ Multi-stage Docker builds with security hardening
```

---

## 📊 Monitoring & Observability

### Key Metrics to Track

```typescript
Business Metrics:
- Trial conversion rate (target: 25%)
- Average lead score
- Trial usage patterns
- Revenue per customer
- Customer acquisition cost
- Time to first value (trial onboarding)

Technical Metrics:
- API response times (p95 < 200ms)
- Error rates (< 0.1%)
- Database query performance
- Cache hit rates
- Server resource usage
- Uptime (99.9% SLA)
```

---

## 🎯 Performance Targets

### Response Time Requirements

```typescript
Target Performance (95th percentile):
- Landing pages: < 1 second
- Dashboard loads: < 2 seconds
- API endpoints: < 200ms
- Database queries: < 100ms
- Trial signup: < 3 seconds
- Entity creation: < 500ms
- Report generation: < 5 seconds
- File uploads: < 10 seconds
```

### Scalability Targets

```typescript
System Capacity:
- Concurrent users: 10,000+
- API requests/second: 1,000+
- Database connections: 500+
- Records per tenant: 1,000,000+
- File storage: 10TB+
- Trial tenants: 1,000+ simultaneously
```

---

## 💰 Business Model Integration

### Pricing Tiers

```typescript
Trial (30 days):
- Full feature access
- Up to 10,000 records
- 5 users max
- Standard support

Starter (€2,000/month):
- Up to 50,000 records
- 20 users
- Standard features
- Email support

Professional (€5,000/month):
- Up to 500,000 records
- Unlimited users
- Advanced analytics
- Priority support

Enterprise (€15,000+/month):
- Unlimited records
- Custom features
- Dedicated support
- Self-hosting option
- Custom integrations
```

---

## ✅ Pre-Launch Checklist

- [ ] All tests passing.
- [ ] Security audit completed.
- [ ] Performance testing passed.
- [ ] Load testing completed.
- [ ] Database migrations tested.
- [ ] Backup/restore procedures verified.
- [ ] Monitoring dashboards configured.
- [ ] Error tracking setup.
- [ ] Trial signup flow tested.
- [ ] Payment processing integrated.
- [ ] GDPR compliance verified.
- [ ] 24/7 monitoring alerts configured.
- [ ] On-call rotation established.

---

> **Remember**: This tech stack is designed to scale from 0 to €10M ARR while keeping your stress levels low and your enterprise clients happy. Every decision prioritizes reliability and maintainability over bleeding-edge complexity.

**Build once. Scale forever. Sleep peacefully.** 😴💰
