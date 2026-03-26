import { useState, useEffect, useMemo } from 'react';
import {
  Calendar, FileText, FileSpreadsheet, TrendingUp, TrendingDown,
  Banknote, ShoppingCart, ReceiptText, Filter, X, ChevronLeft, ChevronRight,
  Download, PackageOpen, CreditCard, QrCode, ArrowDown, ArrowUp,
  ArrowUpRight, ArrowDownRight, Clock, Coffee, Utensils, Pizza, Smile, MoreHorizontal, DollarSign, Activity, Users
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { salesChartData, categoryPieData, paymentMethodData, transactions as rawTransactions, fetchProducts, hourlyData } from '../../services/dummyData';
import { formatCurrency } from '../../utils/formatters';

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
      <pattern id="geo-diagonal-report" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
        <path d="M0 12 L12 0" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.6" />
        <path d="M-3 12 L12 -3" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#geo-diagonal-report)" />
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

// Simple Hook for Number Count-Up Animation
function useCountUp(endValue, duration = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(progress * endValue);
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [endValue, duration]);
  return Math.floor(count);
}

const dateRanges = ['Hari Ini', '7 Hari', '30 Hari', 'Kustom'];

const tooltipStyle = {
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '0.75rem',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
  fontSize: '12px',
  padding: '10px 14px',
  fontWeight: 'bold',
  color: 'var(--color-text-primary)',
  zIndex: 1000
};

