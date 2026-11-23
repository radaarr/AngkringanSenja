# Angkringan Senja

Aplikasi web manajemen angkringan (Laravel 12 + React/Vite TypeScript) untuk pemesanan QR dine-in, POS kasir, dapur (KDS), inventaris & resep, pengeluaran, promosi, serta dashboard/laporan.

## Fitur Utama
- **Pelanggan:** menu, keranjang, checkout QR meja (dine-in) / takeaway dengan kode promo, pelacakan pesanan (token) lengkap dengan rincian diskon & pajak.
- **Kasir/POS:** buat pesanan POS, terapkan kode promo, pembayaran Tunai (dengan kembalian) & QRIS (simulasi), struk cetak browser (subtotal, diskon, service, pajak), riwayat.
- **Dapur:** antrean CONFIRMED/PREPARING/READY, pembaruan status (polling).
- **Admin/Owner:** dashboard metrik & grafik, CRUD kategori/produk, manajemen pesanan & status, inventaris bahan + penyesuaian/riwayat, resep/BOM produk, pengeluaran, promosi, laporan & ekspor CSV.
- **Promo & pajak:** validasi kode promo (aktif, periode, min. belanja) di checkout publik & POS, satu promo per pesanan; PB1 default 10% dan service charge opsional, dihitung server-side.
- **Stok:** pengurangan otomatis saat pembayaran sukses dan kompensasi saat pembatalan (transaksional, lock baris, idempotent per order).

## Prasyarat
- PHP 8.3+, Composer
- Node.js 18+ & npm
- MySQL 8+ (Laragon/XAMPP/dsb)

## Setup Backend
```powershell
cd backend
copy .env.example .env   # sesuaikan DB_DATABASE/DB_USERNAME/DB_PASSWORD
# jika PHP default < 8.3 (Laragon), gunakan php 8.3:
C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe artisan key:generate
C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe artisan migrate --seed
C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe artisan db:seed --class=PromotionSeeder
C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe artisan storage:link
C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe artisan serve
```
Backend berjalan di `http://localhost:8000`. Konfigurasi SPA/Sanctum (default dev): `SESSION_DOMAIN=localhost`, `SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173`, `FRONTEND_URL=http://localhost:5173`.

Konfigurasi pajak & service charge ada di `.env` (default: PB1 10%, service 0%):
```env
TAX_ENABLED=true
TAX_RATE=10
SERVICE_CHARGE_ENABLED=false
SERVICE_CHARGE_RATE=0
```
Setelah mengubah `.env`, jalankan `php artisan config:clear` dan restart `artisan serve`.

Contoh kode promo dari `PromotionSeeder`: `HEMAT10` (10%, min. Rp25.000), `POTONG5K` (Rp5.000, min. Rp30.000), `SENJA15` (15%, min. Rp50.000).

## Setup Frontend
```powershell
cd frontend
npm install
npm run dev
```
Frontend di `http://localhost:5173` (proxy `/api` & `/sanctum` ke backend). Build produksi: `npm run build`.

## Akun Demo (password: `password`)
| Peran | Email |
| --- | --- |
| Owner | owner@angkringan.test |
| Cashier | cashier@angkringan.test |
| Kitchen Staff | kitchen@angkringan.test |

## Catatan Aturan Bisnis
- Status order: `PENDING ? CONFIRMED ? PREPARING ? READY ? COMPLETED` (+`CANCELLED` dengan alasan). `COMPLETED` wajib sudah dibayar.
- POS membuat order `CONFIRMED`; pemesanan QR publik `PENDING`.
- QRIS pada sistem ini adalah **simulasi** (konfirmasi staf, bukan verifikasi gateway).
- Pengurangan stok berbasis resep/BOM saat pembayaran tercatat; pembatalan order yang sudah terdeduksi membuat movement kompensasi. Riwayat movement tidak dihapus.
- **Promo:** satu kode per pesanan, tanpa stacking. Kode harus aktif, dalam periode, dan subtotal memenuhi `min_order`. `PERCENTAGE` dibatasi maksimal 100%, `FIXED` dibatasi maksimal sebesar subtotal. Kode promo disimpan sebagai snapshot di order.
- **Perhitungan:** `service = subtotal × tarif_service`, `diskon` dihitung dari subtotal, `pajak = (subtotal − diskon + service) × tarif_pajak`, `total = subtotal − diskon + service + pajak`. Semua dihitung ulang di server; endpoint `POST /api/v1/pricing/preview` hanya untuk pratinjau frontend.

## Pengujian & Verifikasi
```powershell
# backend (dari folder backend)
C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe artisan config:clear
C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe artisan test
# frontend (dari folder frontend)
npm run build
```
Test backend mencakup alur pesanan, pembayaran publik (idempotent), serta perhitungan promo/pajak/service (`PricingTest`).

## Struktur Proyek
- `backend/` � Laravel API (`/api/v1`), migrasi, seeder, service (order/inventory), feature tests.
- `frontend/` � React + TS + Tailwind v4, TanStack Query, Zustand, Recharts.
- `docs/` � PRD & dokumen desain.
