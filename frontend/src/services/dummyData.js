// ==============================
// DUMMY DATA SERVICE — SmartRetail POS
// Replace imports with API service when backend is ready
// ==============================

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

// ===== CATEGORIES =====
export const categories = [
  { id: 1, name: 'Semua', slug: 'all', icon: '🏷️', is_active: true },
  { id: 2, name: 'Minuman', slug: 'minuman', icon: '☕', is_active: true },
  { id: 3, name: 'Makanan', slug: 'makanan', icon: '🍔', is_active: true },
  { id: 4, name: 'Snack', slug: 'snack', icon: '🍿', is_active: true },
  { id: 5, name: 'Rokok', slug: 'rokok', icon: '🚬', is_active: true },
  { id: 6, name: 'Kebersihan', slug: 'kebersihan', icon: '🧹', is_active: true },
  { id: 7, name: 'ATK', slug: 'atk', icon: '✏️', is_active: true },
  { id: 8, name: 'Frozen', slug: 'frozen', icon: '🧊', is_active: true },
];

// ===== PRODUCTS =====
export const products = [
  { id: 'P001', name: 'Caffe Latte 1L', sku: 'SKU-001', price: 65000, cost_price: 45000, stock: 12, category_id: 2, barcode: '8991234001', image: null },
  { id: 'P002', name: 'Es Teh Manis', sku: 'SKU-002', price: 8000, cost_price: 3000, stock: 50, category_id: 2, barcode: '8991234002', image: null },
  { id: 'P003', name: 'Americano Hot', sku: 'SKU-003', price: 28000, cost_price: 15000, stock: 20, category_id: 2, barcode: '8991234003', image: null },
  { id: 'P004', name: 'Matcha Latte', sku: 'SKU-004', price: 35000, cost_price: 20000, stock: 8, category_id: 2, barcode: '8991234004', image: null },
  { id: 'P005', name: 'Fresh Orange Juice', sku: 'SKU-005', price: 22000, cost_price: 12000, stock: 15, category_id: 2, barcode: '8991234005', image: null },
  { id: 'P006', name: 'Nasi Goreng Spesial', sku: 'SKU-006', price: 25000, cost_price: 15000, stock: 30, category_id: 3, barcode: '8991234006', image: null },
  { id: 'P007', name: 'Mie Ayam Bakso', sku: 'SKU-007', price: 20000, cost_price: 12000, stock: 25, category_id: 3, barcode: '8991234007', image: null },
  { id: 'P008', name: 'Ayam Geprek', sku: 'SKU-008', price: 22000, cost_price: 13000, stock: 18, category_id: 3, barcode: '8991234008', image: null },
  { id: 'P009', name: 'Soto Ayam', sku: 'SKU-009', price: 18000, cost_price: 10000, stock: 22, category_id: 3, barcode: '8991234009', image: null },
  { id: 'P010', name: 'Indomie Goreng', sku: 'SKU-010', price: 5000, cost_price: 3200, stock: 100, category_id: 3, barcode: '8991234010', image: null },
  { id: 'P011', name: 'Chitato Original 68g', sku: 'SKU-011', price: 12000, cost_price: 9000, stock: 40, category_id: 4, barcode: '8991234011', image: null },
  { id: 'P012', name: 'Oreo 137g', sku: 'SKU-012', price: 15000, cost_price: 11000, stock: 35, category_id: 4, barcode: '8991234012', image: null },
  { id: 'P013', name: 'Tango Wafer Coklat', sku: 'SKU-013', price: 8500, cost_price: 6000, stock: 45, category_id: 4, barcode: '8991234013', image: null },
  { id: 'P014', name: 'Pocky Strawberry', sku: 'SKU-014', price: 14000, cost_price: 10500, stock: 28, category_id: 4, barcode: '8991234014', image: null },
  { id: 'P015', name: 'Surya Pro Mild 16', sku: 'SKU-015', price: 28000, cost_price: 24000, stock: 60, category_id: 5, barcode: '8991234015', image: null },
  { id: 'P016', name: 'Sampoerna Mild 16', sku: 'SKU-016', price: 32000, cost_price: 28000, stock: 55, category_id: 5, barcode: '8991234016', image: null },
  { id: 'P017', name: 'Sabun Cuci Piring 800ml', sku: 'SKU-017', price: 14000, cost_price: 10000, stock: 20, category_id: 6, barcode: '8991234017', image: null },
  { id: 'P018', name: 'Pewangi Pakaian 1L', sku: 'SKU-018', price: 18000, cost_price: 13000, stock: 15, category_id: 6, barcode: '8991234018', image: null },
  { id: 'P019', name: 'Buku Tulis A5 40 Lembar', sku: 'SKU-019', price: 5000, cost_price: 3000, stock: 80, category_id: 7, barcode: '8991234019', image: null },
  { id: 'P020', name: 'Pulpen Pilot BP-1', sku: 'SKU-020', price: 4000, cost_price: 2500, stock: 90, category_id: 7, barcode: '8991234020', image: null },
  { id: 'P021', name: 'Nugget Ayam 500g', sku: 'SKU-021', price: 35000, cost_price: 27000, stock: 10, category_id: 8, barcode: '8991234021', image: null },
  { id: 'P022', name: 'Sosis Sapi Frozen 1kg', sku: 'SKU-022', price: 45000, cost_price: 35000, stock: 3, category_id: 8, barcode: '8991234022', image: null },
  { id: 'P023', name: 'Kentang Beku 1kg', sku: 'SKU-023', price: 38000, cost_price: 28000, stock: 5, category_id: 8, barcode: '8991234023', image: null },
  { id: 'P024', name: 'Dimsum Hakau 10pcs', sku: 'SKU-024', price: 30000, cost_price: 22000, stock: 7, category_id: 8, barcode: '8991234024', image: null },
];

