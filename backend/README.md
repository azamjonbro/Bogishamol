# Yemxona ERP Backend

O'zbekiston yem do'koni uchun ERP va POS tizimi backend API'si.

## Texnologiyalar

- **Runtime:** Node.js ≥ 20
- **Framework:** Express 5
- **Database:** MongoDB (Mongoose 9)
- **Auth:** JWT (jsonwebtoken) + bcrypt
- **Scheduler:** node-cron (kundalik Telegram hisobot)

## O'rnatish

```bash
# Loyihani clone qiling va backend papkasiga o'ting
cd backend

# Paketlarni o'rnating
npm install

# .env faylini yarating
cp .env.example .env
# .env ichidagi qiymatlarni to'ldiring (ayniqsa MONGODB_URI va JWT_SECRET)
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | development / production | `development` |
| `PORT` | Server port | `5001` |
| `MONGODB_URI` | MongoDB connection string | — (talab qilinadi) |
| `CORS_ORIGIN` | Ruxsat berilgan frontend origin'lar (vergul bilan) | — |
| `JWT_SECRET` | JWT imzolash uchun maxfiy kalit (kamida 32 belgi) | — (talab qilinadi) |

## MongoDB Replica Set talabi

MongoDB transaction'lar (session) faqat **replica set** yoki **MongoDB Atlas** bilan ishlaydi. Standalone MongoDB'da transaction ishlamaydi.

### Lokal replica set o'rnatish

```bash
# mongod'ni replica set rejimida ishga tushiring
mongod --replSet rs0 --dbpath /your/data/path

# mongo shell'da replica set'ni boshlang
mongosh --eval "rs.initiate()"
```

Yoki MongoDB Atlas (cloud) dan foydalaning — u avtomatik replica set bilan ishlaydi.

## Admin foydalanuvchi yaratish

Birinchi admin foydalanuvchini yaratish uchun seed script'ni ishlating:

```bash
ADMIN_USERNAME=admin ADMIN_PASSWORD=kuchli_parol_123 npm run seed:admin
```

Ixtiyoriy: `ADMIN_FULLNAME="Admin Nomi"` qo'shish mumkin.

## Ishga tushirish

```bash
# Development (nodemon bilan)
npm run dev

# Production
npm start
```

## API Endpointlari

### Public

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Server va DB holati |
| `POST` | `/api/auth/login` | Admin login (JWT qaytaradi) |

### Protected (JWT talab qilinadi)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/auth/me` | Joriy foydalanuvchi ma'lumoti |
| `GET` | `/api/products` | Mahsulotlar ro'yxati (?search, ?lowStock, ?active) |
| `POST` | `/api/products` | Yangi mahsulot |
| `GET` | `/api/products/:id` | Bitta mahsulot |
| `PATCH` | `/api/products/:id` | Mahsulot tahrirlash |
| `DELETE` | `/api/products/:id` | Mahsulotni o'chirish (soft delete) |
| `GET` | `/api/transactions` | Tranzaksiya tarixi (?type, ?from, ?to, ?limit, ?skip) |
| `POST` | `/api/transactions` | Yangi tranzaksiya (sale/purchase/return/adjustment) |
| `GET` | `/api/transactions/:id` | Bitta tranzaksiya |
| `GET` | `/api/nasiya` | Nasiya ro'yxati (?status, ?overdue, ?search, ?limit, ?skip) |
| `GET` | `/api/nasiya/:id` | Bitta nasiya |
| `POST` | `/api/nasiya/:id/payments` | Nasiya to'lovi |
| `GET` | `/api/expenses` | Xarajatlar (?category, ?from, ?to) |
| `POST` | `/api/expenses` | Yangi xarajat |
| `GET` | `/api/reports/daily` | Kunlik hisobot (?date=YYYY-MM-DD) |

### Admin only (JWT + admin role)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/settings` | Sozlamalar (Telegram token yashirin) |
| `PATCH` | `/api/settings` | Sozlamalarni yangilash |

## Testlar

```bash
npm test
```

> **Eslatma:** Transaction testlari MongoDB replica set talab qiladi. Telegram testlarida real xabar yuborilmaydi (mock qilinadi).

## Loyiha tuzilmasi

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB ulanishi
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT auth va admin tekshiruv
│   │   └── errorMiddleware.js    # Umumiy xato handler
│   ├── models/
│   │   ├── Expense.js
│   │   ├── Nasiya.js
│   │   ├── Product.js
│   │   ├── ReportRun.js          # Telegram hisobot dedup lock
│   │   ├── Settings.js
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── healthRoutes.js
│   │   ├── nasiyaRoutes.js
│   │   ├── productRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── settingsRoutes.js
│   │   └── transactionRoutes.js
│   ├── scripts/
│   │   └── seedAdmin.js          # Admin yaratish CLI
│   ├── services/
│   │   ├── reportService.js
│   │   ├── telegramReportService.js
│   │   └── transactionService.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
└── package.json
```
