# 🛠️ Maintenance & Operations

Essential commands and checklists for keeping the platform running smoothly.

## 🧰 Common Commands

### Logs & Monitoring
```bash
# View live logs for specific services
docker-compose logs -f nextjs
docker-compose logs -f api
docker-compose logs -f nginx
```

### Management
```bash
# Restart a specific service
docker-compose restart nextjs

# Rebuild and update one service (no downtime for others)
docker-compose up -d --build nextjs

# Remove unused images to save disk space
docker image prune -f
```

### Backups
```bash
# Manual database dump
docker-compose exec mariadb mysqldump -u root -p$DB_ROOT_PASSWORD proplanta > ./backups/backup-$(date +%F).sql
```

---

## ✅ Pre-Launch Checklist

### Server
- [ ] Minimal OS installed.
- [ ] Docker + Compose Plugin active.
- [ ] UFW Firewall configured (22, 80, 443).

### Application
- [ ] `docker-compose.yml` uses service names, not `localhost`.
- [ ] Health checks pass for all services.
- [ ] `.env` file populated with production secrets.

### Network
- [ ] Cloudflare DNS A record exists.
- [ ] SSL Mode set to **Full**.
- [ ] Nginx config syntax verified (`nginx -t`).

### Verification
- [ ] `/login` page loads.
- [ ] `/api/health` returns 200 OK.
- [ ] Static assets have `Cache-Control: public, immutable`.
