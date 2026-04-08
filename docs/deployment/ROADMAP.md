# 🗺️ Infrastructure Roadmap & Strategy

This document outlines the path from server preparation to a fully automated "one-command" deployment.

## 🔴 Critical Tasks (Immediate)
- [ ] **Proxy Headers**: Add `X-Forwarded-Proto`, `X-Real-IP`, and `X-Forwarded-For` to the frontend location block.
- [ ] **Service Discovery**: Replace `localhost:3000` with Docker service names (`nextjs:3000`) in Nginx config.
- [ ] **Cloudflare Integration**: Add `set_real_ip_from` and `real_ip_header` for accurate visitor tracking.

## 🟡 Recommended Enhancements
- [ ] **Aggressive Caching**: Configure `/ _next/static/` and image assets for long-term browser caching.
- [ ] **Security Throttling**: Add rate limiting to the `/login` endpoint to prevent brute-force attacks.

---

## 🚀 The Master Plan: Phase-by-Phase

### Phase 1: Server Preparation (One-Time)
1. **Minimal OS**: Install Debian 12 netinst or Ubuntu Server (No GUI).
2. **Essentials**: `sudo apt update && sudo apt install -y curl git ufw`.
3. **Docker**: `curl -fsSL https://get.docker.com | sh`.
4. **Firewall**: Enable UFW for 22, 80, and 443.
5. **Permissions**: Add user to `docker` group.

### Phase 2: Docker Orchestration
Configure the root `docker-compose.yml` with:
- Isolated bridge network (`proplanta-net`).
- Health checks for all services (wait for DB before API, wait for API before Nginx).
- Automatic restart policies (`unless-stopped`).
- Log rotation (max 10m files) to save disk space.

### Phase 3: Nginx-in-Docker
Avoid global Nginx installs. Mount your configuration as a volume:
```yaml
volumes:
  - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
```

### Phase 4: Cloudflare & SSL
- **DNS**: Set A record to Server IP (Proxied).
- **SSL Mode**: **Full** (Strict). Avoid "Flexible" to prevent infinite redirect loops.
- **Page Rules**: Cache static assets, bypass API.

### Phase 5: Automated Deployment (CI/CD)
Using GitHub Actions to deploy on `push` to `main`:
1. SSH into server.
2. `git pull`.
3. `docker-compose up -d --build`.
4. `docker image prune -f`.

---

## 🎯 The Goal
**One command to rule them all:**
```bash
docker-compose up -d --build
```
✅ App live, DB migrated, Cache ready, Nginx routing secured.

## For future
CI/CD
↓
build docker images
↓
push a registry
↓
server only does docker pull
