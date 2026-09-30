# YEMXONA ERP & POS: davomi uchun prompt

Sen Senior Full-Stack Developer sifatida mavjud `/Users/mac/Desktop/billz` loyihasini davom ettir. Butun loyihani qaytadan yaratma, mavjud kodni o‘chirib yozma va foydalanuvchi kiritgan formatlash/tahrirlarni saqla. Har qanday o‘zgarishdan oldin tegishli fayllarning hozirgi holatini o‘qi. Kichik bosqichlarda ishlagin: o‘zgarish kirit, shu qismni test qil, so‘ng keyingi qismga o‘t.

## Loyiha

O‘zbekiston yem do‘koni uchun ERP va POS tizimi.

- Backend: Node.js, Express 5, MongoDB, Mongoose
- Frontend: React, Vite, Tailwind CSS
- Til va valyuta: o‘zbek tili, UZS
- Biznes timezone: sozlamadagi timezone, boshlang‘ich qiymat `Asia/Tashkent`

## Hozirgi mavjud holat

`backend/` ichida quyidagilar bor:

- Mongoose modellari: `Product`, `Transaction`, `Nasiya`, `Expense`, `Settings`
- Express server, MongoDB ulanishi, Helmet/CORS, health endpoint va umumiy error middleware
- Product, Transaction, Nasiya, Expense va daily report route’lari
- Transaction service’da mahsulot miqdorini kg’ga aylantirish (`kg`, `ton`, `bag`), ombor qoldig‘ini MongoDB session transaction ichida o‘zgartirish va nasiya savdosi yaratish
- Kunlik aggregation hisoboti: savdo, to‘lovlar, xarajatlar, ko‘p sotilgan yemlar va joriy qoldiqlar
- Settings’dan Telegram konfiguratsiyasini o‘qiydigan `node-cron` kundalik hisobot scheduler’i
- `.env.example`, `.gitignore`, `package.json` va `package-lock.json`

Mavjud API prefikslari: `/api/health`, `/api/products`, `/api/transactions`, `/api/nasiya`, `/api/expenses`, `/api/reports/daily`.

## Ishni davom ettirish tartibi

1. Avval repo tarkibi va tegishli backend fayllarini ko‘rib chiq. Nimalar borligini qayta yaratma; mavjud koddagi muammo bo‘lsa, ildiz sababini tuzat.
2. Backend xavfsizligi va ma’lumotlar yaxlitligini tugat.
3. Testlar va lokal ishga tushirish hujjatlarini qo‘sh.
4. Shundan keyin React frontendni yaratib, backend bilan ulang.
5. Har bosqichda sintaksis, test yoki build tekshiruvini bajargin. MongoDB yoki Telegram credential mavjud bo‘lmasa, real integratsiya tekshiruvi o‘tmaganini aniq qayd et.

## Backend’da qolgan ishlar

### 1. Auth va admin sozlamalari

- `User` modeli va admin autentifikatsiyasini qo‘sh: xavfsiz parol hash, login endpoint, token yoki session asosidagi auth, himoyalangan admin route’lari.
- Brute-force urinishlarini chekla va parol/tokenlarni logga chiqarmagin.
- Settings o‘qish/yangilash endpointlarini faqat admin uchun och.
- Telegram bot tokenini hech qachon API response, error, log yoki frontendga qaytarma. Tokenni faqat admin yuborganida yangila; bo‘sh qiymat bilan mavjud tokenni tasodifan o‘chirib yuborma.
- Birinchi adminni xavfsiz yaratish yo‘lini ber (masalan, alohida seed CLI va env qiymatlar); ochiq public signup qo‘shma.

### 2. Biznes qoidalari va transaction yaxlitligi

- Har bir ombor kirim/chiqimi bitta MongoDB session transaction ichida saqlansin. Mahsulot qoldig‘i manfiy bo‘lishiga yo‘l qo‘yma; parallel savdolarda ham ortiqcha sotuv bo‘lmasin.
- Transaction turi, narx, miqdor, sanalar, customer/supplier maydonlarini route/service qatlamida tekshir. Foydalanuvchidan kelgan `totalAmount`, `lineTotal`, `stockKg`, `paidAmount` hisoblangan qiymatlarini ishonchli deb qabul qilma.
- `ton`ni 1000 kg’ga, `bag`ni mahsulotdagi `bagWeightKg`ga aylantir. Transaction’da asl kiritilgan miqdor/birlikni ham audit uchun saqla.
- Savdo, qaytim, xarid, xarid qaytimi va inventory adjustment uchun ombor yo‘nalishlarini aniq tekshir; mahsulot qoldig‘i faqat transaction bilan o‘zgarsin.
- Nasiya savdosida boshlang‘ich tushum va keyingi qarz to‘lovlarini alohida saqla. Keyingi nasiya to‘lovi eski savdo kunining tushumini o‘zgartirmasin; u to‘lov qabul qilingan kun hisobiga tushsin.
- Nasiya to‘lovi concurrent so‘rovlarda qarz qoldig‘idan oshib ketmasligini transaction va atomar tekshiruv bilan ta’minla.
- MongoDB session transaction standalone MongoDB’da ishlamasligini README’da ko‘rsat. Lokal MongoDB replica set yoki MongoDB Atlas bilan ishlatish yo‘lini yoz.
- Mongoose update yo‘llarida kerakli validatorlarni yoq; duplicate key, cast, validation va JSON parse xatolariga to‘g‘ri HTTP status qaytar.

