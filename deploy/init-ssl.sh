#!/usr/bin/env bash
# ==============================================================================
# Aatitheyam Cafe & Bhojnalaya - Automated Let's Encrypt SSL Setup Script
# Usage: bash deploy/init-ssl.sh <your-domain.com> <your-email@aatitheyam.com>
# ==============================================================================

set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-}"

if [ -z "${DOMAIN}" ] || [ -z "${EMAIL}" ]; then
    echo "Usage: bash deploy/init-ssl.sh <domain_name> <email_address>"
    echo "Example: bash deploy/init-ssl.sh aatitheyam.com owner@aatitheyam.com"
    exit 1
fi

echo "[1/4] Ensuring Nginx is running for ACME challenge..."
docker compose up -d frontend

echo "[2/4] Requesting SSL certificate from Let's Encrypt for ${DOMAIN}..."
docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email ${EMAIL} \
    -d ${DOMAIN} \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal \
    --non-interactive" certbot

echo "[3/4] Generating SSL-enabled Nginx configuration..."
sed -e "s|\${DOMAIN_NAME}|${DOMAIN}|g" frontend/nginx-ssl.conf > frontend/nginx.conf

# Update COOKIE_SECURE and PUBLIC_MENU_BASE_URL in .env
sed -i "s|COOKIE_SECURE=.*|COOKIE_SECURE=true|g" .env
sed -i "s|PUBLIC_MENU_BASE_URL=.*|PUBLIC_MENU_BASE_URL=https://${DOMAIN}/menu|g" .env

echo "[4/4] Reloading Nginx with SSL certificates..."
docker compose build frontend
docker compose up -d frontend backend

echo "==========================================================="
echo "  SSL Certificate Configured Successfully!                 "
echo "  HTTPS is now active at: https://${DOMAIN}                "
echo "  Customer Menu: https://${DOMAIN}/menu                    "
echo "  Owner Dashboard: https://${DOMAIN}/admin                 "
echo "==========================================================="