// Enhanced tooltip for category pie chart
const CategoryTooltip = ({ active, payload, totalRevenue }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={tooltipStyle}>
        <p className="font-bold text-sm mb-1">{data.name}</p>
        <div className="space-y-1 text-xs">
          <p className="flex justify-between gap-3">
            <span className="text-gray-500">Penjualan:</span>
            <span className="font-semibold">{data.transactions || Math.floor(Math.random() * 200) + 50} transaksi</span>
          </p>
          <p className="flex justify-between gap-3">
            <span className="text-gray-500">Revenue:</span>
            <span className="font-semibold text-indigo-600">{formatCurrency(data.revenue || (data.value / 100) * totalRevenue)}</span>
          </p>
          <p className="flex justify-between gap-3 border-t pt-1 mt-1">
            <span className="text-gray-500">Kontribusi:</span>
            <span className="font-semibold">{data.value}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Enhanced tooltip for payment method chart
const PaymentTooltip = ({ active, payload, totalRevenue }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={tooltipStyle}>
        <p className="font-bold text-sm mb-1">{data.name}</p>
        <div className="space-y-1 text-xs">
          <p className="flex justify-between gap-3">
            <span className="text-gray-500">Frekuensi:</span>
            <span className="font-semibold">{data.frequency || Math.floor(Math.random() * 300) + 50} transaksi</span>
          </p>
          <p className="flex justify-between gap-3">
            <span className="text-gray-500">Revenue:</span>
            <span className="font-semibold text-indigo-600">{formatCurrency(data.revenue || (data.value / 100) * totalRevenue)}</span>
          </p>
          <p className="flex justify-between gap-3 border-t pt-1 mt-1">
            <span className="text-gray-500">Penggunaan:</span>
            <span className="font-semibold">{data.value}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Enhanced tooltip for hourly data
const HourlyTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const transactionCount = data.transactions || Math.floor(Math.random() * 50) + 10;
    const avgTransaction = data.revenue / transactionCount;

    return (
      <div style={{ ...tooltipStyle, minWidth: '200px' }}>
        <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">
          <Clock className="w-3 h-3 text-gray-500" />
          <p className="font-bold text-sm">Jam {data.hour}:00</p>
        </div>
        <div className="space-y-2 text-xs">
          <p className="flex justify-between gap-3">
            <span className="text-gray-500">Revenue:</span>
            <span className="font-semibold text-emerald-600">{formatCurrency(data.revenue)}</span>
          </p>
          <p className="flex justify-between gap-3">
            <span className="text-gray-500">Transaksi:</span>
            <span className="font-semibold">{transactionCount} pesanan</span>
          </p>
          <p className="flex justify-between gap-3">
            <span className="text-gray-500">Rata-rata:</span>
            <span className="font-semibold">{formatCurrency(avgTransaction)}/transaksi</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Map realistic categories/dates to transactions for real filtering
const realisticTransactions = rawTransactions.map((t, idx) => {
  const categories = ['Minuman', 'Makanan', 'Snack', 'Rokok', 'Lainnya'];
  const d = new Date(t.created_at);
  const shortNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const mockDayLabel = shortNames[idx % 7];
  return {
    ...t,
    mock_category: categories[idx % categories.length],
    mock_day: mockDayLabel,
    hour: d.getHours().toString().padStart(2, '0')
  };
});

// Calculate total revenue for tooltip calculations
const totalRevenue = salesChartData.reduce((s, d) => s + d.revenue, 0);

export default function ReportsPage() {
  const [activeRange, setActiveRange] = useState('7 Hari');
  const [showCustomDate, setShowCustomDate] = useState(false);

  // Interactive Filtering States
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [filterMethod, setFilterMethod] = useState(null);

  // Custom Controls
  const [mainChartMode, setMainChartMode] = useState('both');

  // Table States
  const [topProducts, setTopProducts] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', dir: 'desc' });
  const perPage = 8;

  // KPI Base Calcs
  const rawRev = salesChartData.reduce((s, d) => s + d.revenue, 0);
  const rawProfit = salesChartData.reduce((s, d) => s + d.profit, 0);
  const rawTx = salesChartData.reduce((s, d) => s + d.transactions, 0);

  // CountUp applied to KPIs
  const totalRev = useCountUp(rawRev, 800);
  const totalProfit = useCountUp(rawProfit, 800);
  const totalTx = useCountUp(rawTx, 800);
  const margin = rawRev ? ((rawProfit / rawRev) * 100).toFixed(1) : 0;
  const avgTransaction = rawRev / rawTx || 0;

  const trends = {
    revenue: { val: 12.5, isUp: true },
    profit: { val: 8.2, isUp: true },
    transactions: { val: 2.1, isUp: false },
    avgTx: { val: 5.4, isUp: true }
  };

  // Enhance payment method data with frequency and revenue
  const enhancedPaymentData = useMemo(() => {
    const paymentStats = {
      qris: { frequency: 345, revenue: 12450000, percentage: 42 },
      debit: { frequency: 278, revenue: 9870000, percentage: 33 },
      cash: { frequency: 210, revenue: 7320000, percentage: 25 }
    };

    return paymentMethodData.map(item => ({
      ...item,
      frequency: paymentStats[item.name.toLowerCase()]?.frequency || Math.floor(Math.random() * 300) + 100,
      revenue: paymentStats[item.name.toLowerCase()]?.revenue || Math.floor(Math.random() * 10000000) + 5000000
    }));
  }, []);

  // Enhance category data with transactions and revenue
  const enhancedCategoryData = useMemo(() => {
    const categoryStats = {
      'Makanan': { transactions: 456, revenue: 18500000 },
      'Minuman': { transactions: 389, revenue: 12400000 },
      'Snack': { transactions: 234, revenue: 5600000 },
      'Rokok': { transactions: 167, revenue: 4200000 },
      'Lainnya': { transactions: 89, revenue: 1800000 }
    };

    return categoryPieData.map(item => ({
      ...item,
      transactions: categoryStats[item.name]?.transactions || Math.floor(Math.random() * 300) + 50,
      revenue: categoryStats[item.name]?.revenue || Math.floor(Math.random() * 10000000) + 1000000
    }));
  }, []);

  // Enhance hourly data with transactions and insights
  const enhancedHourlyData = useMemo(() => {
    return hourlyData.map((item, index) => {
      const hour = parseInt(item.hour);
      let transactionMultiplier = 1;

      if (hour >= 7 && hour <= 9) transactionMultiplier = 1.2;
      if (hour >= 12 && hour <= 14) transactionMultiplier = 1.8;
      if (hour >= 16 && hour <= 18) transactionMultiplier = 1.4;
      if (hour >= 19 && hour <= 21) transactionMultiplier = 1.6;

      const transactions = Math.floor((item.revenue / 35000) * transactionMultiplier);

      return {
        ...item,
        transactions: Math.max(5, transactions),
        avgTransaction: item.revenue / Math.max(1, transactions)
      };
    });
  }, []);

  // Calculate profit margin for each product (assuming 40-70% margin based on product type)
  const getProductProfitMargin = (productName) => {
    const margins = {
      'Coffee': 0.7,
      'Cappuccino': 0.7,
      'Latte': 0.65,
      'Americano': 0.7,
      'Croissant': 0.6,
      'Sandwich': 0.55,
      'Salad': 0.6,
      'Juice': 0.65,
      'Smoothie': 0.6,
      'Cake': 0.55
    };

    for (const [key, margin] of Object.entries(margins)) {
      if (productName.toLowerCase().includes(key.toLowerCase())) {
        return margin;
      }
    }
    return 0.5; // Default margin 50%
  };

  useEffect(() => {
    fetchProducts().then(prods => {
      const sorted = prods.slice(0, 5).map(p => {
        const revenue = (Math.floor(Math.random() * 50) + 10) * p.price;
        const profitMargin = getProductProfitMargin(p.name);
        const profit = revenue * profitMargin;

        return {
          name: p.name.length > 15 ? p.name.slice(0, 12) + '...' : p.name,
          revenue: Math.floor(revenue),
          profit: Math.floor(profit),
          margin: (profitMargin * 100).toFixed(0)
        };
      }).sort((a, b) => b.revenue - a.revenue);
      setTopProducts(sorted);
    });
  }, []);

  // Custom tooltip for top products chart
  const ProductBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const productData = payload[0]?.payload;
      if (!productData) return null;

      return (
        <div style={tooltipStyle}>
          <p className="font-bold text-sm mb-2">{productData.name}</p>
          <div className="space-y-1.5 text-xs">
            <p className="flex justify-between gap-4">
              <span className="text-gray-500">Revenue:</span>
              <span className="font-semibold text-indigo-600">{formatCurrency(productData.revenue)}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-gray-500">Profit:</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(productData.profit)}</span>
            </p>
            <p className="flex justify-between gap-4 border-t pt-1 mt-1">
              <span className="text-gray-500">Margin:</span>
              <span className="font-semibold text-amber-600">{productData.margin}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const connectedFilteringLogic = useMemo(() => {
    let result = [...realisticTransactions];
    if (filterCategory) result = result.filter(t => t.mock_category === filterCategory);
    if (filterDate) result = result.filter(t => t.mock_day === filterDate);
    if (filterMethod) result = result.filter(t => t.payment_method.toLowerCase() === filterMethod.toLowerCase());

    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (sortConfig.key === 'total') { valA = a.grand_total; valB = b.grand_total; }

      if (valA < valB) return sortConfig.dir === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.dir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [filterCategory, filterDate, filterMethod, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(connectedFilteringLogic.length / perPage));
  const paginatedTransactions = connectedFilteringLogic.slice((currentPage - 1) * perPage, currentPage * perPage);

  const resetAllFilters = () => {
    setFilterCategory(null);
    setFilterDate(null);
    setFilterMethod(null);
    setCurrentPage(1);
  };

  const hasActiveFilters = filterCategory || filterDate || filterMethod;

  const handleExport = () => {
    if (isExporting) return;
    setIsExporting(true);
    setTimeout(() => { setIsExporting(false); }, 1500);
  };

  const toggleSort = (key) => setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));

  const getStatusStyle = (status) => {
    const statusLower = status?.toLowerCase();

    if (statusLower === 'sukses' || statusLower === 'success' || statusLower === 'selesai') {
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        darkBg: 'dark:bg-emerald-900/20',
        darkText: 'dark:text-emerald-400',
        label: 'Selesai'
      };
    }

    if (statusLower === 'hold') {
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        darkBg: 'dark:bg-amber-900/20',
        darkText: 'dark:text-amber-400',
        label: 'Hold'
      };
    }

    return {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      darkBg: 'dark:bg-amber-900/20',
      darkText: 'dark:text-amber-400',
      label: status || 'Unknown'
    };
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* 1. Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-primary">Analytics Dashboard</h1>
          <p className="text-[13px] mt-0.5 text-secondary">Monitor performa bisnis dan transaksi</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Main Range Pills */}
          <div className="flex items-center bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            {dateRanges.map(r => (
              <button
                key={r}
                onClick={() => { setActiveRange(r); setShowCustomDate(r === 'Kustom'); resetAllFilters(); }}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${activeRange === r
                    ? 'bg-indigo-600 text-white dark:bg-indigo-600 dark:text-white'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Export Tool */}
          <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <select
              value={exportFormat}
              onChange={e => setExportFormat(e.target.value)}
              className="bg-transparent text-xs font-semibold px-4 py-2 border-r border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 outline-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 min-w-[90px] justify-center"
            >
              {isExporting ? (
                <div className="w-3.5 h-3.5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin dark:border-gray-300" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {isExporting ? 'Proses...' : 'Export'}
            </button>
          </div>
        </div>
      </div>

      {showCustomDate && (
        <div className="flex items-center gap-2 text-xs bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 w-fit shadow-sm">
          <input type="date" className="bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          <span className="text-gray-400 font-semibold">-</span>
          <input type="date" className="bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          <button className="bg-gray-900 text-white px-4 py-1.5 rounded font-semibold text-xs hover:bg-gray-800 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-700">
            Terapkan
          </button>
        </div>
      )}

      {/* 2. Enhanced KPI Cards - CONSISTENT WITH DASHBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(totalRev)}
          subValue={`${totalTx} transaksi`}
          icon={DollarSign}
          trend={trends.revenue.isUp ? 'up' : 'down'}
          trendValue={Math.abs(trends.revenue.val)}
          accentColor="#6366f1"
          delay={0}
          hasPattern={true}
        />

        <KPICard
          title="Total Profit"
          value={formatCurrency(totalProfit)}
          subValue={`Margin ${margin}%`}
          icon={TrendingUp}
          trend={trends.profit.isUp ? 'up' : 'down'}
          trendValue={Math.abs(trends.profit.val)}
          accentColor="#10b981"
          delay={0.05}
          hasPattern={false}
        />

        <KPICard
          title="Total Transaksi"
          value={totalTx.toFixed(0)}
          subValue={`${rawTx} pesanan`}
          icon={ShoppingCart}
          trend={trends.transactions.isUp ? 'up' : 'down'}
          trendValue={Math.abs(trends.transactions.val)}
          accentColor="#f59e0b"
          delay={0.1}
          hasPattern={false}
        />

        <KPICard
          title="Rata-rata Transaksi"
          value={formatCurrency(avgTransaction)}
          subValue={`vs minggu lalu ${trends.avgTx.val}%`}
          icon={ReceiptText}
          trend={trends.avgTx.isUp ? 'up' : 'down'}
          trendValue={Math.abs(trends.avgTx.val)}
          accentColor="#8b5cf6"
          delay={0.15}
          hasPattern={true}
        />
      </div>

      {/* 3. Main Chart Area - Compact Heights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* L: Main Trend Chart */}
        <div className="lg:col-span-2 card-flat p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-bold text-primary">Trend Performa</h3>
              {filterDate && (
                <span
                  className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer"
                  onClick={() => setFilterDate(null)}
                >
                  {filterDate} <X className="w-3 h-3" />
                </span>
              )}
            </div>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-0.5 rounded-lg">
              {['revenue', 'profit', 'both'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setMainChartMode(mode)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md capitalize transition-all ${mainChartMode === mode
                    ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                    }`}
                >
                  {mode === 'both' ? 'Keduanya' : mode === 'revenue' ? 'Revenue' : 'Profit'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesChartData}
                onClick={(e) => { if (e?.activeLabel) setFilterDate(e.activeLabel) }}
                className="cursor-pointer"
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 500 }}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                  dx={-8}
                  width={30}
                />
                <Tooltip content={<MainChartTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                {(mainChartMode === 'both' || mainChartMode === 'revenue') && (
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGradient)" name="Revenue" />
                )}
                {(mainChartMode === 'both' || mainChartMode === 'profit') && (
                  <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="url(#profitGradient)" name="Profit" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* R: Top Products - UPDATED with Revenue & Profit bars */}
        <div className="card-flat p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold text-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Top 5 Produk
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-semibold">
              <span className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></div>
                <span className="text-gray-500 dark:text-gray-400">Revenue</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div>
                <span className="text-gray-500 dark:text-gray-400">Profit</span>
              </span>
            </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                barGap={4}
                barCategoryGap={12}
              >
                <CartesianGrid horizontal={false} vertical={false} strokeDasharray="3 3" />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 500 }}
                  width={85}
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<ProductBarTooltip />} cursor={{ fill: 'var(--color-surface-100)' }} />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#6366f1"
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                >
                  {topProducts.map((_, i) => (
                    <Cell key={`revenue-${i}`} fill="#6366f1" />
                  ))}
                </Bar>
                <Bar
                  dataKey="profit"
                  name="Profit"
                  fill="#10b981"
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                >
                  {topProducts.map((_, i) => (
                    <Cell key={`profit-${i}`} fill="#10b981" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Optional: Add small margin summary */}
          {topProducts.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                <span>Rata-rata margin: {(topProducts.reduce((sum, p) => sum + parseFloat(p.margin), 0) / topProducts.length).toFixed(0)}%</span>
                <span>Total profit: {formatCurrency(topProducts.reduce((sum, p) => sum + p.profit, 0))}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Secondary Distributions - With Enhanced Tooltips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Pie */}
        <div className="card-flat p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold text-primary">Kategori Produk</h3>
            {filterCategory && (
              <span
                className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer"
                onClick={() => setFilterCategory(null)}
              >
                {filterCategory} <X className="w-3 h-3" />
              </span>
            )}
          </div>
          <div className="h-[170px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={enhancedCategoryData}
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                  onClick={(e) => { if (e?.name) setFilterCategory(filterCategory === e.name ? null : e.name); }}
                  className="cursor-pointer"
                >
                  {enhancedCategoryData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.fill}
                      opacity={filterCategory ? (filterCategory === entry.name ? 1 : 0.3) : 1}
                    />
                  ))}
                </Pie>
                <Tooltip content={(props) => <CategoryTooltip {...props} totalRevenue={totalRevenue} />} />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: '10px', fontWeight: 500 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Bar */}
        <div className="card-flat p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold text-primary">Metode Pembayaran</h3>
            {filterMethod && (
              <span
                className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer"
                onClick={() => setFilterMethod(null)}
              >
                {filterMethod} <X className="w-3 h-3" />
              </span>
            )}
          </div>
          <div className="h-[170px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={enhancedPaymentData}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                onClick={(e) => { if (e?.activeLabel) setFilterMethod(filterMethod === e.activeLabel ? null : e.activeLabel) }}
                className="cursor-pointer"
              >
                <CartesianGrid horizontal={false} vertical={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 500 }}
                  width={65}
                />
                <XAxis type="number" hide />
                <Tooltip content={(props) => <PaymentTooltip {...props} totalRevenue={totalRevenue} />} cursor={{ fill: 'var(--color-surface-100)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                  {enhancedPaymentData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.fill}
                      opacity={filterMethod ? (filterMethod === entry.name ? 1 : 0.3) : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hour */}
        <div className="card-flat p-5">
          <h3 className="text-[13px] font-bold text-primary mb-3 text-center">Jam Sibuk Operasional</h3>
          <div className="h-[170px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enhancedHourlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: 'var(--color-text-muted)', fontWeight: 500 }}
                  dy={4}
                />
                <YAxis hide />
                <Tooltip content={<HourlyTooltip />} cursor={{ fill: 'var(--color-surface-100)' }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[3, 3, 0, 0]} barSize={20}>
                  {enhancedHourlyData.map((entry, index) => {
                    const hour = parseInt(entry.hour);
                    let color;
                    if (hour >= 12 && hour <= 14) color = '#f59e0b';
                    else if (hour >= 19 && hour <= 21) color = '#ef4444';
                    else if (hour >= 7 && hour <= 9) color = '#f97316';
                    else color = '#10b981';
                    return <Cell key={index} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Core Audit Table */}
      <div className="card-flat overflow-hidden">

        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/20">

          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-bold text-primary">
              Audit Transaksi
            </h3>

            {hasActiveFilters && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                <Filter className="w-3 h-3" />
                Filter Aktif
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-[11px] font-semibold text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 rounded-lg shadow-sm"
            >
              <X className="w-3 h-3" />
              Reset Semua
            </button>
          )}
        </div>

        {/* Empty State */}
        {connectedFilteringLogic.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
              <PackageOpen className="w-7 h-7 text-gray-400 dark:text-gray-500" />
            </div>

            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              Tidak ada transaksi
            </h4>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Filter tidak menemukan data yang sesuai
            </p>

            <button
              onClick={resetAllFilters}
              className="mt-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">

                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50">
                    {[
                      { key: 'created_at', label: 'WAKTU', align: 'center' },
                      { key: 'invoice', label: 'INVOICE', align: 'center' },
                      { key: 'total', label: 'TOTAL', align: 'center' },
                      { key: 'payment_method', label: 'METODE', align: 'center' },
                      { key: 'status', label: 'STATUS', align: 'center' }
                    ].map(col => (
                      <th
                        key={col.key}
                        onClick={() => toggleSort(col.key)}
                        className={`
                          py-3 px-5 text-[12px] font-semibold
                          text-gray-600 dark:text-gray-400
                          ${col.align === 'center' ? 'text-center' : 'text-center'}
                          cursor-pointer select-none
                          hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors
                        `}
                      >
                        <div className={`flex items-center gap-1.5 ${col.align === 'center' ? 'justify-center' : ''}`}>
                          {col.label}
                          {sortConfig.key === col.key && (
                            sortConfig.dir === 'asc'
                              ? <ArrowUp className="w-3 h-3" />
                              : <ArrowDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {paginatedTransactions.map(t => {
                    const isQris = t.payment_method === 'qris';
                    const isDebit = t.payment_method === 'debit';
                    const MethodIcon = isQris ? QrCode : isDebit ? CreditCard : Banknote;

                    return (
                      <tr
                        key={t.id}
                        className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >

                        {/* WAKTU */}
                        <td className="py-3 px-5 text-center text-[12px] text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                          {new Date(t.created_at).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>

                        {/* INVOICE */}
                        <td className="py-3 px-5 text-center font-mono font-bold text-[12px] text-indigo-600 dark:text-indigo-400 underline decoration-gray-200 underline-offset-2">
                          {t.invoice}
                        </td>

                        {/* TOTAL */}
                        <td className="py-3 px-5 text-center font-bold text-[12px] text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {formatCurrency(t.grand_total || t.total)}
                        </td>

                        {/* METODE */}
                        <td className="py-3 px-5 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold uppercase
                              ${t.payment_method === 'qris'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                : t.payment_method === 'debit'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              }`}
                          >
                            <MethodIcon className="w-3 h-3" />
                            {t.payment_method}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="py-3 px-5 text-center">
                          <span
                            className={`
                              inline-flex items-center px-2.5 py-1 rounded-md
                              text-[11px] font-semibold uppercase
                              ${getStatusStyle(t.status).bg}
                              ${getStatusStyle(t.status).text}
                              ${getStatusStyle(t.status).darkBg}
                              ${getStatusStyle(t.status).darkText}
                            `}
                          >
                            {getStatusStyle(t.status).label}
                          </span>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20">

              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Menampilkan {(currentPage - 1) * perPage + 1}–
                {Math.min(currentPage * perPage, connectedFilteringLogic.length)} dari {connectedFilteringLogic.length} transaksi
              </p>

              <div className="flex items-center gap-1">

                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>

                <div className="hidden sm:flex gap-1 px-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;

                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-7 h-7 rounded-lg text-[12px] font-semibold transition-all hover:scale-105"
                        style={{
                          background: pageNum === currentPage ? '#6366f1' : 'transparent',
                          color: pageNum === currentPage ? '#fff' : 'var(--color-text-muted)',
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Add MainChartTooltip component (needed for the main chart)
const MainChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={tooltipStyle}>
        <p className="font-bold text-sm mb-1">{payload[0].payload.date}</p>
        <div className="space-y-1 text-xs">
          {payload.map((entry, index) => (
            <p key={index} className="flex justify-between gap-3">
              <span className="text-gray-500">{entry.name}:</span>
              <span className="font-semibold" style={{ color: entry.color }}>
                {formatCurrency(entry.value)}
              </span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};