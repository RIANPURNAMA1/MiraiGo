# Dokumentasi Integrasi — Sistem Management Kandidat ↔ MiraiGo

Dokumen ini menjelaskan kebutuhan teknis yang harus disiapkan oleh **sistem management kandidat** agar pengguna dari sistem tersebut dapat login dan menggunakan platform belajar **MiraiGo** tanpa membuat akun baru.

---

## 1. Ringkasan Kebutuhan

| # | Kebutuhan | Keterangan |
|---|-----------|------------|
| 1 | **Base URL API** | Endpoint utama sistem kandidat (test & production) |
| 2 | **Dokumentasi API** | Halaman Swagger / Postman / dokumen teknis |
| 3 | **Kredensial Integrasi** | `Client ID` + `Client Secret` (OAuth2) atau `API Key` |
| 4 | **Endpoint Login/Verifikasi** | Untuk validasi akun kandidat |
| 5 | **Endpoint Data Kandidat** | Untuk mengambil data profil (nama, email, dsb.) |
| 6 | **Standar Token** | Format & masa berlaku token, metode verifikasi |
| 7 | **Struktur Data** | Field data user yang dikirim, termasuk field unik |
| 8 | **Callback URL** | URL redirect untuk alur OAuth2 |
| 9 | **Environment Sandbox** | Akses uji coba sebelum produksi |
| 10 | **Kesepakatan Privasi** | Field data yang boleh diakses & digunakan |

---

## 2. Metode Autentikasi yang Disarankan

**Opsi A — OAuth 2.0 (direkomendasikan)**
Kandidat login di sistem management kandidat, kemudian sistem MiraiGo menerima **access token** untuk mengambil identitas kandidat secara aman.

**Opsi B — API Token / API Key**
MiraiGo mengirim kredensial kandidat (atau token khusus) ke endpoint verifikasi sistem kandidat, lalu sistem kandidat mengembalikan data kandidat yang valid.

Sistem kandidat cukup mendukung salah satu opsi di atas.

---

## 3. Spesifikasi API yang Dibutuhkan

### 3.1 Alur OAuth2

1. Kandidat klik **"Masuk dengan [Sistem Kandidat]"** di halaman login MiraiGo.
2. MiraiGo mengarahkan kandidat ke **Authorization URL** sistem kandidat.
3. Kandidat login & menyetujui (consent).
4. Sistem kandidat me-redirect kembali ke **Callback URL** MiraiGo dengan authorization code.
5. Backend MiraiGo menukar code tersebut dengan **access token** via **Token URL**.
6. Backend MiraiGo memanggil **User Info URL** untuk mendapatkan profil kandidat.
7. Backend MiraiGo mencocokkan/membuat akun lokal, lalu menerbitkan token MiraiGo.

### 3.2 Daftar Endpoint yang Diperlukan

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/oauth/authorize` | GET | (OAuth2) Halaman login sistem kandidat |
| `/oauth/token` | POST | (OAuth2) Menukar code menjadi access token |
| `/me` atau `/kandidat/{id}` | GET | Ambil data profil kandidat yang terautentikasi |
| `/auth/verify` (alternatif) | POST | Verifikasi kredensial/token jika pakai API Key |

### 3.3 Struktur Data Kandidat yang Dibutuhkan

Field `id` (atau `external_id`) bersifat **wajib** sebagai kunci pencocokan akun.

| Field | Tipe | Wajib | Contoh |
|-------|------|-------|--------|
| `id` / `external_id` | string \| int | Ya | `KND-10231` |
| `name` | string | Ya | `Arif Budiman` |
| `email` | string | Ya | `arif@mail.com` |
| `role` | string | Tidak | `kandidat` |
| `phone` | string | Tidak | `08123456789` |
| `photo_url` | string | Tidak | `https://.../foto.jpg` |

**Contoh response `GET /me`:**
```json
{
  "id": "KND-10231",
  "name": "Arif Budiman",
  "email": "arif@mail.com",
  "role": "kandidat",
  "phone": "08123456789"
}
```

### 3.4 Standar Token

| Aspek | Kebutuhan |
|-------|-----------|
| Format | JWT atau opaque token |
| Verifikasi | Signature/JWK public key (JWT) atau endpoint validasi (introspection) |
| Masa berlaku (TTL) | ≥ 15 menit (ideal: 1 jam) |
| Refresh token | Ada, bila mendukung sesi panjang |
| Scope | Minimal `read:profile`, `read:email` |

### 3.5 Format Error

Setiap error harus mengembalikan kode status HTTP yang sesuai:

| Kode | Arti |
|------|------|
| `200 / 201` | Sukses |
| `401` | Token/kredensial tidak valid atau expired |
| `403` | Tidak punya akses/scope |
| `404` | Data tidak ditemukan |
| `429` | Terlalu banyak request (rate limit) |
| `5xx` | Error server |

**Contoh format error:**
```json
{
  "error": "invalid_token",
  "message": "Access token expired",
  "status": 401
}
```

---

## 4. Callback URL

Untuk alur OAuth2, daftarkan URL callback berikut di panel/dashboard sistem management kandidat:

```
https://miraigo.com/auth/callback
```

---

## 5. Environment

| Environment | Base URL | Keterangan |
|-------------|----------|------------|
| **Sandbox / Staging** | `https://sandbox-api.sistem-kandidat.com` | Untuk uji coba integrasi |
| **Production** | `https://api.sistem-kandidat.com` | Untuk pemakaian nyata |

---

## 6. Kebutuhan Keamanan & Privasi

- Wajib **HTTPS (TLS)** pada semua endpoint.
- Kredensial integrasi (`Client Secret` / `API Key`) disimpan di sisi server, tidak pernah di frontend.
- Mendukung **CORS** bila API dipanggil langsung dari browser (tidak disarankan; sebaiknya server-to-server).
- Memiliki **rate limiting** dan dokumentasi limit yang jelas.
- Kejelasan **scope/persetujuan data (consent)** untuk user.
- Sesuai regulasi perlindungan data (UU PDP / GDPR bila relevan).

---

## 7. Hal yang Perlu Diberikan oleh Sistem Kandidat

Checklist akhir untuk tim sistem management kandidat:

- [ ] Link dokumentasi API (Swagger/Postman)
- [ ] Base URL sandbox & production
- [ ] Kredensial integrasi (Client ID + Secret, atau API Key)
- [ ] Kriteria dukungan OAuth2 (Authorization URL, Token URL, User Info URL) atau endpoint verifikasi alternatif
- [ ] Contoh request/response untuk setiap endpoint
- [ ] Standar & TTL token, metode verifikasi
- [ ] Daftar field data kandidat yang tersedia
- [ ] Daftar kode error & artinya
- [ ] Dokumentasi rate limit
- [ ] Kesepakatan privasi data yang boleh diakses

---

## 8. Kontak

| | Detail |
|---|--------|
| Tim integrasi (pihak MiraiGo) | [isi nama] |
| Tim sistem management kandidat | [isi nama] |
| Jadwal uji coba (sandbox) | [isi tanggal] |
| Target go-live | [isi tanggal] |