# Dokumen 05: Roadmap Implementasi Proyek (Sprint Timeline)

Pendekatan menggunakan tahapan pengembangan tangkas (*Agile Sprint*), di mana satu Sprint direkomendasikan berjalan 1 hingga 2 minggu untuk fokus penuh dan *Code Review*.

## Sprint 1: Persiapan Fondasi & Modul Auth
- [ ] Inisialisasi basis proyek menggunakan `npm create vite@latest`.
- [ ] Instalasi dependensi: Tailwind CSS, sistem komponen Shadcn UI, dan ikon Lucide React.
- [ ] Membuat file konfigurasi aset dan `index.css` (Mendefinisikan *CSS Variables* untuk variabel Dark/Light mode).
- [ ] Menyiapkan arsitektur struktur rute aplikasi (`react-router-dom`) untuk Rute Publik dan Pribadi.
- [ ] Setup *Store* otentikasi standar (`Zustand`).
- [ ] Merancang iterasi UI halaman `Login` dengan layar terpisah (Split screen) dan simulasi masuk (membuat dummy session).

## Sprint 2: Master Layout & Dasbor Pintar
- [ ] Membuat komponen antarmuka pelindung (*Layout Containers*): Sidebar *collapsible*, Header Navigasi, serta Navigasi *Mobile*.
- [ ] Merancang antarmuka status Widget Card untuk ringkasan di Dasbor Utama.
- [ ] Memasang plugin grafik (*Recharts/Chart.js*) dan merender mock data omzet serta kategori penjualan.
- [ ] Implementasi tabel *Smart Alerts* (Peringatan Stok Menipis) di sisi kanan dasbor.
- [ ] Menguji coba transisi penuh tombol berganti tema (Dark Mode/Light Mode).

## Sprint 3: The POS Interface (Aplikasi Kasir Utama)
Sprint ini adalah inti dari aplikasi, di mana alur *frontend* akan paling berat diuji performanya.
- [ ] Membuat keranjang global `useCartStore.js` (dengan *middleware/persistency* *Local Storage*).
- [ ] Pembuatan `ProductCard` komponen katalog (*Grid rendering*).
- [ ] Desain mekanisme pencarian produk instan otomatis dan bilah geser untuk Kategori Barang.
- [ ] Perakitan Panel Pembayaran (Cart Area): Perhitungan diskon item vs diskon total, Kalkulasi subtotal, penghitungan uang susuk.
- [ ] Menambahkan *PaymentModal* berisi on-screen *Numpad*, *Quick Cash Buttons*, status QRIS dinamis statis.

## Sprint 4: Modul Manajemen Inventaris 
- [ ] Merancang desain tabel data (*Data Table*) cerdas yang mengakomodir fitur pengurutan (sorting), aksi cepat (hapus, *edit*).
- [ ] Melengkapi pusat dokumen *dummyData.js* pada layanan agar mewakili > 50 macam sampel produk.
- [ ] Pembuatan skema Modal Interaktif (Popup Form) untuk input `Tambah Produk` & `Edit Harga` menggunakan React Hook Form.
- [ ] Logika penyetelan (*Adjustment*) stok.

## Sprint 5: Manajemen Entitas Tambahan & Laporan
- [ ] Duplikasi perwujudan tabel inventaris untuk modul "Pelanggan / Anggota" dan "Daftar Supplier".
- [ ] Merancang layar `Laporan Penjualan` untuk peninjauan riwayat transaksi yang lalu.
- [ ] Implementasi kontrol *Date Range Picker* untuk melihat transaksi jangka waktu khusus.
- [ ] Menanamkan fitur simulasi (Fungsional UI) *"Eksport ke PDF / Excel"*.

## Sprint 6: Sentuhan Akhir & PWA Responsif
- [ ] Optimasi UX pada perangkat *Mobile*: Menyembunyikan komponen rumit, merilis *Bottom Navigation Bar* pengganti sidebar, menjadikan UI layar sentuh agar optimal.
- [ ] Konfigurasi `Vite PWA Plugin`: Penyusunan Manifest App (logo, warna status bar) dan pemasangan skrip *Service Worker* dasar.
- [ ] Audit Aksesibilitas warna & Audit Performa *Lighthouse*.
- [ ] Publikasi ke tahapan unjuk gelar interaktif (*Demo Deploy*) seperti Vercel atau Netlify.
