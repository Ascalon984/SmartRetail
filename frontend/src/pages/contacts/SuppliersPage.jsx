import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Search, Edit3, Trash2, Eye, Building2, Phone, Mail, MapPin, Calendar, DollarSign, Package, Users, TrendingUp, ChevronLeft, ChevronRight, X, Check, FileDown, RotateCcw, Truck, Filter, ArrowUpDown, Clock, ArrowUpRight, ArrowDownRight, Activity, ShoppingBag } from 'lucide-react';

// ===== UTILITY FUNCTIONS =====
const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const formatRupiahInput = (value) => {
    const number = value.replace(/\D/g, '');
    return new Intl.NumberFormat('id-ID').format(number);
};

const getRelativeTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays <= 7) return `${diffDays} hari lalu`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    if (diffDays <= 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
    return `${Math.floor(diffDays / 365)} tahun lalu`;
};

// ===== GEOMETRIC PATTERN COMPONENT (CONSISTENT WITH DASHBOARD) =====
const GeometricPattern = ({ opacity = 0.1, size = 32 }) => (
    <svg
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{
            position: 'absolute',
            top: 0,
            right: 0,
            opacity,
            pointerEvents: 'none',
            zIndex: 1,
            filter: 'blur(0.2px)',
        }}
    >
        <defs>
            <pattern id="geo-diagonal-supplier" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <path d="M0 12 L12 0" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.6" />
                <path d="M-3 12 L12 -3" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.3" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#geo-diagonal-supplier)" />
    </svg>
);

