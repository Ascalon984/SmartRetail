# Dokumen 02: Arsitektur Struktur Folder

Struktur folder ini dirancang berdasarkan prinsip *Separation of Concerns* agar proyek tetap mudah dipelihara (maintainable) saat berpindah dari *dummy data* ke integrasi API sungguhan.

## Struktur Direktori Utama
```text
src/
 ├── assets/          # Logo, Illustrations, images, dan file global/index.css
 ├── components/      # Reusable UI Components
 │    ├── ui/         # Base components (Button, Input, Card, Modal - dari Shadcn)
 │    ├── layout/     # Sidebar, Header/Navbar, MobileNav, MainLayout
 │    ├── pos/        # POS specific: Katalog Produk, CartItem, PaymentModal, Numpad
 │    ├── charts/     # SalesChart, DonutChart (Recharts/Chart.js)
 │    └── shared/     # Komponen standar global (ConfirmDialog, Loader, Badge)
 ├── config/          # Konfigurasi aplikasi (environment variables, pengaturan tema)
 ├── hooks/           # Custom Hooks pendukung komponen (useMediaQuery, useClickOutside)
 ├── pages/           # Page Containers (Komponen tingkat halaman)
 │    ├── auth/       # Login, Register, Forgot Password
 │    ├── dashboard/  # Analytics Overview & Command Center
 │    ├── pos/        # POS / Transaction Interface (Halaman Kasir Utama)
 │    ├── inventory/  # Product List, Categories, Stock Management
 │    ├── contacts/   # Customer & Supplier Management
 │    ├── settings/   # Konfigurasi Toko, Profil Pengguna
 │    └── reports/    # Sales, Financial & Stock Reports
 ├── router/          # App Routes (Definisi Public Route vs Private Route)
 ├── store/           # Global State Management (Zustand)
 │    ├── useAuthStore.js  # Mengelola sesi dan token pengguna
 │    ├── useCartStore.js  # Mengelola state keranjang belanja
 │    └── useAppStore.js   # Mengelola state tema UI dan sidebar
 ├── utils/           # Helper functions murni (formatCurrency, formatDate)
 └── services/        # Layer Akses Data & API
      ├── dummyData/  # File pendukung berisi JSON mock data
      └── api/        # File konfigurasi utama Axios (Base URL, Interceptors)
```

## Penjelasan Penyempurnaan:
1. **Pemisahan `components/ui/` dan komponen fitur**: Menghindari tercampurnya tombol dasar dengan logika berat seperti `PaymentModal`.
2. **Layer `services/`**: Sangat mempermudah migrasi dari *dummy data* ke API produksi. Komponen React di dalam folder `pages/` hanya akan memanggil fungsi ekspor dari layer ini tanpa peduli darimana data itu berasal.
3. **Penyatuan `pos/` di halaman dan komponen**: Mengisolasi logika core aplikasi agar performa kalkulasi keranjang optimal.
