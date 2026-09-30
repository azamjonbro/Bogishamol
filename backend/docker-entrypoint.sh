#!/bin/sh
set -e

echo "================================================="
echo "   Bog'ishamol Yemxona ERP — Backend Container   "
echo "================================================="

# Wait for MongoDB to accept connections
echo "MongoDB ulanishi kutilmoqda (${MONGODB_URI})..."
MAX_RETRIES=30
RETRY_COUNT=0

until node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => { mongoose.disconnect(); process.exit(0); })
  .catch(() => process.exit(1));
" 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "Xatolik: MongoDB bilan 30 soniya ichida aloqa o'rnatib bo'lmadi!"
    exit 1
  fi
  echo "MongoDB tayyor emas, 2 soniya kutilmoqda ($RETRY_COUNT/$MAX_RETRIES)..."
  sleep 2
done

echo "MongoDB muvaffaqiyatli ulandi!"

# Seed initial admin user if not exists
export ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"
export ADMIN_FULLNAME="${ADMIN_FULLNAME:-Bog'ishamol Admin}"

echo "Tizim ma'lumotlari tekshirilmoqda..."
node src/scripts/seedAdmin.js || true
node src/scripts/seedProducts.js || true

echo "Bog'ishamol Yemxona serveri ishga tushirilmoqda..."
exec "$@"
