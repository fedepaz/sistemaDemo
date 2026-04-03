# 🚀 Deployment Guide - vivero-client-alpha

This guide outlines the containerization and reverse proxy strategy for the **vivero-client-alpha** platform.

## 🏗️ Architecture Overview

The system is designed to run as a set of interconnected containers:
- **Frontend**: Next.js (Standalone mode)
- **Backend**: NestJS (Production build)
- **Database**: MariaDB 11
- **Cache**: Valkey 8 (Redis-compatible)
- **Gateway**: Nginx (Reverse Proxy)

---

## 📖 Sub-Guides

For specific instructions, please refer to the following documents:

1.  **[🗺️ Infrastructure Roadmap](./ROADMAP.md)**: Steps from server prep to automated deployment.
2.  **[🛠️ Maintenance & Operations](./MAINTENANCE.md)**: Common commands, backups, and pre-launch checklists.

---

## 🛡️ Nginx Routing Logic

Nginx acts as the entry point for all traffic:
- `example.com/api/*` → Proxied to `api:3001`
- `example.com/*` → Proxied to `nextjs:3000`
- `example.com/_next/static/*` → Cached aggressively for performance.

---

## 🚀 Quick Start (Production)

1. **Prepare Environment**: 
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```
2. **Build & Launch**:
   ```bash
   docker-compose up -d --build
   ```
3. **Verify Health**:
   ```bash
   curl http://localhost/api/health
   ```

---

## 📂 Example Configurations
Check the **[examples/](./examples/)** folder for ready-to-use templates:
- `nginx-simple.conf`: Basic local setup.
- `nginx-production.conf`: Full setup with Cloudflare and Rate Limiting.
- `docker-compose.yml`: Production-ready orchestration blueprint.
