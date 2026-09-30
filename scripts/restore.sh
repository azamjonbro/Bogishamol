#!/usr/bin/env bash
set -e

if [ -z "$1" ]; then
    echo "Foydalanish: ./scripts/restore.sh <nusxa_fayli_yo'li>"
    echo "Misol: ./scripts/restore.sh backups/bogishamol_backup_20260930_120000.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Xatolik: '$BACKUP_FILE' fayli topilmadi!"
    exit 1
fi

echo "DIQQAT: Ushbu amal mavjud bazani zaxira nusxadagi ma'lumotlar bilan almashtiradi!"
read -p "Davom etishni xohlaysizmi? (ha/yo'q): " CONFIRM
if [ "$CONFIRM" != "ha" ]; then
    echo "Amal bekor qilindi."
    exit 0
fi

echo "Nusxa qayta tiklanmoqda..."
cat "$BACKUP_FILE" | docker exec -i bogishamol-mongodb mongorestore --db yemxona_erp --archive --gzip --drop

echo "Baza muvaffaqiyatli qayta tiklandi!"
