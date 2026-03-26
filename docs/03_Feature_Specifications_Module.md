# Dokumen 03: Spesifikasi Fitur Detail & UX

## A. Authentication & Landing Page
- **UX/Visual**: Pendekatan desain *Split Screen* (Setengah layar memuat grafis branding interaktif/carousel fitur, setengah lainnya form otentikasi).
- **Penyempurnaan Fitur**:
  - Dukungan **Show/Hide Password** berupa ikon toggle mata (Eye Icon).
  - Fitur **Remember Me** menggunakan Local Storage untuk menyimpan token sementara.
  - **Validasi Realtime**: Teks peringatan merah dengan *shake animation* jika format email salah atau password kurang dari jumlah minimum, memanfaatkan skema Zod.
  - *Auto-focus* ke keranjang login saat diakses.

## B. Dashboard (The Command Center)

- **UX/Visual**:  
  Antarmuka berbasis **Dynamic Grid (Bento Box Style)** yang memungkinkan widget menyesuaikan ukuran berdasarkan prioritas data.  
  Menggunakan **Skeleton Screen** saat loading serta animasi **fade-in / slide-up** menggunakan *Framer Motion* untuk memberikan kesan modern dan premium.  
  Dashboard juga menampilkan **Real-time Clock** dan **Status Sinkronisasi Data** (Online / Offline) untuk memantau kondisi sistem secara langsung.

---

### 1. Widget Ringkasan Utama (Metrik Performa)

Menampilkan **4 Interactive Cards** yang menyajikan metrik bisnis utama dengan perbandingan performa **Day-on-Day**.

- **Total Omzet (Revenue)**  
  Menampilkan total pendapatan harian dalam format mata uang rupiah dengan pemisah ribuan.

- **Total Transaksi**  
  Jumlah keseluruhan transaksi atau nota yang tercatat dalam periode hari tersebut.

- **Produk Terjual**  
  Total volume barang yang berhasil terjual.

- **Estimasi Laba Kotor**  
  Perhitungan selisih antara **Total Penjualan** dan **Harga Pokok Penjualan (HPP)**.

- **Indikator Tren**  
  Setiap card dilengkapi badge indikator tren berupa persentase perubahan performa dibandingkan jam yang sama pada hari sebelumnya:
  - **Hijau (↑)** menunjukkan peningkatan performa
  - **Merah (↓)** menunjukkan penurunan performa

---

### 2. Smart Alerts Panel (Inventory Intelligence)

Widget berbentuk **tabel ringkas** yang menampilkan notifikasi stok berdasarkan logika **ambang batas dinamis (Threshold)**.

- **Status Badge**:
  - **Critical (Stok 0)** → Badge merah berkedip
  - **Warning (Di bawah batas aman)** → Badge oranye

- **Custom Threshold**  
  Admin dapat menentukan batas minimum stok berbeda untuk setiap produk.  
  Contoh:
  - Gas LPG → alert ketika stok tersisa **5**
  - Permen → alert ketika stok tersisa **20**

- **Batch Restock Action**  
  Menyediakan fitur pemilihan beberapa produk sekaligus dengan **checkbox** untuk membuat **Draft Purchase Order** kepada supplier secara otomatis.

---

### 3. Revenue & Product Analytics (Visualisasi Data)

Menampilkan analisis penjualan menggunakan **grafik interaktif** dengan library **Recharts**.

- **Sales Trend (Line Chart)**  
  Grafik garis yang menunjukkan tren penjualan dalam:
  - 24 jam terakhir
  - 7 hari terakhir

- **Top 5 Best Sellers (Donut / Bar Chart)**  
  Visualisasi produk yang memberikan **kontribusi profit terbesar**, bukan hanya berdasarkan jumlah unit terjual.

- **Hourly Busy Map**  
  Grafik batang sederhana yang menunjukkan **jam operasional tersibuk toko**, membantu pemilik usaha memonitor *peak hours*.
