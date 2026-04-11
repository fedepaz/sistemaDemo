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
3.  **[☁️ Cloudflare SSH Tunnel Setup](./cloudfare-ssh-setup.md)**: Secure remote access without open ports.

---

## 🌐 Deployment for Non-Programmers (Step-by-Step)

If you're not a developer, follow these steps to set up the system on your server:

### 1. Prerequisites
- **Docker Installed**: Ensure your server has Docker and Docker Compose installed.
- **Project Files**: You need a copy of this project on your server. You can get it by downloading it or cloning it with `git`:
  ```bash
  git clone <your-repository-url>
  cd vivero-client-alpha
  ```

### 2. Prepare Configuration Files (.env)
The system requires specific settings to run. You must create configuration files based on the examples provided:

1.  **Backend Settings**:
    - **Action**: Create the production file from the example.
      ```bash
      cp apps/backend/.env.example apps/backend/.env.production
      ```
    - **Edit**: Open the file with an editor (like `nano apps/backend/.env.production`).
    - **Key Variables to Check**:
        - `DATABASE_PROD_URL`: Points to the internal database (`mysql://root:rootpassword@mariadb:3306/vivero_client_alpha`).
        - `DATABASE_LEGACY_URL`: **(New)** Use this if you need to connect to an existing database from a previous system.
        - `JWT_SECRET`: Change this to a long, secure, and unique string.

2.  **Frontend Settings**:
    - **Action**: Create the production file.
      ```bash
      cp apps/frontend/.env.example apps/frontend/.env.production
      ```
    - **Key Variable**:
        - `NEXT_PUBLIC_BACKEND_URL`: Set this to `/api` for standard routing.

### 3. Build & Launch
In the main folder of the project, run:
```bash
docker compose up -d --build
```
This command will:
1.  **Download & Build**: Prepare all the necessary components automatically.
2.  **Database Seeding**: **(Important)** On the first launch, the system will automatically create the initial administrator user so you can log in immediately.
3.  **Resilience**: Recent improvements ensure a more stable installation even with slower internet connections.

### 4. Verification
- **Web App**: Accessible on your server's IP at port **3000**.
- **API Status**: Check `http://your-server-ip:3001/api/health` to confirm the database connection is active.

---

## 🛡️ Nginx Routing Logic

Nginx acts as the entry point for all traffic:
- `example.com/api/*` → Proxied to `api:3001`
- `example.com/*` → Proxied to `nextjs:3000`
- `example.com/_next/static/*` → Cached aggressively for performance.

---

## 🚀 Quick Start (Technical)

1. **Copy Examples**: 
   ```bash
   cp apps/backend/.env.example apps/backend/.env.production
   cp apps/frontend/.env.example apps/frontend/.env.production
   ```
2. **Build**:
   ```bash
   docker compose up -d --build
   ```
3. **Health Check**:
   ```bash
   curl http://localhost:3001/api/health
   ```

---

## 📂 Example Configurations
Check the **[examples/](./examples/)** folder for ready-to-use templates:
- `nginx-simple.conf`: Basic local setup.
- `nginx-production.conf`: Full setup with Cloudflare and Rate Limiting.
- `docker-compose.yml`: Production-ready orchestration blueprint.
