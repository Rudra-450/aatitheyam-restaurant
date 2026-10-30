# Production Deployment Runbook
## Aatitheyam Cafe & Bhojnalaya – Restaurant Digital Menu Management Platform

This guide provides the complete, production-grade instructions to deploy **Aatitheyam Cafe & Bhojnalaya** on any cloud server for 24/7 internet availability.

---

## 1. Production Architecture

```
                  [ Public Internet / Customers / Owner ]
                                     |
                                     v
                        [ Custom Domain / HTTPS (443) ]
                                     |
                                     v
                          [ Nginx Reverse Proxy ]
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
      [ React SPA Frontend ]                     [ FastAPI Backend API ]
      - Compiled Vite Build                      - Uvicorn ASGI Server
      - Zero localhost dependencies              - Argon2id Authentication
      - Gzip compressed static files             - Uploads mount (/uploads/)
                                                           |
                                                           v
                                                  [ PostgreSQL 16 ]
                                                  - Internal Docker network
                                                  - Persistent Docker volume
```

---

## 2. Server Selection & Requirements

| Specification | Minimum | Recommended |
|---|---|---|
| **OS** | Ubuntu 22.04 LTS / 24.04 LTS | Ubuntu 24.04 LTS |
| **CPU** | 1 vCPU | 2 vCPUs |
| **RAM** | 1 GB (with 2GB Swap) | 2 GB RAM |
| **Storage** | 20 GB SSD | 40 GB NVMe SSD |
| **Cloud Options** | DigitalOcean ($4-$6/mo), Hetzner (€3.8/mo), AWS t4g.small, Linode ($5/mo), Oracle Cloud Always Free |

---

## 3. Step-by-Step Deployment (Fast Track)

### Step 1: Connect to your Cloud VPS
```bash
ssh root@<YOUR_SERVER_IP>
```

### Step 2: Clone the Project
```bash
git clone <YOUR_GIT_REPO_URL> aatitheyam-app
cd aatitheyam-app
```

### Step 3: Run the Automated Setup Script
```bash
chmod +x deploy/*.sh
bash deploy/setup-server.sh
```

The script will automatically:
1. Update system packages.
2. Configure UFW Firewall (allowing only SSH, HTTP, and HTTPS).
3. Install Docker Engine and Docker Compose plugin.
4. Generate cryptographically strong `SECRET_KEY` and PostgreSQL passwords.
5. Build and launch all containers (`db`, `backend`, `frontend`, `certbot`).

---

## 4. Domain & SSL Setup (HTTPS)

### Step 1: Configure DNS
Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, Hostinger, etc.) and create an **A Record**:
* **Type**: `A`
* **Name / Host**: `@` (or subdomain like `menu`)
* **Value / Points to**: `<YOUR_SERVER_IP>`
* **TTL**: Auto or 300 seconds

### Step 2: Issue Free Let's Encrypt SSL Certificate
Once DNS propagates, run:
```bash
bash deploy/init-ssl.sh yourdomain.com owner@aatitheyam.com
```

This script automatically verifies domain ownership via ACME, installs the SSL certificate, enables HTTPS redirection, and activates `COOKIE_SECURE=true`.

---

## 5. Owner Account Management

On the initial startup, a default owner account is created:
* **Username**: `admin`
* **Email**: `owner@aatitheyam.com`
* **Password**: `Admin@12345`

### Change Password or Create New Owner:
Run the secure CLI command inside the backend container:
```bash
docker compose exec backend python -m app.cli.bootstrap <username> <email> <password>
```
*Example:*
```bash
docker compose exec backend python -m app.cli.bootstrap owner owner@aatitheyam.com "MyStrongPassword#2026"
```

---

## 6. Automated Daily Backups

Set up an automated daily database backup at 2:00 AM:
```bash
crontab -e
```
Add the following line:
```cron
0 2 * * * /bin/bash /root/aatitheyam-app/deploy/backup-db.sh >> /root/aatitheyam_backups/backup.log 2>&1
```

### To Restore from a Backup:
```bash
gunzip -c /root/aatitheyam_backups/aatitheyam_db_YYYYMMDD_HHMMSS.sql.gz | docker compose exec -T db psql -U postgres -d restaurant_db
```

---

## 7. Useful Operations Commands

| Action | Command |
|---|---|
| **View Service Status** | `docker compose ps` |
| **View Live Logs** | `docker compose logs -f` |
| **Backend Logs Only** | `docker compose logs -f backend` |
| **Nginx Access/Error Logs** | `docker compose logs -f frontend` |
| **Restart Application** | `docker compose restart` |
| **Deploy Code Updates** | `git pull && docker compose up -d --build` |
| **Check System Resources** | `docker stats` |
