#!/usr/bin/env bash
# ==============================================================================
# Aatitheyam Cafe & Bhojnalaya - Automated Database Backup Script
# Creates a timestamped, gzip-compressed backup of PostgreSQL database
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${HOME}/aatitheyam_backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/aatitheyam_db_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[*] Starting PostgreSQL backup at $(date)..."

# Source database credentials from .env if present
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-restaurant_db}"

# Execute pg_dump from container and stream to gzip
docker compose exec -T db pg_dump -U "${DB_USER}" "${DB_NAME}" | gzip > "${BACKUP_FILE}"

echo "[✓] Backup completed successfully: ${BACKUP_FILE}"
echo "[*] Size: $(du -h "${BACKUP_FILE}" | cut -f1)"

# Keep only the last 14 daily backups
find "${BACKUP_DIR}" -name "aatitheyam_db_*.sql.gz" -mtime +14 -delete
echo "[✓] Cleaned up backups older than 14 days."