// ===== SUPPLIERS =====
export const suppliers = [
  { id: 1, name: 'PT. Indofood Sukses Makmur', phone: '021-5795-8822', email: 'info@indofood.co.id', address: 'Jakarta' },
  { id: 2, name: 'CV. Fresh Supplier', phone: '022-1234-5678', email: 'fresh@supplier.id', address: 'Bandung' },
  { id: 3, name: 'UD. Sumber Rejeki', phone: '031-9876-5432', email: 'sumber@rejeki.id', address: 'Surabaya' },
];

// ===== STAFF / TEAM =====
export const staffMembers = [
  { id: 1, name: 'Andi Pratama', email: 'andi@smartretail.com', role: 'owner', status: 'active', avatar: null, joined_at: '2025-01-15T08:00:00', last_active: '2026-03-22T04:00:00' },
  { id: 2, name: 'Admin SmartRetail', email: 'admin@smartretail.com', role: 'admin', status: 'active', avatar: null, joined_at: '2025-02-01T09:00:00', last_active: '2026-03-22T03:30:00' },
  { id: 3, name: 'Dewi Lestari', email: 'dewi@smartretail.com', role: 'cashier', status: 'active', avatar: null, joined_at: '2025-06-10T08:00:00', last_active: '2026-03-21T17:00:00' },
  { id: 4, name: 'Rizki Maulana', email: 'rizki@smartretail.com', role: 'cashier', status: 'active', avatar: null, joined_at: '2025-08-20T08:00:00', last_active: '2026-03-21T16:30:00' },
  { id: 5, name: 'Sari Putri', email: 'sari@smartretail.com', role: 'cashier', status: 'pending', avatar: null, joined_at: null, last_active: null },
];

export const roleLabels = { owner: 'Owner', admin: 'Admin', cashier: 'Kasir' };
export const roleColors = { owner: '#6366f1', admin: '#f59e0b', cashier: '#10b981' };

