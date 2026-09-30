#!/usr/bin/env bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="bogishamol_backup_${TIMESTAMP}.gz"

mkdir -p "$BACKUP_DIR"

echo "Bog'ishamol ERP ma'lumotlar bazasidan nusxa olinmoqda..."

docker exec bogishamol-mongodb mongodump --db yemxona_erp --archive --gzip > "${BACKUP_DIR}/${FILENAME}"

echo "Nusxa muvaffaqiyatli saqlandi: ${BACKUP_DIR}/${FILENAME}"
echo "Hajmi: $(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)"