---
### 4. Cash Flow & Loyalty Snapshot
Widget tambahan untuk memberikan gambaran cepat terkait kondisi kas dan pelanggan.
- **Cash on Hand**  
  Menampilkan jumlah uang tunai yang tersedia di **laci kasir** saat ini, yang tersinkronisasi dengan proses **pembukaan shift kasir**.
- **New vs Returning Customer**  
  Rasio pelanggan baru dibandingkan pelanggan yang kembali berbelanja, yang dapat digunakan untuk menilai efektivitas layanan, promo, atau loyalitas pelanggan.
---
### 5. Quick Action Bar (Smart Shortcuts)
Kumpulan tombol aksi cepat yang dilengkapi dengan **Keyboard Shortcuts (Hotkeys)** untuk mempercepat alur kerja kasir.
- **Transaksi Baru [N]**  
  Membuka halaman **POS / Kasir** untuk memulai transaksi baru.
- **Input Stok [S]**  
  Membuka **modal form** untuk menambahkan stok produk secara cepat.
- **Cetak Laporan [P]**  
  Shortcut untuk mengekspor ringkasan laporan harian langsung ke **printer termal**.

## C. Menu Transaksi (Core POS)
Ini adalah modul yang paling krusial, di mana efisiensi dan kecepatan interaksi sangat diutamakan.
- **Layout Optimal**: Menggunakan perbandingan 2 Kolom (katalog barang 65%, bilah keranjang 35%). Pada tablet, rasio berubah dinamis. Pada mobile, keranjang otomatis bersembunyi sebagai *floating bottom sheet*.
- **Katalog & Pencarian**:
  - Navigasi kategori dalam bentuk *Pills/Tabs* geser horizontal (Swipeable).
  - Kolom pencarian dengan *auto-focus*, *clear button (x)*, dan pencarian instan (tanpa perlu tekan *Enter*).
  - *Virtualized List* / Grid jika data item mencapai ribuan.
- **Keranjang (Cart) & Transaksi**:
  - Item diperbarui menggunakan tombol `+` dan `-` berukuran sentuh (*touch-friendly*).
  - Mendukung input *Custom Discount* pada total transaksi atau item tertentu secara individu.
  - Fitur **Order Hold/Draft**: Tombol menahan keranjang pembeli saat pelanggan lain meminta dilayani terlebih dahulu.
- **Payment Panel**:
  - Menyediakan *Numpad Digital* (cocok untuk operasional tablet).
  - Tombol *Quick Cash* (nominal pintar berbasis total, misal Rp20.000, Rp50.000, dan "Uang Pas").
  - Integrasi Dummy QRIS berbentuk kode QR yang telah diupload oleh admin, jika belum maka opsi QRIS tidak tersedia.
  - Modal Sukses disertai animasi (*Confetti*) untuk sensasi gamifikasi.

## D. Inventory & Stock Management
- **Fitur Penyempurnaan**:
  - **Product Data Table**: Mendukung pengurutan (*Sorting*), fitur pencarian tabel, dan integrasi simulasi *Server-side Pagination*. Terdapat penanda warna (badge merah) otomatis jika stok kosong.
  - **Stock Adjustment Modal**: Modifikasi stok bukan sekadar update angka, tapi menyertakan *Log Alasan* (Misal: "Barang Rusak", "Masuk dari Supplier").
  - **Smart Batch Action**: Memungkinkan kasir untuk *check-box* banyak produk sekaligus kemudian melakukan *Bulk Delete* atau *Bulk Category Update*.

## E. Reports & Analytics
- **Fitur Penyempurnaan**:
  - Menyediakan komponen prapilih interval laporan waktu (Hari ini, 7 Hari Terakhir, Bulan Ini, Kustom *Date Picker*).
  - **Sistem Ekspor Dokumen**: Tersedia tombol simulasi untuk mengekstraksi data di Frontend menjadi *PDF* (melalui plugin kompilasi atau `window.print()` view) dan ekstensi *Excel/CSV*.