// ===== TRANSACTIONS (Extended — 15 entries for richer history) =====
export const transactions = [
  { id: 1,  invoice: 'INV-20260322-001', cashier: 'Admin',        items_count: 4, total: 185000, discount: 5000,  tax: 19800,  grand_total: 199800, payment_method: 'cash',  payment_amount: 200000, change: 200, status: 'success',   created_at: '2026-03-22T08:12:00' },
  { id: 2,  invoice: 'INV-20260322-002', cashier: 'Dewi Lestari', items_count: 2, total: 53000,  discount: 0,     tax: 5830,   grand_total: 58830,  payment_method: 'qris',  payment_amount: 58830,  change: 0,   status: 'success',   created_at: '2026-03-22T08:45:00' },
  { id: 3,  invoice: 'INV-20260322-003', cashier: 'Rizki Maulana',items_count: 6, total: 122000, discount: 10000, tax: 12320,  grand_total: 124320, payment_method: 'cash',  payment_amount: 125000, change: 680, status: 'success',   created_at: '2026-03-22T09:15:00' },
  { id: 4,  invoice: 'INV-20260322-004', cashier: 'Admin',        items_count: 1, total: 32000,  discount: 0,     tax: 3520,   grand_total: 35520,  payment_method: 'debit', payment_amount: 35520,  change: 0,   status: 'success',   created_at: '2026-03-22T09:50:00' },
  { id: 5,  invoice: 'INV-20260322-005', cashier: 'Dewi Lestari', items_count: 3, total: 78000,  discount: 5000,  tax: 8030,   grand_total: 81030,  payment_method: 'cash',  payment_amount: 100000, change: 18970,status: 'success',  created_at: '2026-03-22T10:20:00' },
  { id: 6,  invoice: 'INV-20260321-001', cashier: 'Admin',        items_count: 5, total: 210000, discount: 15000, tax: 21450,  grand_total: 216450, payment_method: 'qris',  payment_amount: 216450, change: 0,   status: 'success',   created_at: '2026-03-21T09:00:00' },
  { id: 7,  invoice: 'INV-20260321-002', cashier: 'Rizki Maulana',items_count: 2, total: 46000,  discount: 0,     tax: 5060,   grand_total: 51060,  payment_method: 'cash',  payment_amount: 55000,  change: 3940,status: 'success',  created_at: '2026-03-21T10:30:00' },
  { id: 8,  invoice: 'INV-20260321-003', cashier: 'Dewi Lestari', items_count: 8, total: 165000, discount: 8000,  tax: 17270,  grand_total: 174270, payment_method: 'cash',  payment_amount: 175000, change: 730, status: 'success',   created_at: '2026-03-21T12:15:00' },
  { id: 9,  invoice: 'INV-20260321-004', cashier: 'Admin',        items_count: 3, total: 95000,  discount: 0,     tax: 10450,  grand_total: 105450, payment_method: 'debit', payment_amount: 105450, change: 0,   status: 'success',   created_at: '2026-03-21T14:00:00' },
  { id: 10, invoice: 'INV-20260321-005', cashier: 'Rizki Maulana',items_count: 1, total: 28000,  discount: 0,     tax: 3080,   grand_total: 31080,  payment_method: 'cash',  payment_amount: 50000,  change: 18920,status: 'success', created_at: '2026-03-21T15:30:00' },
  { id: 11, invoice: 'INV-20260320-001', cashier: 'Admin',        items_count: 4, total: 140000, discount: 5000,  tax: 14850,  grand_total: 149850, payment_method: 'cash',  payment_amount: 150000, change: 150, status: 'success',   created_at: '2026-03-20T09:00:00' },
  { id: 12, invoice: 'INV-20260320-002', cashier: 'Dewi Lestari', items_count: 7, total: 198000, discount: 10000, tax: 20680,  grand_total: 208680, payment_method: 'qris',  payment_amount: 208680, change: 0,   status: 'success',   created_at: '2026-03-20T11:00:00' },
  { id: 13, invoice: 'INV-20260319-001', cashier: 'Admin',        items_count: 2, total: 60000,  discount: 0,     tax: 6600,   grand_total: 66600,  payment_method: 'cash',  payment_amount: 70000,  change: 3400,status: 'success',  created_at: '2026-03-19T10:00:00' },
  { id: 14, invoice: 'INV-20260318-001', cashier: 'Rizki Maulana',items_count: 5, total: 175000, discount: 10000, tax: 18150,  grand_total: 183150, payment_method: 'debit', payment_amount: 183150, change: 0,   status: 'success',   created_at: '2026-03-18T09:30:00' },
  { id: 15, invoice: 'INV-20260322-006', cashier: 'Admin',        items_count: 3, total: 45000,  discount: 0,     tax: 4950,   grand_total: 49950,  payment_method: 'cash',  payment_amount: 50000,  change: 50,  status: 'hold',      created_at: '2026-03-22T10:45:00' },
];