### 3. API’larni yakunlash

- Sahifalash, filtrlar va sort tartibini yagona va tekshirilgan API shaklida qil.
- Product CRUD va low-stock filtri; stock miqdorini oddiy product update orqali o‘zgartirishni taqiqlab, faqat transaction service’dan o‘tkaz.
- Sale/Purchase/return/adjustment yaratish va tarixini ko‘rish; stock yetishmasa aniq `409` qaytar.
- Xarajat kiritish va kun/sana oralig‘i bo‘yicha ko‘rish.
- Nasiya ro‘yxati, overdue filtri, mijoz bo‘yicha qidiruv va to‘lov tarixi.
- Settings timezone, low-stock default threshold, currency va Telegram hisobot sozlamalarini boshqarish.
- Kunlik report sanani settings timezone bo‘yicha hisoblasin. Savdo, shu kunning boshlang‘ich tushumi, aynan shu kuni olingan nasiya to‘lovlari, xarajatlar, top-sellers va stock/low-stock ko‘rsatsin.
- Mongo aggregation’larda sana oralig‘ini yarim ochiq `[start, nextDayStart)` shaklida qo‘lla.

### 4. Telegram scheduler

- Settings’dan token/chat ID’ni xavfsiz o‘qi; Telegram o‘chirilgan yoki sozlanmagan bo‘lsa xabar yuborma.
- Kunlik hisobot savdo, tushum, nasiya qarzi/to‘lovlari, xarajatlar, top mahsulotlar va kam qolgan zaxirani qamrasin.
- Scheduler qayta ishga tushishi yoki bir nechta server instance’da ishlashi sababli takroriy hisobot yubormasligi uchun DB’da unique kunlik report-run/lock mexanizmi qo‘sh.
- Telegram API xatolarini maxfiy ma’lumotlarsiz log qil va keyingi kunlik vazifalarning ishlashini to‘xtatib qo‘yma.
- Server graceful shutdown’da scheduler va DB ulanishini yopsin.

### 5. Test va hujjat

- Backend unit/integration test setup qo‘sh (mavjud package konvensiyasiga mos).
- Kg/ton/bag aylantirish, low-stock, manfiy stockni bloklash, qaytimlar, qisman/to‘liq to‘lov, nasiya overdue, sana timezone chegaralari, aggregation natijalari va Telegram matnini test qil.
- MongoDB transaction testlari replica set yoki mos test MongoDB bilan bajarilsin; real Telegram’ga testda xabar yuborma, Telegram client’ni mock qil.
- `backend/README.md` yoz: o‘rnatish, env, Mongo replica set talabi, API endpointlarining qisqa ro‘yxati, test va start komandasi.
- `.env.example`da faqat placeholderlar bo‘lsin; haqiqiy secret yoki token yozma.

## Frontend: hali yaratilmagan

`frontend/` ichida React + Vite + TailwindCSS ilovasini yarat. Birinchi ekran marketing landing page emas, ishlaydigan ERP dashboard bo‘lsin. Mavjud API bilan ulan; loading, empty, validation va error holatlarini ko‘rsat. Quyidagi ish oqimlarini to‘liq qil:

- Login va himoyalangan app shell
- Dashboard: kunlik savdo/tushum/xarajat, nasiya yig‘indisi, low-stock va top yemlar
- Mahsulotlar ro‘yxati, qidiruv, yaratish/tahrirlash, narxlar, kg qoldiq va low-stock threshold
- Kirim/chiqim va POS savdo: kg, tonna yoki qopda miqdor kiritish; qop vaznini ko‘rsatish; umumiy qoldiqni kg’da saqlash; nasiya mijoz va due date
- Transaction tarixi va filtrlar
- Nasiya mijozlari, overdue, qisman/to‘liq qarz to‘lovi
- Harajatlar kiritish va sana bo‘yicha ro‘yxat
- Kunlik report va settings (timezone, threshold, Telegram sozlamasi faqat admin uchun)

UI o‘zbekcha, UZS formatida, tez-tez ishlatiladigan POS oqimi uchun qulay va responsive bo‘lsin. API xatolarini foydalanuvchiga tushunarli ko‘rsat; maxfiy Telegram tokenini hech qachon qayta ko‘rsatma. UI’ni backend business logic o‘rniga ishlatma.

## Yakuniy talablar

- Mavjud o‘zgarishlarni saqla, unrelated fayllarni o‘zgartirma.
- Secretlarni commit qilma, sample qiymatlarni haqiqiy credential deb ko‘rsatma.
- Har muhim o‘zgarishdan keyin tegishli test/buildni darhol bajar.
- Yakunda bajarilgan ish, tekshiruv natijalari va ishga tushirish komandalarini qisqa yoz; ishlamagan yoki muhit sababli tekshirilmagan qismlarni yashirma.