// ===== KPI CARD COMPONENT (CONSISTENT WITH DASHBOARD BASELINE) =====
const KPICard = ({
    title,
    value,
    subValue,
    icon: Icon,
    trend,
    trendValue,
    accentColor,
    delay = 0,
    hasPattern = false,
    onClick,
    isActive = false
}) => {
    const isUp = trend === 'up';

    return (
        <div
            onClick={onClick}
            className="card-flat p-4 animate-slide-up relative transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
            style={{
                animationDelay: `${delay}s`,
                background: `linear-gradient(135deg, ${accentColor}08 0%, ${accentColor}15 50%, ${accentColor}08 100%)`,
                position: 'relative',
                overflow: 'hidden',
                cursor: onClick ? 'pointer' : 'default',
                border: isActive ? `2px solid ${accentColor}` : 'none',
            }}
        >
            {/* Glow effect */}
            <div
                className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl opacity-20"
                style={{ background: accentColor }}
            />

            {hasPattern && (
                <div className="absolute top-0 right-0 opacity-30 pointer-events-none" style={{ maskImage: 'linear-gradient(to right, transparent 10%, rgba(0,0,0,0.4) 50%, black 100%)' }}>
                    <GeometricPattern opacity={0.1} size={48} />
                </div>
            )}

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accentColor}20` }}>
                            <Icon className="w-4 h-4" style={{ color: accentColor }} />
                        </div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    </div>
                    {trendValue !== undefined && (
                        <div className={`flex items-center gap-0.5 text-[10px] font-bold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                            {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(parseFloat(trendValue))}%
                        </div>
                    )}
                </div>
                <div className="flex items-end justify-between">
                    <div className="flex-1">
                        <p className="text-2xl font-extrabold tracking-tight leading-none mb-1 text-gray-900 dark:text-gray-200">{value}</p>
                        {subValue && <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{subValue}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ===== MODAL FORM UNTUK TAMBAH/EDIT SUPPLIER (DIPERBAIKI) =====
function SupplierFormModal({ supplier, onClose, onSave }) {
    const isEdit = !!supplier;
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        total_spent: 0,
        total_purchases: 0,
        last_order_date: '',
        is_active: true,
        image_url: null,
        ...supplier,
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked :
            type === 'number' ? (value === '' ? 0 : Number(value)) :
                value;

        setForm(prev => ({ ...prev, [name]: val }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Nama supplier wajib diisi';
        if (!form.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi';
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Format email tidak valid';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await new Promise(r => setTimeout(r, 800));
            onSave(form);
        } catch (e) {
            alert('Gagal menyimpan supplier');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = form.name.trim() && form.phone.trim();

    return (
        // Modal overlay - Tanpa blur, hanya background gelap
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-transparent">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-slide-up">
                {/* Header - Sticky */}
                <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">
                            {isEdit ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable dengan padding yang tepat */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* Identitas Supplier */}
                    <div className="space-y-4">
                        <h4 className="text-[13px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Identitas Supplier
                        </h4>

                        <div>
                            <label className="block text-[12px] font-bold mb-1.5 text-gray-500">
                                Nama Instansi/Supplier <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className={`input-field py-2.5 text-[13px] ${errors.name ? 'border-red-300 focus:border-red-500' : ''}`}
                                placeholder="Masukkan nama supplier"
                                autoFocus
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-bold mb-1.5 text-gray-500">
                                    Telepon <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className={`input-field py-2.5 text-[13px] ${errors.phone ? 'border-red-300 focus:border-red-500' : ''}`}
                                    placeholder="0812..."
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-[12px] font-bold mb-1.5 text-gray-500">Email Instansi</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className={`input-field py-2.5 text-[13px] ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
                                    placeholder="email@contoh.com"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[12px] font-bold mb-1.5 text-gray-500">Alamat Lengkap</label>
                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                className="input-field py-2.5 text-[13px] min-h-[80px] resize-none"
                                placeholder="Alamat lengkap supplier/gudang..."
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Data Transaksi & Keuangan */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-4 space-y-4 border border-emerald-100 dark:border-emerald-800/30">
                        <h4 className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Data Transaksi & Keuangan
                        </h4>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[12px] font-bold mb-1.5 text-gray-500">Total Belanja (Rp)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">Rp</span>
                                    <input
                                        name="total_spent"
                                        type="text"
                                        value={form.total_spent ? formatRupiahInput(String(form.total_spent)) : ''}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/\D/g, '');
                                            setForm(prev => ({
                                                ...prev,
                                                total_spent: raw === '' ? 0 : Number(raw)
                                            }));
                                        }}
                                        className="input-field py-2.5 pl-8 text-[13px]"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Total akumulasi pembelian dari supplier ini</p>
                            </div>
                            <div>
                                <label className="block text-[12px] font-bold mb-1.5 text-gray-500">Jumlah Transaksi</label>
                                <input
                                    name="total_purchases"
                                    type="number"
                                    value={form.total_purchases === 0 ? '' : form.total_purchases}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setForm(prev => ({
                                            ...prev,
                                            total_purchases: value === '' ? 0 : Number(value)
                                        }));
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    className="input-field py-2.5 text-[13px]"
                                    placeholder="0"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Total kali melakukan pembelian</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[12px] font-bold mb-1.5 text-gray-500">Terakhir Order</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                                <input
                                    name="last_order_date"
                                    type="date"
                                    value={form.last_order_date}
                                    onChange={handleChange}
                                    className="input-field py-2.5 pl-10 text-[13px] 
                                        [&::-webkit-calendar-picker-indicator]:opacity-0 
                                        [&::-webkit-calendar-picker-indicator]:absolute 
                                        [&::-webkit-calendar-picker-indicator]:inset-0 
                                        [&::-webkit-calendar-picker-indicator]:w-full 
                                        [&::-webkit-calendar-picker-indicator]:cursor-pointer
                                        [&::-webkit-inner-spin-button]:hidden
                                        [&::-webkit-outer-spin-button]:hidden"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Active Checkbox */}
                    <label className="flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-gray-200 dark:border-gray-800">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={form.is_active}
                            onChange={handleChange}
                            className="w-4 h-4 rounded accent-emerald-500 border-gray-300"
                        />
                        <div>
                            <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100">Status Aktif</p>
                            <p className="text-[11px] text-gray-500">Supplier dapat dipilih dalam transaksi pembelian/restock.</p>
                        </div>
                    </label>
                </div>

                {/* Footer - Sticky dengan actions */}
                <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 btn-secondary py-2.5 text-[14px]"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!isFormValid || isSubmitting}
                            className="flex-[2] btn-primary py-2.5 text-[14px] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" /> Simpan Data
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ===== MAIN SUPPLIER MANAGEMENT COMPONENT =====
export default function SupplierManagement() {
    const [list, setList] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedIds, setSelectedIds] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeInsightFilter, setActiveInsightFilter] = useState(null);
    const perPage = 8;

    // Mock data
    useEffect(() => {
        const mock = [
            { id: 1, name: 'PT. Maju Jaya Abadi', phone: '08123456789', email: 'info@majujaya.com', address: 'Jl. Industri No. 123, Jakarta', total_spent: 150000000, total_purchases: 25, last_order_date: '2024-01-15', is_active: true, image_url: null },
            { id: 2, name: 'CV. Sejahtera Bersama', phone: '08234567890', email: 'admin@sejahtera.com', address: 'Jl. Pusat Niaga No. 45, Surabaya', total_spent: 85000000, total_purchases: 15, last_order_date: '2024-01-10', is_active: true, image_url: null },
            { id: 3, name: 'UD. Makmur Sentosa', phone: '08345678901', email: 'udmakmur@email.com', address: 'Jl. Raya Utama No. 67, Bandung', total_spent: 120000000, total_purchases: 20, last_order_date: '2024-01-08', is_active: false, image_url: null },
            { id: 4, name: 'PT. Sumber Rezeki', phone: '08456789012', email: 'contact@sumberrezeki.com', address: 'Jl. Bisnis Center No. 89, Semarang', total_spent: 200000000, total_purchases: 30, last_order_date: '2024-01-12', is_active: true, image_url: null },
            { id: 5, name: 'CV. Karya Mandiri', phone: '08567890123', email: 'info@karyamandiri.com', address: 'Jl. Industri II No. 234, Medan', total_spent: 95000000, total_purchases: 18, last_order_date: '2024-01-05', is_active: true, image_url: null },
            { id: 6, name: 'PT. Anugerah Jaya', phone: '08678901234', email: 'sales@anugerahjaya.com', address: 'Jl. Pabrik No. 567, Palembang', total_spent: 175000000, total_purchases: 28, last_order_date: '2024-01-14', is_active: true, image_url: null },
            { id: 7, name: 'UD. Berkah Mulia', phone: '08789012345', email: 'udberkah@gmail.com', address: 'Jl. Pasar Induk No. 890, Makassar', total_spent: 65000000, total_purchases: 12, last_order_date: '2024-01-03', is_active: false, image_url: null },
            { id: 8, name: 'CV. Jaya Abadi', phone: '08890123456', email: 'jayaabadi@email.com', address: 'Jl. Komplek Bisnis No. 345, Yogyakarta', total_spent: 110000000, total_purchases: 22, last_order_date: '2024-01-11', is_active: true, image_url: null },
            { id: 9, name: 'PT. Sukses Makmur', phone: '08901234567', email: 'info@sukesmakmur.com', address: 'Jl. Ekonomi No. 678, Denpasar', total_spent: 135000000, total_purchases: 24, last_order_date: '2024-01-09', is_active: true, image_url: null },
            { id: 10, name: 'CV. Mandiri Jaya', phone: '09012345678', email: 'mandirijaya@ymail.com', address: 'Jl. Usaha No. 901, Balikpapan', total_spent: 80000000, total_purchases: 14, last_order_date: '2024-01-07', is_active: true, image_url: null },
        ];
        setTimeout(() => {
            setList(mock);
            setLoading(false);
        }, 500);
    }, []);

    // Business insights (enhanced with trends)
    const insights = useMemo(() => {
        const total = list.length;
        const active = list.filter(s => s.is_active).length;
        const inactive = total - active;
        const totalSpent = list.reduce((sum, s) => sum + (s.total_spent || 0), 0);
        const totalTransactions = list.reduce((sum, s) => sum + (s.total_purchases || 0), 0);
        const avgSpent = total > 0 ? totalSpent / total : 0;

        // Simulate trends (using mock data - you can replace with actual calculations)
        const previousTotalSpent = totalSpent * 0.85; // 15% growth
        const spentTrend = previousTotalSpent > 0 ? ((totalSpent - previousTotalSpent) / previousTotalSpent * 100).toFixed(1) : 0;

        const previousTransactions = totalTransactions * 0.8; // 20% growth
        const transactionTrend = previousTransactions > 0 ? ((totalTransactions - previousTransactions) / previousTransactions * 100).toFixed(1) : 0;

        return {
            totalSuppliers: total,
            activeCount: active,
            inactiveCount: inactive,
            totalSpent: totalSpent,
            totalTransactions: totalTransactions,
            avgSpent: avgSpent,
            spentTrend: parseFloat(spentTrend),
            transactionTrend: parseFloat(transactionTrend),
        };
    }, [list]);

    // Handle insight card clicks
    const handleInsightClick = (filterType, value) => {
        if (activeInsightFilter === filterType) {
            setActiveInsightFilter(null);
            setStatusFilter('all');
            setSortBy('name');
            setSortOrder('asc');
        } else {
            setActiveInsightFilter(filterType);
            if (filterType === 'active') {
                setStatusFilter('active');
                setSortBy('name');
                setSortOrder('asc');
            } else if (filterType === 'inactive') {
                setStatusFilter('inactive');
                setSortBy('name');
                setSortOrder('asc');
            } else if (filterType === 'transactions') {
                setStatusFilter('all');
                setSortBy('total_purchases');
                setSortOrder('desc');
            } else if (filterType === 'spending') {
                setStatusFilter('all');
                setSortBy('total_spent');
                setSortOrder('desc');
            }
        }
        setCurrentPage(1);
    };

    // Filtering & sorting
    const displayed = useMemo(() => {
        let filtered = list.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.phone.includes(search) ||
                (s.email && s.email.toLowerCase().includes(search.toLowerCase()));

            const matchesStatus = statusFilter === 'all' ? true :
                statusFilter === 'active' ? s.is_active :
                    !s.is_active;

            return matchesSearch && matchesStatus;
        });

        filtered.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'total_spent' || sortBy === 'total_purchases') {
                aVal = aVal || 0;
                bVal = bVal || 0;
            }

            if (sortBy === 'last_order_date') {
                aVal = aVal ? new Date(aVal) : new Date(0);
                bVal = bVal ? new Date(bVal) : new Date(0);
            }

            if (aVal === bVal) return 0;
            const cmp = aVal > bVal ? 1 : -1;
            return sortOrder === 'asc' ? cmp : -cmp;
        });

        return filtered;
    }, [list, search, statusFilter, sortBy, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(displayed.length / perPage);
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return displayed.slice(start, start + perPage);
    }, [displayed, currentPage, perPage]);

    // Selection
    const toggleSelect = useCallback((id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, []);

    const toggleSelectAll = useCallback(() => {
        if (paginated.every(p => selectedIds.includes(p.id))) {
            setSelectedIds(prev => prev.filter(id => !paginated.some(p => p.id === id)));
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...paginated.map(p => p.id)])]);
        }
    }, [paginated, selectedIds]);

    // CRUD operations
    const handleSaveSupplier = useCallback((data) => {
        if (editTarget) {
            setList(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...data } : s));
        } else {
            const newId = Math.max(...list.map(s => s.id), 0) + 1;
            setList(prev => [...prev, { id: newId, ...data }]);
        }
        setShowForm(false);
        setEditTarget(null);
    }, [editTarget, list]);

    const handleDeleteSupplier = useCallback(async (id) => {
        if (confirm('Hapus supplier ini? Data tidak dapat dikembalikan.')) {
            setList(prev => prev.filter(s => s.id !== id));
        }
    }, []);

    const handleBulkDelete = useCallback(() => {
        if (confirm(`Hapus ${selectedIds.length} supplier yang dipilih?`)) {
            setList(prev => prev.filter(s => !selectedIds.includes(s.id)));
            setSelectedIds([]);
        }
    }, [selectedIds]);

    // Quick sort handlers
    const handleQuickSort = (field) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    if (loading) return <div className="flex items-center justify-center h-[calc(100vh-4rem)]"><div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin border-indigo-500" /></div>;

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-primary">Daftar Supplier</h1>
                    <p className="text-[13px] mt-0.5 text-secondary">Total {list.length} instansi/pemasok terdaftar</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { setEditTarget(null); setShowForm(true); }} className="btn-primary text-[13px] py-2 px-4 shadow-md whitespace-nowrap">
                        <Plus className="w-4 h-4" /> Tambah Supplier
                    </button>
                </div>
            </div>

            {/* KPI CARDS - CONSISTENT WITH DASHBOARD */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Supplier"
                    value={insights.totalSuppliers}
                    subValue={`${insights.activeCount} aktif, ${insights.inactiveCount} nonaktif`}
                    icon={Building2}
                    trend={insights.spentTrend >= 0 ? 'up' : 'down'}
                    trendValue={Math.abs(insights.spentTrend)}
                    accentColor="#6366f1"
                    delay={0}
                    hasPattern={true}
                    onClick={() => handleInsightClick('total')}
                    isActive={activeInsightFilter === 'total'}
                />

                <KPICard
                    title="Supplier Aktif"
                    value={insights.activeCount}
                    subValue={`${Math.round((insights.activeCount / insights.totalSuppliers) * 100)}% dari total`}
                    icon={Users}
                    trend="up"
                    trendValue={12}
                    accentColor="#10b981"
                    delay={0.05}
                    hasPattern={false}
                    onClick={() => handleInsightClick('active')}
                    isActive={activeInsightFilter === 'active'}
                />

                <KPICard
                    title="Total Transaksi"
                    value={insights.totalTransactions.toLocaleString()}
                    subValue={formatCurrency(insights.totalSpent)}
                    icon={Package}
                    trend={insights.transactionTrend >= 0 ? 'up' : 'down'}
                    trendValue={Math.abs(insights.transactionTrend)}
                    accentColor="#f59e0b"
                    delay={0.1}
                    hasPattern={false}
                    onClick={() => handleInsightClick('transactions')}
                    isActive={activeInsightFilter === 'transactions'}
                />

                <KPICard
                    title="Rata-rata Belanja"
                    value={formatCurrency(insights.avgSpent)}
                    subValue={`${insights.totalTransactions} total pembelian`}
                    icon={DollarSign}
                    trend="up"
                    trendValue={8.5}
                    accentColor="#8b5cf6"
                    delay={0.15}
                    hasPattern={true}
                    onClick={() => handleInsightClick('spending')}
                    isActive={activeInsightFilter === 'spending'}
                />
            </div>

            {/* Toolbar Area */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Cari nama, email, telepon..."
                        className="input-field pl-10 py-2.5 text-[13px]"
                    />
                    {search && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" title="Searching..." />}
                </div>

                {/* Status Filter Dropdown */}
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                            setActiveInsightFilter(null);
                        }}
                        className="input-field py-2.5 pl-9 pr-8 text-[13px] appearance-none cursor-pointer"
                    >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                    </select>
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                </div>

                {/* Quick Sort Dropdown */}
                <div className="relative">
                    <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                            const [field, order] = e.target.value.split('-');
                            setSortBy(field);
                            setSortOrder(order);
                            setCurrentPage(1);
                        }}
                        className="input-field py-2.5 pl-9 pr-8 text-[13px] appearance-none cursor-pointer"
                    >
                        <option value="name-asc">Nama (A-Z)</option>
                        <option value="name-desc">Nama (Z-A)</option>
                        <option value="total_spent-desc">Total Belanja (Tertinggi)</option>
                        <option value="total_spent-asc">Total Belanja (Terendah)</option>
                        <option value="total_purchases-desc">Transaksi (Terbanyak)</option>
                        <option value="total_purchases-asc">Transaksi (Tersedikit)</option>
                        <option value="last_order_date-desc">Last Order (Terbaru)</option>
                        <option value="last_order_date-asc">Last Order (Terlama)</option>
                    </select>
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Bulk Actions Menu */}
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 animate-slide-in-left bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <span className="text-[12px] font-bold text-indigo-700 dark:text-indigo-300 mr-2 flex items-center gap-1.5">
                            <span className="bg-indigo-500 text-white w-5 h-5 rounded-md flex items-center justify-center text-[10px]">{selectedIds.length}</span> supplier dipilih
                        </span>
                        <div className="h-4 w-px bg-indigo-200 dark:bg-indigo-700" />
                        <button className="text-[11px] font-bold flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 px-2 transition-colors">
                            <FileDown className="w-3.5 h-3.5" /> Export
                        </button>
                        <button onClick={handleBulkDelete} className="text-[11px] font-bold flex items-center gap-1 text-red-500 hover:text-red-700 px-2 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                        <button onClick={() => setSelectedIds([])} className="text-[11px] font-bold flex items-center gap-1 text-gray-400 hover:text-gray-600 px-1 ml-1">
                            <RotateCcw className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* Main Data Table - Consistent with Dashboard */}
            <div className="card-flat overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50">
                                {/* Checkbox Header */}
                                <th className="py-3 px-5 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        checked={paginated.length > 0 && paginated.every(p => selectedIds.includes(p.id))}
                                        onChange={toggleSelectAll}
                                        className="rounded accent-indigo-600 w-4 h-4 cursor-pointer"
                                    />
                                </th>

                                {[
                                    { key: 'name', label: 'NAMA SUPPLIER', sortable: true, align: 'left' },
                                    { key: 'phone', label: 'KONTAK', sortable: false, align: 'left' },
                                    { key: 'total_spent', label: 'TOTAL BELANJA', sortable: true, align: 'center' },
                                    { key: 'total_purchases', label: 'TRANSAKSI', sortable: true, align: 'center' },
                                    { key: 'last_order_date', label: 'LAST ORDER', sortable: true, align: 'center' },
                                    { key: 'is_active', label: 'STATUS', sortable: true, align: 'center' },
                                ].map(col => (
                                    <th
                                        key={col.key}
                                        onClick={() => col.sortable && handleQuickSort(col.key)}
                                        className={`
                                            py-3 px-5 text-[12px] font-semibold
                                            text-gray-600 dark:text-gray-400
                                            ${col.align === 'center' ? 'text-center' : 'text-left'}
                                            ${col.sortable ? 'cursor-pointer select-none hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors' : ''}
                                        `}
                                    >
                                        <span className={`flex items-center gap-1.5 ${col.align === 'center' ? 'justify-center' : ''}`}>
                                            {col.label}
                                            {col.sortable && sortBy === col.key && (
                                                <span className="text-indigo-600 dark:text-indigo-400 text-[10px]">
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </span>
                                    </th>
                                ))}

                                {/* AKSI */}
                                <th className="py-3 px-5 text-[12px] font-semibold text-gray-600 dark:text-gray-400 text-center">
                                    AKSI
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginated.length > 0 ? paginated.map(s => {
                                const relativeTime = getRelativeTime(s.last_order_date);

                                return (
                                    <tr
                                        key={s.id}
                                        className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                                    >
                                        {/* Checkbox */}
                                        <td className="py-3 px-5 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(s.id)}
                                                onChange={() => toggleSelect(s.id)}
                                                className="rounded accent-indigo-600 w-4 h-4 cursor-pointer"
                                            />
                                        </td>

                                        {/* Supplier */}
                                        <td className="py-3 px-5">
                                            <div className="flex items-center gap-3">
                                                {s.image_url ? (
                                                    <img
                                                        src={s.image_url}
                                                        className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                                                        alt={s.name}
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-indigo-100 bg-indigo-50 text-indigo-600 text-[12px] font-bold dark:border-indigo-900/50 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-sm">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                )}

                                                <div>
                                                    <span className="font-semibold text-[13px] text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block">
                                                        {s.name}
                                                    </span>

                                                    {s.email && (
                                                        <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                            <Mail className="w-3 h-3" /> {s.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Kontak */}
                                        <td className="py-3 px-5">
                                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 text-[12px]">
                                                <Phone className="w-3 h-3 text-gray-400" /> {s.phone}
                                            </div>

                                            {s.address && (
                                                <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mt-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate max-w-[150px]">{s.address}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Total Belanja */}
                                        <td className="py-3 px-5 text-center">
                                            <div className="font-bold text-emerald-600 dark:text-emerald-400 text-[12px]">
                                                {formatCurrency(s.total_spent || 0)}
                                            </div>
                                            <div className="text-[10px] text-gray-400">akumulasi</div>
                                        </td>

                                        {/* Transaksi */}
                                        <td className="py-3 px-5 text-center">
                                            <div className="font-semibold text-gray-700 dark:text-gray-300 text-[12px]">
                                                {s.total_purchases || 0} x
                                            </div>
                                            <div className="text-[10px] text-gray-400">kali belanja</div>
                                        </td>

                                        {/* Last Order */}
                                        <td className="py-3 px-5 text-center">
                                            {s.last_order_date ? (
                                                <div>
                                                    <div className="text-[12px] text-gray-700 dark:text-gray-300">
                                                        {formatDate(s.last_order_date)}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 flex items-center justify-center gap-1 mt-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        {relativeTime}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-gray-400 italic">
                                                    Belum ada order
                                                </span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="py-3 px-5 text-center">
                                            {s.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 px-2.5 py-1 rounded-md">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-500 bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 px-2.5 py-1 rounded-md">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                                    Nonaktif
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3 px-5 text-center">
                                            <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 rounded-lg text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>

                                                <button
                                                    onClick={() => { setEditTarget(s); setShowForm(true); }}
                                                    className="p-1.5 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteSupplier(s.id)}
                                                    className="p-1.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={8} className="py-16 px-5 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                                {list.length === 0
                                                    ? <Truck className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                                    : <Search className="w-8 h-8 text-gray-300 dark:text-gray-600" />}
                                            </div>

                                            <p className="text-[16px] font-black text-gray-900 dark:text-white">
                                                {list.length === 0
                                                    ? 'Belum ada supplier tersimpan'
                                                    : 'Supplier tidak ditemukan'}
                                            </p>

                                            <p className="text-[13px] text-gray-500 mt-1 max-w-xs">
                                                {list.length === 0
                                                    ? 'Mulai tambahkan relasi instansi atau distributor Anda ke dalam sistem.'
                                                    : 'Coba gunakan kata kunci pencarian yang lebih umum atau periksa ejaan Anda.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination - Consistent with Dashboard */}
                {displayed.length > 0 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            Menampilkan {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, displayed.length)} dari {displayed.length} supplier
                        </p>
                        <div className="flex gap-1">
                            <button
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>

                            <div className="hidden sm:flex gap-1 px-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setCurrentPage(num)}
                                        className="w-7 h-7 rounded-lg text-[12px] font-semibold transition-all hover:scale-105"
                                        style={{
                                            background: num === currentPage ? '#6366f1' : 'transparent',
                                            color: num === currentPage ? '#fff' : 'var(--color-text-muted)',
                                        }}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>

                            <button
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {
                showForm && (
                    <SupplierFormModal
                        supplier={editTarget}
                        onClose={() => {
                            setShowForm(false);
                            setEditTarget(null);
                        }}
                        onSave={handleSaveSupplier}
                    />
                )
            }
        </div >
    );
}