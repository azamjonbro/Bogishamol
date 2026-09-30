#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "   Bog'ishamol Yemxona ERP — Homeserver O'rnatuvchisi     "
echo "=========================================================="

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "Xatolik: Docker o'rnatilmagan! Iltimos, Docker va Docker Compose o'rnating:"
    echo "curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Check if .env exists, if not copy from .env.example
if [ ! -f .env ]; then
    echo ".env fayli mavjud emas, .env.example dan nusxa ko'chirildi..."
    cp .env.example .env
fi

echo "1. Konteynerlar qurilmoqda va ishga tushirilmoqda..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d --build

echo ""
echo "2. Xizmatlar holati tekshirilmoqda..."
sleep 5
docker compose ps

echo ""
echo "=========================================================="
echo "Tabriklaymiz! Bog'ishamol Yemxona ERP muvaffaqiyatli ishga tushdi!"
echo ""
echo "Kirish manzili:"
echo "  - Mahalliy serverda: http://localhost"
echo "  - Tarmoq orqali (boshqa telefon/kompyuterdan): http://<HOMESERVER-IP>"
echo ""
echo "Boshlang'ich login ma'lumotlari:"
echo "  Login:    admin"
echo "  Parol:    admin123"
echo "=========================================================="
