# Dokumen 09: Standar Respons & Service Logic (Laravel)

Agar sistem komunikasi antara *Frontend* React.js dan *Backend* Laravel berjalan mulus (minim error *undefined vars*), seluruh API keluaran akan menggunakan **Standar Format JSON Konsisten** dengan bantuan *Laravel API Resources*.

## 1. Standarisasi JSON Response
Setiap respons (Berhasil atau Gagal) memiliki pembungkus standar:
```json
{
  "success": true,
  "message": "Transaksi berhasil diproses",
  "data": { ... },       // Bisa berisi Object atau Array
  "meta": {              // Disertakan jika ada keperluan seperti Pagination
    "current_page": 1,
    "last_page": 5
  }
}
```

Format *Error Validation* Laravel bawaan sudah sangat baik ditangkap oleh Frontend.
Misalnya `422 Unprocessable Entity`:
```json
{
  "message": "Gagal menyimpan karena input salah",
  "errors": {
    "email": ["Email sudah digunakan."],
    "items.0.qty": ["Stok produk Caffe Latte tidak mencukupi."]
  }
}
```

## 2. Pengamanan Transaksi dengan Database Transactions (PENTING)
Dalam bisnis POS, integritas transaksi adalah nyawa. Ketika Kasir menekan bayar, API `/api/v1/transactions/checkout` **harus** membungkus proses insert dan pemotongan stok ke dalam `DB::transaction()`.

**Mengapa ini kritis?**
Jika saat menyimpan struk berhasil, namun saat memotong stok gagal (misal server tiba-tiba down/crash), keseluruhan proses akan di-*Rollback*. Database tidak akan "kotor" dan stok gagal dipotong tanpa ada rekaman pendapatannya.

**Contoh Logic pada `TransactionService.php`:**
```php
DB::beginTransaction();
try {
    // 1. Validasi ulang stok (mencegah Race Condition jika kasir lain membeli di detik yg sama)
    // 2. Insert ke tabel 'transactions'
    // 3. Loop insert ke 'transaction_details' beserta memotong field 'stock' di tabel 'products'
    
    DB::commit();
    return $transactionData;
} catch (\Exception $e) {
    DB::rollBack();
    throw $e; // Memancing error response 500 dan message ditangkap alert frontend
}
```

## 3. Optimasi Kueri (Eager Loading)
Hindari masalah N+1 Query. Saat melakukan *GET Transactions*, pastikan merelasikan dengan kasir dan rincian pembelanjaannya dari awal di Controller:
```php
// Baik (Mencegah ratusan query)
$transactions = Transaction::with(['user:id,name', 'items.product:id,name'])->get(); 
```
