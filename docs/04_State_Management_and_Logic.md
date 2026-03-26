# Dokumen 04: Alur Kerja & State Management (Logic Flow)

Dalam arsitektur *frontend* modern, pengelolaan kondisi aplikasi (*state*) adalah jantung dari performa, terutama untuk sebuah sistem kasir yang menuntut interaksi sangat cepat.

## 1. Global State Management (Zustand)
Gunakan *Zustand* karena sangat ringan (kurang dari 1KB), memori-efisien, dan tidak membutuhkan boilerplate berat seperti Redux. Hal ini menghindari *re-rending* yang tidak perlu pada menu POS.
- **`useCartStore.js` (Cart State)**:
  - Menyimpan array `items` (id, harga, kuantitas, nama barang).
  - Memuat logika kalkulasi otomatis: pajak (Tax) dan diskon global.
  - **Penyempurnaan Utama**: Menggunakan *Zustand Middleware Persist* (localStorage). Hal ini memastikan jika kasir *refresh* browser (atau tab tak sengaja tertutup), produk yang dipindai pelanggan tidak tiba-tiba hilang.
- **`useAuthStore.js` (Auth State)**:
  - Menyimpan informasi pengguna (`user profile`) dan status kelayakan sesi.
- **`useAppStore.js` (UI State)**:
  - Menyimpan mode Sidebar (terbuka atau menciut) dan memori dari rentang tanggal laporan.

## 2. Abstraksi Data Services (Dummy Data Service)
Untuk mempercepat siklus awal dan mencegah kerusakan UI saat API *Backend* sudah siap.
```javascript
// Contoh lokasi: src/services/dummyData.js
export const fetchProductsMock = async () => {
  // Simulasi penundaan jaringan (*Network Delay*) sebesar 500ms
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: "P001", name: "Caffe Latte 1L", price: 65000, stock: 12, category: "Minuman" },
    // ... produk lainnya
  ];
};
```
Integrasi React Query / TanStack Query akan sangat berguna di fase ini agar pengelolaan *caching* & status muat (*loading states*) sudah matang.

## 3. Dinamisme Theming (Dark Mode Logic)
Kita merancang tema berdasarkan spesifikasi *CSS Variables* yang disisipkan Tailwind CSS via kelas global (`.dark`).
- **Logika Peralihan**: Hook khusus `useTheme` yang mengatur dan membaca preferensi utama perangkat (melalui `window.matchMedia`) dengan fallback via tombol toggle di menu *Settings/Header*.
- Transisi antartema disertai *CSS transition* yang lembut (300ms) pada atribut `background-color` dan warna border.

## 4. Route Guards & Security (Meskipun Frontend Only)
Alur Kerja menyertakan konsep pembagian *Router*:
- **`PublicRoute`**: Rute terbuka (Misal: `/login`, `/register`). Setelah token disahkan, rute ini akan mengarah otomatis ke `/dashboard`.
- **`PrivateRoute`**: Rute pengaman. Jika modul mendeteksi otentikasi palsu (token habis), secara proaktif aplikasi me-*redirect* memori rekam jejak (*history path*) menuju laman login, lalu meneruskan user ke laman semula pasca berhasil masuk.
