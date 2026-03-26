# Dokumen 10: Roadmap Implementasi Backend Laravel (Sprints)

Timeline pengembangan ini dikalibrasikan agar dapat dikerjakan secara paralel (paralel dengan tim frontend atau dikerjakan bergantian layaknya **Full-Stack Developer**).

## Sprint 1: Inisialisasi, Database, dan Autentikasi
- [ ] Install Laravel 11.
- [ ] Konfigurasi `.env` untuk koneksi PostgreSQL/MySQL lokal.
- [ ] Install dan konfigurasi **Laravel Sanctum**.
- [ ] Pembuatan `Migration` dan `Seeder` untuk tabel User/Admin asali.
- [ ] Membentuk API endpoint autentikasi (Login dan Logout endpoint).
- [ ] *Testing Endpoint* Auth menggunakan Postman/Bruno.

## Sprint 2: Master Data & Manajemen Inventaris
Fase ini menyangkut persiapan bahan yang akan dijual.
- [ ] Pembuatan struktur Model, FormRequest, & Controller (`Category` & `Product`).
- [ ] Pembuatan tabel relasi dan penyiapan skema `SoftDeletes`.
- [ ] Pembuatan endpoint CRUD untuk Kategori dan Produk dengan fitur *FIltering* dasar.
- [ ] Meracik `ProductSeeder` agar Frontend gampang menerima data dummy awal berjumlah $\pm$ 50 variasi.

## Sprint 3: Mesin Inti Kasir (Transaksional)
Fase paling rawan bug, pengerjaan harus teliti.
- [ ] Setup schema `transactions`, `transaction_details`, dan enum metode pembayaran.
- [ ] Pembuatan `TransactionService` untuk merekayasa *Checkout* yang menggunakan pengamanan `DB::transaction()`.
- [ ] Pembuatan penahan stok ganda (*Race Condition* prevention), memvalidasi stok real di database ketika order diajukan.
- [ ] Pembuatan endpoint List History Tranasaksi beserta *Resource API* formatnya (*Nested data*).

## Sprint 4: Modul Stok Adjustment & Master Extra
- [ ] Fitur rekam jejak Audit Stok (Fitur In/Out manual disertai *reasoning*).
- [ ] CRUD untuk entitas Pelanggan (`Customer`).
- [ ] Modifikasi sistem diskon pada *Transaction Checkout* agar menyerap logika keanggotaan/pelanggan, jika fitur itu dirancang.

## Sprint 5: Agregasi Analitik & Keamanan API
Sprint penutup sebelum *deployment*.
- [ ] Penulisan Eloquent *raw queries* tingkat lanjut untuk memberikan respons metrik pada halaman Dashboard (Pendapatan Hari Ini, dsb).
- [ ] Penyiapan API list produk peringatan *Low Stock Limits*.
- [ ] Konfigurasi **CORS** di `config/cors.php` Laravel untuk membuka pintu izin bagi port localhost React (`http://localhost:5173`).
- [ ] Refactoring akhir, optimalisasi performa (Index DB).

---

### Cara Mengawinkan Frontend (React) dengan Laravel
Di akhir Sprint ini, aplikasi React di sisi frontend hanya perlu mengganti alias alamat base API-nya:
*Dari* -> *Dummy Data Service*
*Menjadi* -> `axios.defaults.baseURL = 'http://localhost:8000/api/v1';`
