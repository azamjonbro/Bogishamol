# Bog'ishamol Yemxona ERP — Homeserverga O'rnatish Qo'llanmasi

Ushbu qo'llanma yordamida **Bog'ishamol Yemxona ERP** tizimini o'zingizning homeserveringizga (Ubuntu, Debian, CasaOS, Unraid, TrueNAS, Raspberry Pi yoki Mini PC) to'liq avtomatlashtirilgan tarzda Docker orqali o'rnatishingiz mumkin.

---

## 🏗 Arxitektura

Tizim Docker orqali 3 ta bir-biri bilan xavfsiz bog'langan konteynerda ishlaydi:

1. **`bogishamol-frontend`**: Nginx web-serveri (React SPA, Gzip siqish, kesh va API proksi).
2. **`bogishamol-backend`**: Node.js Express API serveri (avtomatik admin va 11 xil yem mahsulotlari bilan).
3. **`bogishamol-mongodb`**: MongoDB 7.0 ma'lumotlar bazasi (ma'lumotlar server o'chganda ham o'chib ketmaydigan alohida Docker volumeda saqlanadi).

---

## 🚀 1-Qadam: Fayllarni Homeserverga Ko'chirish

Mac noutbukingizdagi terminaldan turib quyidagi usullardan birini tanlang:

### A Variant: `rsync` orqali to'g'ridan-to'g'ri ko'chirish (Eng qulayi)

Terminalingizda quyidagi buyruqni ishga tushiring (keraksiz `node_modules` larni tashlab ketadi):

```bash
rsync -avz --exclude='node_modules' --exclude='.git' /Users/mac/Desktop/billz/ <FOYDALANUVCHI>@<HOMESERVER-IP>:~/billz
```

_Misol: `rsync -avz --exclude='node_modules' --exclude='.git' /Users/mac/Desktop/billz/ server@192.168.1.50:~/billz`_

---

### B Variant: Arxiv (tar.gz) qilib uzatish

1. Mac'da loyihani arxivlang:

```bash
cd /Users/mac/Desktop
tar --exclude='node_modules' --exclude='.git' -czvf billz.tar.gz billz/
```

2. Arxivni serverga uzating:

```bash
scp billz.tar.gz <FOYDALANUVCHI>@<HOMESERVER-IP>:~/
```

3. Homeserveringizga SSH orqali kiring va arxivni oching:

```bash
ssh <FOYDALANUVCHI>@<HOMESERVER-IP>
tar -xzvf billz.tar.gz
cd billz
```

---

## ⚙️ 2-Qadam: Homeserverda Docker Mavjudligini Tekshirish

Homeserveringiz terminalida Docker o'rnatilganligini tekshiring:

```bash
docker --version
docker compose version
```

Agar hali o'rnatilmagan bo'lsa, 1 daqiqada o'rnatish:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

---

## ▶️ 3-Qadam: Ishga Tushirish (Faqat 1 ta Buyruq!)

Homeserveringizda `billz` papkasiga kiring va o'rnatuvchi skriptni ishga tushiring:

```bash
cd ~/billz
./deploy.sh
```

Yoki to'g'ridan-to'g'ri Docker Compose orqali:

```bash
docker compose up -d --build
```

Docker barcha kerakli kutubxonalarni o'rnatadi, backend va frontendni avtomatik yig'adi, MongoDB bazasini ulaydi va barcha xizmatlarni ishga tushiradi!

---

## 🔑 4-Qadam: Tizimga Kirish

Ishga tushgach, uyingizdagi istalgan qurilmadan (kompyuter, noutbuk, planshet, telefon) brauzerni oching:

