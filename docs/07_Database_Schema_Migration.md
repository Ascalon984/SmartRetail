# Dokumen 07: Desain Schema Skema Database (ERD)

Desain database ini mengadopsi pendekatan normalisasi agar pelaporan penjualan dan stok menjadi akurat.

## 1. Tabel Master (Entitas Dasar)
### `users` (Kasir, Admin, Manajer)
- `id`, `name`, `email`, `password`, `role` (enum: admin, cashier).

### `categories`
- `id`, `name`, `slug`, `icon` (opsional), `is_active` (boolean).

### `products`
- `id`, `category_id` (FK), `sku` (unique), `name`, `description`, `price` (decimal), `cost_price` (decimal/harga modal), `stock` (integer).
- `barcode` (string, untuk scanner), `image` (string/URL).

### `customers` & `suppliers`
- `id`, `name`, `phone`, `email`, `address`.

## 2. Tabel Transaksi (Inti POS)
### `transactions` (Header Penjualan)
- `id`, `invoice_number` (string unique), `user_id` (FK - Kasir yg bertugas), `customer_id` (FK nullable).
- `total_price` (decimal), `discount` (decimal), `tax` (decimal), `grand_total` (decimal).
- `payment_method` (enum: cash, qris, debit), `payment_amount` (bayar uang pas/lebih), `change_amount` (kembalian).
- `status` (enum: success, hold, cancelled).
- `created_at` (timestamp, penting untuk analitik harian).

### `transaction_details` (Item Pembelian)
- `id`, `transaction_id` (FK), `product_id` (FK).
- `quantity` (integer).
- `unit_price` (decimal - snapshot harga saat dibeli, antisipasi perubahan harga di masa depan).
- `discount` (decimal - diskon per item).
- `subtotal` (decimal).

## 3. Tabel Riwayat Inventaris (Audit Trail)
### `stock_adjustments` (Riwayat Perubahan Stok)
Penting untuk audit agar tidak ada kecurangan kasir/admin.
- `id`, `product_id` (FK), `user_id` (FK - Siapa yang mengubah).
- `type` (enum: in, out), `quantity` (integer).
- `reason` (string, misal: "Barang rusak", "Penerimaan supplier", "Koreksi manual").
- `created_at` (timestamp).

## 4. Fitur Soft Deletes
Gunakan trait `SoftDeletes` bawaan Laravel pada tabel `products` dan `categories`. Saat produk dihapus, ia tidak benar-benar terhapus dari tabel sehingga riwayat `transaction_details` lama yang menggunakan ID produk tersebut tidak akan *error* (broken referential integrity).
