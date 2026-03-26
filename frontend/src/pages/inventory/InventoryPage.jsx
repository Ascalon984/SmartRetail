import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, Edit3, Trash2, Package, ChevronLeft, ChevronRight, X, Check, ImagePlus, UploadCloud, ArrowUpRight, FileDown, RotateCcw, AlertTriangle } from 'lucide-react';
import { fetchProducts, categories as initialCategories } from '../../services/dummyData';
import { formatCurrency } from '../../utils/formatters';

// Utility for debouncing
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

// ===== PRODUCT FORM MODAL =====
function ProductFormModal({ product, categories, onSave, onClose, onAddCategory }) {
    const [form, setForm] = useState(
        product || { name: '', sku: '', price: '', cost_price: '', stock: '', category_id: 2, image_url: '' }
    );
    const [imagePreview, setImagePreview] = useState(product?.image_url || null);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category_id' && value === 'new') {
            setIsAddingCategory(true);
            return;
        }
        setForm((prev) => ({ ...prev, [name]: name === 'category_id' ? Number(value) : value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImagePreview(url);
            setForm(prev => ({ ...prev, image_url: url }));
        }
    };

    const handleSaveNewCategory = () => {
        if (newCategoryName.trim()) {
            const newCat = onAddCategory(newCategoryName);
            setForm(prev => ({ ...prev, category_id: newCat.id }));
            setIsAddingCategory(false);
            setNewCategoryName('');
        }
    };

    const profit = Number(form.price) - Number(form.cost_price);
    const margin = Number(form.price) > 0 ? ((profit / Number(form.price)) * 100).toFixed(1) : 0;

    const isFormValid = form.name && form.sku && form.price && form.cost_price && form.stock !== '' && imagePreview;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl animate-scale-in"
                style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>

                <div className="flex items-center justify-between mb-5 border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
                    <h3 className="text-xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                        {product ? 'Edit Produk' : 'Tambah Produk Baru'}
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" style={{ color: 'var(--color-text-muted)' }}><X className="w-5 h-5" /></button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Image Upload (WAJIB) */}
                    <div className="md:w-1/3 flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Foto Produk <span className="text-red-500">*</span></label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group
                                ${imagePreview ? 'border-transparent' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                            style={{ background: imagePreview ? 'transparent' : 'var(--color-surface-100)' }}
                        >
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-bold flex items-center gap-1.5"><Edit3 className="w-3.5 h-3.5" /> Ganti Foto</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-4">
                                    <UploadCloud className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                                    <span className="text-[12px] font-bold text-indigo-600 dark:text-indigo-400">Klik untuk upload</span>
                                    <p className="text-[10px] text-slate-500 mt-1">PNG, JPG (Max 2MB)</p>
                                </div>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                        {!imagePreview && <p className="text-[11px] text-red-500 font-medium flex items-center gap-1"><X className="w-3 h-3" /> Image wajib diisi</p>}
                    </div>

                    {/* Right: Form Info */}
                    <div className="md:w-2/3 space-y-5">
                        {/* 1. Informasi Utama */}
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1 dark:border-slate-800">1. Informasi Utama</h4>
                            <div>
                                <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Nama Produk <span className="text-red-500">*</span></label>
                                <input name="name" value={form.name} onChange={handleChange} className="input-field py-2 text-[13px]" placeholder="Misal: Kopi Susu Aren" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>SKU <span className="text-red-500">*</span></label>
                                    <input name="sku" value={form.sku} onChange={handleChange} className="input-field py-2 text-[13px] font-mono text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-900 border-dashed" placeholder="SKU-XXX" />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Kategori <span className="text-red-500">*</span></label>
                                    {isAddingCategory ? (
                                        <div className="flex gap-1.5">
                                            <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="input-field py-2 text-[13px] flex-1" placeholder="Nama Kategori" autoFocus />
                                            <button onClick={handleSaveNewCategory} className="bg-emerald-500 text-white p-1.5 rounded-lg hover:bg-emerald-600"><Check className="w-4 h-4" /></button>
                                            <button onClick={() => setIsAddingCategory(false)} className="bg-slate-200 text-slate-600 p-1.5 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300"><X className="w-4 h-4" /></button>
                                        </div>
                                    ) : (
                                        <select name="category_id" value={form.category_id} onChange={handleChange} className="input-field py-2 text-[13px] cursor-pointer">
                                            {categories.filter(c => c.id !== 1).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            <option value="new" className="font-bold text-indigo-600"> + Tambah Kategori Baru</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. Harga & Profit Calc */}
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1 dark:border-slate-800">2. Harga & Profit</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Harga Modal <span className="text-red-500">*</span></label>
                                    <input name="cost_price" type="number" value={form.cost_price} onChange={handleChange} className="input-field py-2 text-[14px] font-bold" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Harga Jual <span className="text-red-500">*</span></label>
                                    <input name="price" type="number" value={form.price} onChange={handleChange} className="input-field py-2 text-[14px] font-bold text-indigo-600 dark:text-indigo-400" placeholder="0" />
                                </div>
                            </div>
                            {/* Realtime Profit Info */}
                            {(form.price && form.cost_price) ? (
                                <div className={`p-2.5 rounded-xl text-[12px] font-bold flex justify-between items-center border ${profit > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'}`}>
                                    <span className="flex items-center gap-1.5"><ArrowUpRight className="w-4 h-4" /> Estimasi Keuntungan</span>
                                    <span>{formatCurrency(profit)} <span className="opacity-70 text-[10px] ml-1">(Margin: {margin}%)</span></span>
                                </div>
                            ) : null}
                        </div>

                        {/* 3. Stok */}
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1 dark:border-slate-800">3. Stok</h4>
                            <div className="w-1/2">
                                <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Quantity Stok <span className="text-red-500">*</span></label>
                                <input name="stock" type="number" value={form.stock} onChange={handleChange} className="input-field py-2 text-[14px] font-bold text-slate-700 dark:text-slate-300" placeholder="0" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <button onClick={onClose} className="btn-secondary flex-1 py-2.5">Batal</button>
                    <button onClick={() => { onSave(form); onClose(); }} disabled={!isFormValid}
                        className="btn-primary flex-[2] py-2.5 text-[14px] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                        <Check className="w-5 h-5" /> Simpan Produk
                    </button>
                </div>
            </div>
        </div>
    );
}

// ===== STOCK ADJUSTMENT MODAL =====
function StockAdjustModal({ product, onClose, onSave }) {
    const [adjustment, setAdjustment] = useState({ type: 'in', quantity: '', reason: '' });
    const reasons = ['Penerimaan Supplier', 'Barang Rusak', 'Koreksi Manual', 'Bonus Supplier', 'Expired'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                <h3 className="text-[18px] font-black mb-1" style={{ color: 'var(--color-text-primary)' }}>Penyesuaian Stok</h3>
                <div className="flex items-center gap-3 mb-5 mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {product.image_url ? (
                        <img src={product.image_url} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold dark:bg-indigo-900/30 dark:text-indigo-400">
                            {product.name.charAt(0)}
                        </div>
                    )}
                    <div>
                        <p className="text-[13px] font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{product.name}</p>
                        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Stok saat ini: <span className="font-bold text-indigo-600 dark:text-indigo-400">{product.stock} pcs</span></p>
                    </div>
                </div>

                <div className="flex gap-2 mb-4">
                    {[{ key: 'in', label: 'Masuk (+)', color: '#10b981' }, { key: 'out', label: 'Keluar (-)', color: '#ef4444' }].map(t => (
                        <button key={t.key} onClick={() => setAdjustment(prev => ({ ...prev, type: t.key }))}
                            className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all border-2`}
                            style={{
                                background: adjustment.type === t.key ? `${t.color}15` : 'var(--color-surface-100)',
                                color: adjustment.type === t.key ? t.color : 'var(--color-text-secondary)',
                                borderColor: adjustment.type === t.key ? t.color : 'transparent'
                            }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Kuantitas</label>
                        <input type="number" placeholder="0" value={adjustment.quantity} onChange={e => setAdjustment(prev => ({ ...prev, quantity: e.target.value }))} className="input-field py-2.5 text-[15px] font-bold text-center" autoFocus />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Alasan</label>
                        <select value={adjustment.reason} onChange={e => setAdjustment(prev => ({ ...prev, reason: e.target.value }))} className="input-field py-2.5 text-[13px] cursor-pointer">
                            <option value="">Pilih alasan...</option>
                            {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="btn-secondary flex-1 py-2.5">Batal</button>
                    <button onClick={() => { onSave(adjustment); onClose(); }} disabled={!adjustment.quantity || !adjustment.reason}
                        className="btn-primary flex-1 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">Simpan Data</button>
                </div>
            </div>
        </div>
    );
}

// ===== MAIN INVENTORY PAGE =====
export default function InventoryPage() {
    const [productList, setProductList] = useState([]);
    const [categories, setCategories] = useState(initialCategories);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [adjustProduct, setAdjustProduct] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'name', dir: 'asc' });
    const perPage = 10;

    useEffect(() => {
        fetchProducts().then((data) => {
            setProductList(data);
            setLoading(false);
        });
    }, []);

    // Add category handler
    const handleAddCategory = (name) => {
        const newCat = { id: Date.now(), name, slug: name.toLowerCase().replace(/\s+/g, '-'), icon: '🏷️', is_active: true };
        setCategories(prev => [...prev, newCat]);
        return newCat;
    };

    // Filter & Sort using Debounced Search
    const displayed = useMemo(() => {
        let result = [...productList];
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
        }
        result.sort((a, b) => {
            const valA = a[sortConfig.key];
            const valB = b[sortConfig.key];
            if (typeof valA === 'string') return sortConfig.dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            return sortConfig.dir === 'asc' ? valA - valB : valB - valA;
        });
        return result;
    }, [productList, debouncedSearch, sortConfig]);

    const totalPages = Math.max(1, Math.ceil(displayed.length / perPage));
    const paginated = displayed.slice((currentPage - 1) * perPage, currentPage * perPage);

    // Reset page if search changes
    useEffect(() => { setCurrentPage(1); }, [debouncedSearch]);

    const toggleSort = (key) => setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
    const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleSelectAll = () => {
        const pageIds = paginated.map(p => p.id);
        const allSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.includes(id));
        setSelectedIds(prev => allSelected ? prev.filter(id => !pageIds.includes(id)) : [...new Set([...prev, ...pageIds])]);
    };

    // Helper function to calculate margin percentage
    const calculateMargin = (price, costPrice) => {
        if (!price || !costPrice || price === 0) return 0;
        return ((price - costPrice) / price * 100).toFixed(1);
    };

    if (loading) return <div className="flex items-center justify-center h-[calc(100vh-4rem)]"><div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin border-indigo-500" /></div>;

    return (
        <div className="space-y-4 animate-fade-in -mx-2 sm:mx-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2 sm:px-0">
                <div>
                    <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Inventaris Produk</h2>
                    <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Kelola katalog, stok, dan harga dasar produk</p>
                </div>
                <button onClick={() => { setEditProduct(null); setShowForm(true); }} className="btn-primary text-[13px] py-2 px-4 shadow-md whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Tambah Produk Baru
                </button>
            </div>

            {/* Toolbar: Search + Bulk Actions */}
            <div className="flex flex-col sm:flex-row gap-3 px-2 sm:px-0">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cari produk atau SKU..." className="input-field pl-10 py-2.5 text-[13px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm" />
                    {search && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" title="Searching..." />}
                </div>

                {/* Bulk Actions Feedback */}
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 animate-slide-in-left bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <span className="text-[12px] font-bold text-indigo-700 dark:text-indigo-300 mr-2 flex items-center gap-1.5">
                            <span className="bg-indigo-500 text-white w-5 h-5 rounded-md flex items-center justify-center text-[10px]">{selectedIds.length}</span> produk dipilih
                        </span>
                        <div className="h-4 w-px bg-indigo-200 dark:bg-indigo-700" />
                        <button className="text-[11px] font-bold flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 px-2 transition-colors"><FileDown className="w-3.5 h-3.5" /> Export</button>
                        <button className="text-[11px] font-bold flex items-center gap-1 text-red-500 hover:text-red-700 px-2 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Hapus</button>
                        <button onClick={() => setSelectedIds([])} className="text-[11px] font-bold flex items-center gap-1 text-slate-400 hover:text-slate-600 px-1 ml-1" title="Reset Selection"><RotateCcw className="w-3 h-3" /></button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">

                        {/* HEADER */}
                        <thead>
                            <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">

                                <th className="py-3 px-5 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        checked={paginated.length > 0 && paginated.every(p => selectedIds.includes(p.id))}
                                        onChange={toggleSelectAll}
                                        className="rounded accent-indigo-600 w-4 h-4 cursor-pointer"
                                    />
                                </th>

                                <th
                                    className="py-3 px-5 text-xs font-semibold text-slate-500 text-center cursor-pointer"
                                    onClick={() => toggleSort('name')}
                                >
                                    <span className="flex items-center gap-1">
                                        INFO PRODUK
                                        {sortConfig.key === 'name' && (
                                            <span className="text-indigo-500">
                                                {sortConfig.dir === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </span>
                                </th>

                                <th
                                    className="py-3 px-5 text-xs font-semibold text-slate-500 text-center cursor-pointer"
                                    onClick={() => toggleSort('cost_price')}
                                >
                                    <span className="flex items-center justify-center gap-1">
                                        HARGA MODAL
                                        {sortConfig.key === 'cost_price' && (
                                            <span className="text-indigo-500">
                                                {sortConfig.dir === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </span>
                                </th>

                                <th
                                    className="py-3 px-5 text-xs font-semibold text-slate-500 text-center cursor-pointer"
                                    onClick={() => toggleSort('price')}
                                >
                                    <span className="flex items-center justify-center gap-1">
                                        HARGA JUAL
                                        {sortConfig.key === 'price' && (
                                            <span className="text-indigo-500">
                                                {sortConfig.dir === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </span>
                                </th>

                                <th className="py-3 px-5 text-xs font-semibold text-slate-500 text-center">
                                    MARGIN
                                </th>

                                <th
                                    className="py-3 px-5 text-xs font-semibold text-slate-500 text-center cursor-pointer"
                                    onClick={() => toggleSort('stock')}
                                >
                                    <span className="flex items-center justify-center gap-1">
                                        STOK
                                        {sortConfig.key === 'stock' && (
                                            <span className="text-indigo-500">
                                                {sortConfig.dir === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </span>
                                </th>

                                <th className="py-3 px-5 text-xs font-semibold text-slate-500 text-center">
                                    AKSI
                                </th>

                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody className="text-sm">
                            {paginated.length > 0 ? paginated.map(p => {
                                const margin = calculateMargin(p.price, p.cost_price);
                                const isProfitable = p.price > p.cost_price;

                                return (
                                    <tr
                                        key={p.id}
                                        className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                                    >

                                        {/* Checkbox */}
                                        <td className="py-3 px-5 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(p.id)}
                                                onChange={() => toggleSelect(p.id)}
                                                className="rounded accent-indigo-600 w-4 h-4 cursor-pointer"
                                            />
                                        </td>

                                        {/* Product */}
                                        <td className="py-3 px-5">
                                            <div className="flex items-center gap-3">
                                                {p.image_url ? (
                                                    <img
                                                        src={p.image_url}
                                                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-100 text-indigo-600 text-sm font-bold">
                                                        {p.name.charAt(0)}
                                                    </div>
                                                )}

                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                                                        {p.name}
                                                    </p>
                                                    <p className="font-mono text-xs text-slate-400">
                                                        {p.sku}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Cost */}
                                        <td className="py-3 px-5 text-center text-slate-600 dark:text-slate-400">
                                            {formatCurrency(p.cost_price)}
                                        </td>

                                        {/* Price */}
                                        <td className="py-3 px-5 text-center font-semibold text-indigo-600 dark:text-indigo-400">
                                            {formatCurrency(p.price)}
                                        </td>

                                        {/* Margin */}
                                        <td className="py-3 px-5 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${isProfitable
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                                }`}>
                                                {margin}%
                                            </span>
                                        </td>

                                        {/* Stock */}
                                        <td className="py-3 px-5 text-center">
                                            {p.stock === 0 ? (
                                                <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                                                    Habis
                                                </span>
                                            ) : p.stock < 5 ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                                                    <AlertTriangle className="w-3 h-3" /> {p.stock}
                                                </span>
                                            ) : (
                                                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                                                    {p.stock}
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3 px-5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <Package className="w-4 h-4" />
                                                </button>
                                                <button className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center">
                                        <p className="text-sm text-slate-500">Produk tidak ditemukan</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>

                {/* PAGINATION */}
                {displayed.length > 0 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30">

                        {/* Info */}
                        <span className="text-xs text-slate-500">
                            {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, displayed.length)} dari {displayed.length}
                        </span>

                        {/* Controls */}
                        <div className="flex items-center gap-1">

                            {/* Prev */}
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1 px-1">
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let page;

                                    if (totalPages <= 5) {
                                        page = i + 1;
                                    } else if (currentPage <= 3) {
                                        page = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        page = totalPages - 4 + i;
                                    } else {
                                        page = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors
                                ${page === currentPage
                                                    ? 'bg-indigo-500 text-white'
                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next */}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>

                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showForm && <ProductFormModal product={editProduct} categories={categories} onAddCategory={handleAddCategory} onClose={() => setShowForm(false)} onSave={(data) => console.log('Save:', data)} />}
            {adjustProduct && <StockAdjustModal product={adjustProduct} onClose={() => setAdjustProduct(null)} onSave={(data) => console.log('Adjust:', data)} />}
        </div>
    );
}