👉 **Manzil:** `http://<HOMESERVER-IP>`  
_(Masalan: `http://192.168.1.50` yoki agar o'sha serverning o'zida bo'lsangiz `http://localhost`)_

### Standart Kirish Ma'lumotlari:

- **Login:** `admin`
- **Parol:** `admin123`

_(Tizimga kirganingizdan so'ng xavfsizlik uchun parolni o'zgartirishingiz mumkin)._

---

## 🌐 5-Qadam: Masofadan (Uydan Tashqarida) Kirish

Homeserverga uydan tashqarida, internet orqali xavfsiz kirish uchun 2 ta eng yaxshi usul:

### Usul 1: Tailscale (Tavsiya etiladi, mutlaqo bepul va xavfsiz)

- Homeserveringizga Tailscale o'rnating: `curl -fsSL https://tailscale.com/install.sh | sh && sudo tailscale up`
- Telefoningizga yoki noutbukingizga ham Tailscale ilovasini o'rnating.
- Biron port ochmasdan turib, xavfsiz shaxsiy IP orqali istalgan joydan do'kon tizimiga kiring!

### Usul 2: Cloudflare Tunnel (Vercel frontend + homeserver API)

Frontend Vercel'da, backend homeserverda ishlasa, API domenini Nginx va Cloudflare Tunnel orqali ulang. Cloudflare oddiy DNS proxy orqali `4963` portni qo'llamaydi; Tunnel public hostname'ni serverdagi `localhost:80` ga yo'naltiradi, Nginx esa so'rovni backendning `4963` portiga uzatadi.

1. Backend serveri `4963` portda ishlayotganini tekshiring: `curl http://127.0.0.1:4963/api/health`.
2. Nginx konfiguratsiyasini serverga ko'chiring: `deploy/nginx/bogishamol-api.conf`.
3. Serverda konfiguratsiyani yoqing va tekshiring:

```bash
sudo cp deploy/nginx/bogishamol-api.conf /etc/nginx/sites-available/bogishamol-api
sudo ln -s /etc/nginx/sites-available/bogishamol-api /etc/nginx/sites-enabled/bogishamol-api
sudo nginx -t && sudo systemctl reload nginx
```

4. Cloudflare Zero Trust'da Tunnel yarating, connector'ni shu serverda ishga tushiring va Public Hostname qo'shing:

- **Hostname:** `bogishamol.sds-max.uz`
- **Service:** `HTTP` → `localhost:80`

5. Backend `.env` dagi `CORS_ORIGIN` ga `https://bogishamol-ten.vercel.app` ni yozing (mahalliy frontend ham kerak bo'lsa vergul bilan `http://localhost:5173` ni qo'shing), so'ng backendni qayta ishga tushiring. `*` ishlatmang.
6. Vercel frontend'ni `frontend` Root Directory bilan deploy qiling va Project Settings → Environment Variables'da Production uchun `VITE_API_URL=https://bogishamol.sds-max.uz/api` qo'shing, so'ng yangi deploy qiling.

Cloudflare Tunnel TLS va DNS'ni boshqaradi; `4963` portni internetga ochish kerak emas. Agar serverda boshqa Nginx allaqachon `80` portni band qilgan bo'lsa, yuqoridagi `server` blokini o'sha Nginx konfiguratsiyasiga qo'shing, ikkinchi Nginx'ni ishga tushirmang.

---

## 💾 Zaxira Nusxa (Backup & Restore)

Do'kon savdolari va nasiya daftari xavfsizligi uchun maxsus skriptlar tayyorlangan:

### 1. Zaxira nusxa olish (Backup):

```bash
./scripts/backup.sh
```

Fayl `backups/bogishamol_backup_YYYYMMDD_HHMMSS.gz` ko'rinishida saqlanadi.

### 2. Nusxani qayta tiklash (Restore):

```bash
./scripts/restore.sh backups/bogishamol_backup_xxxxxx.gz
```

### 3. Har kecha avtomatik backup olish (Crontab):

Homeserverda har kecha soat 03:00 da avtomatik zaxira olish uchun:

```bash
crontab -e
```

Quyidagi qatorni qo'shing:

```bash
0 3 * * * cd /home/$USER/billz && ./scripts/backup.sh >/dev/null 2>&1
```

---

## 🛠 Xizmatlarni Boshqarish Buyruqlari

- **Xizmatlar holatini ko'rish:** `docker compose ps`
- **Loglarni jonli ko'rish:** `docker compose logs -f`
- **Qayta ishga tushirish (Restart):** `docker compose restart`
- **To'xtatish:** `docker compose down`
- **Yangi versiyani yangilash:**
  ```bash
  git pull  # yoki yangi fayllarni tashlab
  docker compose up -d --build
  ```
