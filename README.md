# MiraiGo — Platform Latihan JFT/SSW

Platform latihan dan pembelajaran online untuk ujian JFT (Japan Foundation Test) dan SSW
(Specified Skilled Worker), dibangun sebagai SaaS modern dengan UI clean, card-based, dan
responsive terinspirasi Hostinger-style dashboard (tanpa meniru identik).

Status implementasi: **P0 (Core Learning System) — lengkap dan siap dijalankan.**
P1 (modules, announcement, profile) — lengkap.
P2 (admin panel API, reservation, transaction) — fondasi backend sudah ada; UI admin belum dibangun.

---

## 1. Overview

**Alur student:**
Login → Dashboard → Practice → Package Detail → Quiz (timer server-authoritative, auto-save)
→ Submit → Result → Review Answer → History → Progress

**Stack:**
- Backend: Laravel 11 + Laravel Sanctum + MySQL
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS

---

## 2. Requirements

- PHP >= 8.2, Composer
- Node.js >= 18, npm
- MySQL >= 8.0

---

## 3. Installation — Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

### 3.1 Database setup

Buat database MySQL kosong bernama `miraigo` (atau sesuaikan `.env`), lalu edit
`backend/.env`:

```
DB_DATABASE=miraigo
DB_USERNAME=root
DB_PASSWORD=
```

### 3.2 Migration & Seeder

```bash
php artisan migrate --seed
```

Seeder membuat:
- 1 akun admin: `admin@miraigo.test` / `password`
- 1 akun student: `student@miraigo.test` / `password`
- 4 paket latihan JFT (Soba, Toire, Basu, Kagi) lengkap dengan section & soal
- 2 pengumuman contoh

### 3.3 Storage link (untuk upload gambar/audio soal)

```bash
php artisan storage:link
```

### 3.4 Jalankan server

```bash
php artisan serve
```

API akan berjalan di `http://localhost:8000/api`.

---

## 4. Installation — Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Pastikan `frontend/.env` mengarah ke API backend:

```
VITE_API_URL=http://localhost:8000/api
```

### 4.1 Jalankan dev server

```bash
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

### 4.2 Build production

```bash
npm run build
```

Output ada di `frontend/dist/`.

---

## 5. Default Development Accounts

| Role    | Email                      | Password |
|---------|-----------------------------|----------|
| Admin   | admin@miraigo.test        | password |
| Student | student@miraigo.test      | password |

---

## 6. API Overview

Semua endpoint berada di bawah `/api`. Response format standar:

```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "message": "...", "errors": {} }
```

**Auth:** `POST /auth/login`, `POST /auth/logout`, `GET /me`

**Dashboard:** `GET /dashboard`

**Packages:** `GET /packages`, `GET /packages/{id}`

**Quiz Engine (P0 core):**
- `POST /attempts` — mulai/lanjutkan attempt (`{ package_id }`)
- `GET /attempts/{id}` — ambil state attempt + soal (tanpa jawaban benar)
- `POST /attempts/{id}/answers` — auto-save jawaban (`{ question_id, question_option_id }`)
- `POST /attempts/{id}/submit` — submit & scoring
- `GET /attempts/{id}/result` — hasil akhir
- `GET /attempts/{id}/review` — review jawaban (jawaban benar baru muncul di sini)

**History:** `GET /history`
**Progress:** `GET /progress`
**Modules:** `GET /modules`, `GET /modules/{id}`
**Announcements:** `GET /announcements`, `POST /announcements/{id}/read`
**Profile:** `GET /profile`, `PUT /profile`, `PUT /profile/password`

**Admin** (butuh role `admin`, prefix `/admin`):
`GET /admin/dashboard`, CRUD `/admin/packages`, `/admin/packages/{id}/sections`,
`/admin/questions`, `GET /admin/users`, dll. Lihat `backend/routes/api.php` untuk daftar lengkap.

---

## 7. Folder Structure

```
miraigo/
├── backend/                  Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/    Controllers P0 (Auth, Dashboard, Package, Attempt, ...)
│   │   ├── Http/Controllers/Api/Admin/  Admin CRUD controllers
│   │   ├── Http/Requests/           Form validation
│   │   ├── Http/Resources/          API response formatting (correct answers hidden until submit)
│   │   ├── Models/                  20 Eloquent models
│   │   └── Services/                QuizService, ScoringService, AccessService, ProgressService
│   ├── database/migrations/         19 migrations
│   ├── database/seeders/            Realistic JFT seed data
│   └── routes/api.php
└── frontend/                 React + TS + Tailwind SPA
    └── src/
        ├── components/ui/           Reusable design system (Button, Card, Modal, ...)
        ├── components/layout/       StudentLayout, Sidebar, Header
        ├── components/quiz/         QuestionNavigator
        ├── pages/                   auth, dashboard, practice, quiz, result, history, progress, modules, profile
        ├── services/                API client modules per domain
        ├── hooks/useServerTimer.ts  Display-only countdown driven by server expires_at
        └── stores/AuthContext.tsx
```

---

## 8. Important Configuration & Security Notes

- **Timer is server-authoritative.** `started_at`/`expires_at` are computed by
  `QuizService::startAttempt()` on the server. The frontend countdown
  (`useServerTimer`) is display-only — the backend independently rejects any
  answer/submit made after `expires_at`, and auto-expires stale attempts on next read.
- **Correct answers are never sent to the client during an active attempt.**
  `QuestionResource` omits `is_correct` entirely; only `QuizReviewResource`
  (used after submission) exposes it.
- **Package access, attempt ownership, and question/option relationships are
  re-validated on every request** in `QuizService` — nothing about
  authorization is trusted from the frontend.
- **Admin routes** are protected by the `admin` middleware
  (`EnsureUserIsAdmin`), enforced server-side regardless of frontend routing.

---

## 9. Troubleshooting

- **419/401 errors on login:** confirm `SANCTUM_STATEFUL_DOMAINS` and `FRONTEND_URL`
  in `backend/.env` match your frontend's actual host/port.
- **CORS errors:** check `backend/config/cors.php` — `allowed_origins` must include
  your frontend URL.
- **Migration errors about foreign keys:** ensure MySQL version supports InnoDB
  (default) and that migrations run in order (they are timestamp-prefixed).
- **"Class not found" after pulling this zip:** run `composer install` — the
  `vendor/` directory is intentionally excluded from the zip.

---

## 10. Roadmap (not yet built in this delivery)

- Admin UI (React pages consuming the already-built `/admin/*` API)
- Reservation & Transaction UI (backend tables + models exist; no payment gateway wired)
- Notification bell wired to real `/notifications` data (table exists, endpoint not yet added)
- Automated PHPUnit/Pest test suite


-untuk kandidat mendunia itu bakalan ada voucher untuk bisa aksesnya per batch itu untuk membuka akses soal paket nya