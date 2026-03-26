# Dokumen 08: Rancangan API Endpoints (Routing)

API ini mengikuti kaidah RESTful, menggunakan prefix `/api/v1/`. Menggunakan Laravel Resource Routing (`Route::apiResource`).

## 1. Authentication Endpoints (`/api/v1/auth`)
- `POST /login` $\rightarrow$ Validasi kredensial dan kembalikan *Sanctum Token* + Data User.
- `POST /logout` $\rightarrow$ Hapus token. (Membutuhkan header otentikasi).
- `GET  /me` $\rightarrow$ Cek sesi / profil user saat ini.

> **Catatan**: Semua rute di bawah ini wajib menggunakan *Sanctum Middleware* (`auth:sanctum`).

## 2. Master Data (Inventory)
### `/api/v1/products`
- `GET    /products` $\rightarrow$ Ambil list produk ( Mendukung *query param*: `?search=kopi&category_id=2&sort=price_desc`).
- `POST   /products` $\rightarrow$ Tambah produk baru.
- `GET    /products/{id}` $\rightarrow$ Detail produk.
- `PUT    /products/{id}` $\rightarrow$ Update produk.
- `DELETE /products/{id}` $\rightarrow$ Hapus produk (*Soft Delete*).

### `/api/v1/categories` & `/api/v1/customers`
- Mendukung metode CRUD dasar yang mirip dengan Products.

## 3. Stock Management (`/api/v1/inventory`)
- `POST /inventory/adjust` $\rightarrow$ Melakukan aksi *restock* atau penyesuaian stok manual. Endpoint ini akan mencatat aktivitas ke tabel `stock_adjustments`.
- `GET  /inventory/logs` $\rightarrow$ Mengambil riwayat mutasi stok.

## 4. Transaksi (Core POS API) `/api/v1/transactions`
- `POST /transactions/checkout` $\rightarrow$ **Endpoint paling kompleks**.
  - **Payload**: Menerima data array items (produk, qty, harga, diskon custom), tipe pembayaran, jumlah uang bayar.
  - **Tugas Internal**: Memvalidasi kecukupan stok seluruh orderan, menyimpan `transactions`, menyimpan `transaction_details`, memotong stok barang di tabel `products`, mengkalkulasi kembalian.
- `GET  /transactions` $\rightarrow$ Menampilkan riwayat transaksi (Mendukung filter by tanggal `?date_start=xxx&date_end=xxx`).
- `GET  /transactions/{invoice}` $\rightarrow$ Rincian detail nota.

## 5. Dashboard & Analytics (`/api/v1/reports`)
Ini ditugaskan agar frontend ringan, proses agregasi/grouping diserahkan ke Query DB (Eloquent raw queries):
- `GET /reports/summary` $\rightarrow$ Mengembalikan data JSON ringan: Omzet hari ini, Transaksi total hari ini.
- `GET /reports/low-stock` $\rightarrow$ Mengembalikan list produk dengan stok $\le$ batas minimum (untuk *Smart Alerts* dasbor).
- `GET /reports/chart-sales` $\rightarrow$ Memberikan array *time-series* untuk grafik bar/line React.
