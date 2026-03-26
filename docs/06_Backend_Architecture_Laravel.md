# Dokumen 06: Arsitektur Backend (Laravel) & Teknologi

## 1. Rekomendasi Teknologi Backend
Menggunakan **Laravel** sebagai backend untuk aplikasi SmartRetail POS adalah **pilihan yang sangat direkomendasikan dan luar biasa**. Laravel memiliki ekosistem yang sangat matang untuk membangun RESTful API yang aman, stabil, dan *scalable* yang akan melayani frontend React.js kita.

**Tech Stack Backend Utama:**
- **Framework**: Laravel 11 (versi terbaru, minimalis dan modern).
- **Database**: PostgreSQL atau MySQL (PostgreSQL direkomendasikan untuk skalabilitas fitur inventory & laporan analitik transaksi).
- **Authentication**: **Laravel Sanctum** (Sangat cocok dan ringan untuk otentikasi SPA/Frontend terpisah seperti React).
- **API Formatting**: Laravel Eloquent API Resources (untuk standarisasi format JSON/Response).

## 2. Alasan Memilih Laravel untuk SmartRetail POS
1. **Keamanan (Security)**: Laravel Sanctum memberikan perlindungan OTP/Token CSRF dengan manajemen *stateful* atau *token-based* yang solid.
2. **Eloquent ORM**: Memudahkan pengelolaan relasi kompleks (misalnya: Transaksi $\rightarrow$ Detail Transaksi $\rightarrow$ Produk $\rightarrow$ Kategori).
3. **Validasi (Form Requests)**: Memastikan data yang dikirim dari React frontend selalu bersih dan valid sebelum menyentuh database.
4. **Ekosistem Reporting**: Mudah digabungkan dengan library export (seperti `maatwebsite/excel` atau `barryvdh/laravel-dompdf`) jika di tahap selanjutnya (*Sprint masa depan*) fitur PDF *Exporting* dipindah dari frontend ke backend.

## 3. Arsitektur Pola Desain (Design Pattern)
Agar source code tidak menumpuk di Controller, kita akan menerapkan **Service-Repository Pattern** (atau minimal *Service Classes*):
- **Controllers**: Hanya menangani HTTP Request, memanggil form validation, dan mengembalikan HTTP Response (menggunakan API Resource).
- **Services (Business Logic)**: Menangani logika berat seperti menghitung total transaksi, memotong stok inventoris secara transaksional (DB Transaction).
- **Models / Repositories**: Menangani interaksi ke Database (Eloquent).

## 4. Struktur Folder Relevan dalam Laravel
```text
app/
 ├── Http/
 │    ├── Controllers/
 │    │    └── Api/          # Semua Controller berbasis API (v1)
 │    ├── Requests/          # Custom Form Requests untuk validasi input (StoreProductRequest, CheckOutRequest)
 │    └── Resources/         # API Resource untuk format/transformasi JSON response
 ├── Models/                 # Eloquent Models (Product, Transaction, User)
 └── Services/               # (Folder Kustom) Berisi class logika bisnis terpusat seperti TransactionService.php
routes/
 └── api.php                 # Rute semua endpoint API
```