// ===== DASHBOARD ANALYTICS =====
export const dashboardStats = {
  todayRevenue: 499500,
  yesterdayRevenue: 578310,
  todayTransactions: 6,
  yesterdayTransactions: 5,
  todayItemsSold: 19,
  yesterdayItemsSold: 19,
  avgTransactionValue: 83250,
  yesterdayAvgValue: 115662,
  todayProfit: 148500,
  yesterdayProfit: 172000,
};

export const lowStockProducts = products.filter((p) => p.stock <= 10);

export const salesChartData = [
  { date: 'Sen', revenue: 450000, profit: 135000, transactions: 8 },
  { date: 'Sel', revenue: 380000, profit: 114000, transactions: 6 },
  { date: 'Rab', revenue: 520000, profit: 156000, transactions: 9 },
  { date: 'Kam', revenue: 490000, profit: 147000, transactions: 7 },
  { date: 'Jum', revenue: 610000, profit: 183000, transactions: 11 },
  { date: 'Sab', revenue: 780000, profit: 234000, transactions: 15 },
  { date: 'Min', revenue: 420000, profit: 126000, transactions: 6 },
];

export const hourlyData = [
  { hour: '08', revenue: 85000 }, { hour: '09', revenue: 125000 },
  { hour: '10', revenue: 95000 }, { hour: '11', revenue: 110000 },
  { hour: '12', revenue: 180000 }, { hour: '13', revenue: 145000 },
  { hour: '14', revenue: 90000 }, { hour: '15', revenue: 75000 },
  { hour: '16', revenue: 105000 }, { hour: '17', revenue: 130000 },
];

export const categoryPieData = [
  { name: 'Minuman', value: 35, fill: '#6366f1' },
  { name: 'Makanan', value: 28, fill: '#f59e0b' },
  { name: 'Snack', value: 18, fill: '#10b981' },
  { name: 'Rokok', value: 12, fill: '#ef4444' },
  { name: 'Lainnya', value: 7, fill: '#8b5cf6' },
];

export const paymentMethodData = [
  { name: 'Tunai', value: 55, fill: '#10b981' },
  { name: 'QRIS', value: 30, fill: '#6366f1' },
  { name: 'Debit', value: 15, fill: '#f59e0b' },
];

// ===== ASYNC FETCHERS =====
export const fetchProducts = async (categoryId = null, search = '') => {
  await delay();
  let result = [...products];
  if (categoryId && categoryId !== 1) result = result.filter((p) => p.category_id === categoryId);
  if (search) { const q = search.toLowerCase(); result = result.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)); }
  return result;
};
export const fetchCategories = async () => { await delay(150); return categories; };
export const fetchDashboardStats = async () => { await delay(250); return dashboardStats; };
export const fetchTransactions = async () => { await delay(); return transactions; };
export const fetchSuppliers = async () => { await delay(); return suppliers; };
export const fetchStaff = async () => { await delay(200); return staffMembers; };
