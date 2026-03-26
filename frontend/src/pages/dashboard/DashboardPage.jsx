import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, Wallet,
  ArrowRight, AlertTriangle, Plus, ShoppingCart, Clock, Receipt,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { fetchDashboardStats, salesChartData, categoryPieData, paymentMethodData, lowStockProducts, hourlyData, transactions } from '../../services/dummyData';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

// ===== GEOMETRIC PATTERN COMPONENT =====
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
      <pattern id="geo-diagonal-dashboard" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
        <path d="M0 12 L12 0" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.6" />
        <path d="M-3 12 L12 -3" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#geo-diagonal-dashboard)" />
  </svg>
);

// ===== KPI CARD COMPONENT (DIPERBAIKI DENGAN KONTRAST YANG LEBIH BAIK) =====
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
  sparklineData,
}) => {
  const isUp = trend === 'up';

  return (
    <div
      className="card-flat p-5 animate-slide-up relative transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
      style={{
        animationDelay: `${delay}s`,
        background: `linear-gradient(135deg, ${accentColor}08 0%, ${accentColor}15 50%, ${accentColor}08 100%)`,
        position: 'relative',
        overflow: 'hidden',
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
          {sparklineData && (
            <div className="w-16 ml-2">
              <ResponsiveContainer width="100%" height={32}>
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id={`spark-${accentColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={accentColor} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={accentColor}
                    strokeWidth={1.8}
                    fill={`url(#spark-${accentColor.replace('#', '')})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== TOOLTIP STYLES =====
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

// ===== MAIN CHART TOOLTIP =====
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

// ===== CATEGORY TOOLTIP =====
const CategoryTooltip = ({ active, payload, totalRevenue }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const categoryStats = {
      'Makanan': { transactions: 456, revenue: 18500000 },
      'Minuman': { transactions: 389, revenue: 12400000 },
      'Snack': { transactions: 234, revenue: 5600000 },
      'Rokok': { transactions: 167, revenue: 4200000 },
      'Lainnya': { transactions: 89, revenue: 1800000 }
    };

    const stats = categoryStats[data.name] || { transactions: Math.floor(Math.random() * 300) + 50, revenue: (data.value / 100) * totalRevenue };

    return (
      <div style={tooltipStyle}>
        <p className="font-bold text-sm mb-1">{data.name}</p>
        <div className="space-y-1 text-xs">
          <p className="flex justify-between gap-3">
            <span className="text-gray-500">Penjualan:</span>
            <span className="font-semibold">{stats.transactions} transaksi</span>
          </p>
          <p className="flex justify-between gap-3">
            <span className="text-gray-500">Revenue:</span>
            <span className="font-semibold text-indigo-600">{formatCurrency(stats.revenue)}</span>
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

// ===== PAYMENT METHOD TOOLTIP =====
const PaymentTooltip = ({ active, payload, totalRevenue }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const paymentStats = {
      'QRIS': { frequency: 345, revenue: 12450000 },
      'Debit': { frequency: 278, revenue: 9870000 },
      'Cash': { frequency: 210, revenue: 7320000 }
    };

    const stats = paymentStats[data.name] || { frequency: Math.floor(Math.random() * 300) + 100, revenue: (data.value / 100) * totalRevenue };

    return (
      <div style={tooltipStyle}>
        <p className="font-bold text-sm mb-1">{data.name}</p>
        <div className="space-y-1 text-xs">
          <p className="flex justify-between gap-3">
            <span className="text-gray-500">Frekuensi:</span>
            <span className="font-semibold">{stats.frequency} transaksi</span>
          </p>
          <p className="flex justify-between gap-3">
            <span className="text-gray-500">Revenue:</span>
            <span className="font-semibold text-indigo-600">{formatCurrency(stats.revenue)}</span>
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

// ===== HOURLY TOOLTIP =====
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

// ===== MAIN DASHBOARD COMPONENT =====
export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterMethod, setFilterMethod] = useState(null);

  useEffect(() => {
    fetchDashboardStats().then((data) => { setStats(data); setLoading(false); });
  }, []);

  const totalRevenue = salesChartData.reduce((s, d) => s + d.revenue, 0);

  const sparklineRevenue = salesChartData.map(item => ({ value: item.revenue }));
  const sparklineProfit = salesChartData.map(item => ({ value: item.profit }));
  const sparklineTransactions = salesChartData.map(item => ({ value: item.transactions || Math.floor(item.revenue / 50000) }));
  const sparklineAvgTransaction = salesChartData.map(item => ({ value: (item.revenue / (item.transactions || 1)) }));

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

  const filteredCategoryData = useMemo(() => {
    if (!filterCategory) return categoryPieData;
    return categoryPieData.filter(item => item.name === filterCategory);
  }, [filterCategory]);

  const filteredPaymentData = useMemo(() => {
    if (!filterMethod) return paymentMethodData;
    return paymentMethodData.filter(item => item.name === filterMethod);
  }, [filterMethod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary-400)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const pct = (a, b) => b === 0 ? 0 : (((a - b) / b) * 100).toFixed(1);
  const revenueChange = pct(stats.todayRevenue, stats.yesterdayRevenue);
  const txChange = pct(stats.todayTransactions, stats.yesterdayTransactions);
  const avgChange = pct(stats.avgTransactionValue, stats.yesterdayAvgValue);
  const profitChange = pct(stats.todayProfit, stats.yesterdayProfit);

  const recentTx = transactions.filter(t => t.status === 'success').slice(0, 5);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-primary">Selamat Datang! 👋</h1>
          <p className="text-[13px] mt-0.5 text-secondary">Ringkasan performa bisnis Anda hari ini</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/pos')} className="btn-primary text-[13px] py-2 px-4" id="quick-new-transaction">
            <ShoppingCart className="w-4 h-4" /> Kasir Baru
          </button>
          <button onClick={() => navigate('/reports')} className="btn-secondary text-[13px] py-2 px-4">
            <Receipt className="w-4 h-4" /> Laporan
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Omzet Hari Ini"
          value={formatCurrency(stats.todayRevenue)}
          subValue={`Kemarin: ${formatCurrency(stats.yesterdayRevenue)}`}
          icon={DollarSign}
          trend={revenueChange >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(revenueChange)}
          accentColor="#6366f1"
          delay={0}
          hasPattern={true}
          sparklineData={sparklineRevenue}
        />
        <KPICard
          title="Total Transaksi"
          value={stats.todayTransactions}
          subValue={`Kemarin: ${stats.yesterdayTransactions}`}
          icon={ShoppingBag}
          trend={txChange >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(txChange)}
          accentColor="#f59e0b"
          delay={0.05}
          sparklineData={sparklineTransactions}
        />
        <KPICard
          title="Rata-rata / Trx"
          value={formatCurrency(stats.avgTransactionValue)}
          subValue={`Kemarin: ${formatCurrency(stats.yesterdayAvgValue)}`}
          icon={Wallet}
          trend={avgChange >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(avgChange)}
          accentColor="#8b5cf6"
          delay={0.1}
          sparklineData={sparklineAvgTransaction}
        />
        <KPICard
          title="Profit Hari Ini"
          value={formatCurrency(stats.todayProfit)}
          subValue={`Kemarin: ${formatCurrency(stats.yesterdayProfit)}`}
          icon={TrendingUp}
          trend={profitChange >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(profitChange)}
          accentColor="#10b981"
          delay={0.15}
          hasPattern={true}
          sparklineData={sparklineProfit}
        />
      </div>

      {/* Charts Row 1: Revenue Trend + Hourly Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 card-flat p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[13px] font-bold text-primary">Tren Mingguan</h3>
              <p className="text-[11px] text-muted">Revenue vs Profit — 7 hari terakhir</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Revenue</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Profit</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesChartData}>
              <defs>
                <linearGradient id="rev-g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="prof-g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<MainChartTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#rev-g)" dot={false} activeDot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="url(#prof-g)" dot={false} activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 card-flat p-5">
          <h3 className="text-[13px] font-bold mb-1 text-primary">Distribusi per Jam</h3>
          <p className="text-[11px] mb-4 text-muted">Volume penjualan hari ini</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={enhancedHourlyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={35} />
              <Tooltip content={<HourlyTooltip />} cursor={{ fill: 'var(--color-surface-100)' }} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]} opacity={0.85}>
                {enhancedHourlyData.map((entry, index) => {
                  const hour = parseInt(entry.hour);
                  let color = '#6366f1';
                  if (hour >= 12 && hour <= 14) color = '#f59e0b';
                  else if (hour >= 19 && hour <= 21) color = '#ef4444';
                  else if (hour >= 7 && hour <= 9) color = '#f97316';
                  return <Cell key={index} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Donut charts + Low stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Donut - WITH CENTERED LEGEND */}
        <div className="card-flat p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold text-primary">Kategori Terlaris</h3>
            {filterCategory && (
              <button
                onClick={() => setFilterCategory(null)}
                className="text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-muted dark:text-gray-400"
              >
                <span className="w-1 h-1 rounded-full bg-current" /> {filterCategory} ✕
              </button>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={filteredCategoryData}
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                  onClick={(e) => {
                    if (e?.name) {
                      setFilterCategory(filterCategory === e.name ? null : e.name);
                    }
                  }}
                  className="cursor-pointer"
                >
                  {categoryPieData.map((e, i) => (
                    <Cell
                      key={i}
                      fill={e.fill}
                      opacity={filterCategory ? (filterCategory === e.name ? 1 : 0.3) : 1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CategoryTooltip totalRevenue={totalRevenue} />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend - CENTERED */}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3">
              {categoryPieData.map((e) => (
                <button
                  key={e.name}
                  onClick={() => setFilterCategory(filterCategory === e.name ? null : e.name)}
                  className={`flex items-center gap-1 text-[10px] transition-all ${filterCategory === e.name
                    ? 'font-bold'
                    : filterCategory ? 'opacity-40' : 'opacity-80'
                    }`}
                  style={{ color: filterCategory === e.name ? e.fill : 'var(--color-text-muted)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: e.fill }} />
                  {e.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Method - WITH CENTERED LEGEND */}
        <div className="card-flat p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold text-primary">Metode Pembayaran</h3>
            {filterMethod && (
              <button
                onClick={() => setFilterMethod(null)}
                className="text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-muted dark:text-gray-400"
              >
                <span className="w-1 h-1 rounded-full bg-current" /> {filterMethod} ✕
              </button>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={filteredPaymentData}
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                  onClick={(e) => {
                    if (e?.name) {
                      setFilterMethod(filterMethod === e.name ? null : e.name);
                    }
                  }}
                  className="cursor-pointer"
                >
                  {paymentMethodData.map((e, i) => (
                    <Cell
                      key={i}
                      fill={e.fill}
                      opacity={filterMethod ? (filterMethod === e.name ? 1 : 0.3) : 1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PaymentTooltip totalRevenue={totalRevenue} />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend - CENTERED */}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3">
              {paymentMethodData.map((e) => (
                <button
                  key={e.name}
                  onClick={() => setFilterMethod(filterMethod === e.name ? null : e.name)}
                  className={`flex items-center gap-1 text-[10px] transition-all ${filterMethod === e.name
                    ? 'font-bold'
                    : filterMethod ? 'opacity-40' : 'opacity-80'
                    }`}
                  style={{ color: filterMethod === e.name ? e.fill : 'var(--color-text-muted)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: e.fill }} />
                  {e.name} ({e.value}%)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts - DIPERBAIKI UNTUK DARK THEME */}
        <div className="lg:col-span-2 card-flat p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <h3 className="text-[13px] font-bold text-primary">Stok Menipis</h3>
              <span className="badge badge-warning dark:bg-amber-500/20 dark:text-amber-400">{lowStockProducts.length}</span>
            </div>
            <button
              onClick={() => navigate('/inventory')}
              className="text-[11px] font-semibold flex items-center gap-0.5 transition-colors hover:underline text-indigo-600 dark:text-indigo-400"
              id="view-all-low-stock"
            >
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {lowStockProducts.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0 border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <Package className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold leading-tight text-gray-900 dark:text-gray-100">{p.name}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{p.sku}</p>
                  </div>
                </div>
                <span className={`badge ${p.stock <= 5
                  ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                  }`}>
                  {p.stock} pcs
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card-flat overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Transaksi Terbaru
            </h3>
          </div>

          <button
            onClick={() => navigate('/transactions')}
            className="text-xs font-semibold flex items-center gap-1 hover:underline text-indigo-600 dark:text-indigo-400"
          >
            Semua <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">

            {/* Header */}
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-900/50">
                <th className="py-3 px-5 text-xs font-semibold text-gray-600 dark:text-gray-400 text-center">
                  FAKTUR
                </th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-600 dark:text-gray-400 text-center">
                  KASIR
                </th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-600 dark:text-gray-400 text-center">
                  JUMLAH ITEM
                </th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-600 dark:text-gray-400 text-center">
                  METODE PEMBAYARAN
                </th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-600 dark:text-gray-400 text-center">
                  TOTAL
                </th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-600 dark:text-gray-400 text-center">
                  WAKTU
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {recentTx.map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                >

                  {/* Invoice */}
                  <td className="py-3 px-5 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 text-center">
                    {t.invoice}
                  </td>

                  {/* Kasir */}
                  <td className="py-3 px-5 text-xs font-medium text-gray-900 dark:text-gray-100 text-center">
                    {t.cashier}
                  </td>

                  {/* Items */}
                  <td className="py-3 px-5 text-xs text-gray-600 dark:text-gray-400 text-center">
                    {t.items_count} item
                  </td>

                  {/* Metode */}
                  <td className="py-3 px-5 text-center">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md uppercase ${t.payment_method === 'cash'
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                        : t.payment_method === 'qris'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                        }`}
                    >
                      {t.payment_method}
                    </span>
                  </td>

                  {/* Total */}
                  <td className="py-3 px-5 text-xs font-bold text-gray-900 dark:text-gray-100 text-center">
                    {formatCurrency(t.grand_total)}
                  </td>

                  {/* Waktu */}
                  <td className="py-3 px-5 text-xs text-gray-500 dark:text-gray-400 text-center">
                    {formatDateTime(t.created_at)}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}