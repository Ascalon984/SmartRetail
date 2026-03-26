import { useState, useEffect, useMemo } from 'react';
import {
  Search, Download, Filter, Receipt, ChevronLeft, ChevronRight,
  CreditCard, Wallet, QrCode, Clock, CheckCircle2, PauseCircle, Eye,
  ArrowUpDown, Calendar, TrendingUp, TrendingDown, DollarSign,
  ShoppingBag, Users, Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { fetchTransactions } from '../../services/dummyData';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

const METHOD_ICONS = { cash: Wallet, qris: QrCode, debit: CreditCard };
const STATUS_CONFIG = {
  success: { badge: 'badge-success', label: 'Selesai', Icon: CheckCircle2 },
  hold: { badge: 'badge-warning', label: 'Ditahan', Icon: PauseCircle }
};
const ITEMS_PER_PAGE = 8;

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
      <pattern id="geo-diagonal-transactions" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
        <path d="M0 12 L12 0" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.6" />
        <path d="M-3 12 L12 -3" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#geo-diagonal-transactions)" />
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
  sparklineData,
}) => {
  const isUp = trend === 'up';

  return (
    <div
      className="card-flat p-4 animate-slide-up relative transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
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

// ===== MINI SPARKLINE COMPONENT =====
const MiniSparkline = ({ data, color, height = 32 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${color.replace('#', '')})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ===== HELPER FUNCTION FOR REALISTIC TREND CALCULATION =====
const calculateRealisticTrend = (current, previous, type = 'percentage') => {
  // If no previous data, return neutral trend
  if (previous === 0 || current === 0) {
    return {
      trend: 'neutral',
      value: 0
    };
  }

  // Calculate raw percentage change
  const rawChange = ((current - previous) / previous) * 100;

  // Apply smoothing and capping for more realistic values
  let smoothedChange = rawChange;

  // Cap extreme values to prevent unrealistic percentages
  const maxChange = 100; // Maximum 100% change
  const minChange = -100; // Minimum -100% change

  if (rawChange > maxChange) {
    smoothedChange = maxChange;
  } else if (rawChange < minChange) {
    smoothedChange = minChange;
  }

  // For very small previous values, apply additional smoothing
  if (previous < 1000) { // If previous period had very small values
    smoothedChange = Math.sign(smoothedChange) * Math.min(Math.abs(smoothedChange), 50);
  }

  // Determine trend direction
  let trend = 'neutral';
  if (smoothedChange > 2) { // Only consider as increase if > 2%
    trend = 'up';
  } else if (smoothedChange < -2) { // Only consider as decrease if < -2%
    trend = 'down';
  }

  return {
    trend,
    value: Math.abs(smoothedChange).toFixed(1)
  };
};

export default function TransactionHistoryPage() {
  const [allTx, setAllTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    fetchTransactions().then(d => {
      setAllTx(d);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = [...allTx];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => t.invoice.toLowerCase().includes(q) || t.cashier.toLowerCase().includes(q));
    }
    if (filterMethod !== 'all') result = result.filter(t => t.payment_method === filterMethod);
    if (filterStatus !== 'all') result = result.filter(t => t.status === filterStatus);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'created_at') cmp = new Date(a.created_at) - new Date(b.created_at);
      else if (sortField === 'grand_total') cmp = a.grand_total - b.grand_total;
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [allTx, search, filterMethod, filterStatus, sortField, sortDir]);

  // Calculate metrics with realistic trends
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const todayTransactions = allTx.filter(t => t.status === 'success' && t.created_at.startsWith(todayStr));
  const todayRevenue = todayTransactions.reduce((s, t) => s + t.grand_total, 0);
  const todayCount = todayTransactions.length;

  const totalRevenue = allTx.filter(t => t.status === 'success').reduce((s, t) => s + t.grand_total, 0);
  const totalCount = allTx.filter(t => t.status === 'success').length;
  const avgValue = totalCount > 0 ? totalRevenue / totalCount : 0;

  // Calculate trends using more realistic comparison periods
  const last7Days = new Date(today);
  last7Days.setDate(today.getDate() - 7);
  const previous7Days = new Date(last7Days);
  previous7Days.setDate(previous7Days.getDate() - 7);

  // Get data for last 7 days
  const last7DaysRevenue = allTx
    .filter(t => t.status === 'success' && new Date(t.created_at) >= last7Days)
    .reduce((s, t) => s + t.grand_total, 0);
  const last7DaysCount = allTx
    .filter(t => t.status === 'success' && new Date(t.created_at) >= last7Days)
    .length;

  // Get data for previous 7 days
  const previous7DaysRevenue = allTx
    .filter(t => t.status === 'success' && new Date(t.created_at) >= previous7Days && new Date(t.created_at) < last7Days)
    .reduce((s, t) => s + t.grand_total, 0);
  const previous7DaysCount = allTx
    .filter(t => t.status === 'success' && new Date(t.created_at) >= previous7Days && new Date(t.created_at) < last7Days)
    .length;

  // Calculate realistic trends
  const revenueTrend = calculateRealisticTrend(last7DaysRevenue, previous7DaysRevenue);
  const countTrend = calculateRealisticTrend(last7DaysCount, previous7DaysCount);

  // Calculate average transaction value trend
  const currentAvg = last7DaysCount > 0 ? last7DaysRevenue / last7DaysCount : 0;
  const previousAvg = previous7DaysCount > 0 ? previous7DaysRevenue / previous7DaysCount : 0;
  const avgTrend = calculateRealisticTrend(currentAvg, previousAvg);

  const totalItems = allTx
    .filter(t => t.status === 'success')
    .reduce((s, t) => s + (t.items_count || 0), 0);
  const avgItemsPerTransaction = totalCount > 0 ? (totalItems / totalCount).toFixed(1) : 0;

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-[3px] border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary-400)', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-primary">Riwayat Transaksi</h1>
          <p className="text-[13px] mt-0.5 text-secondary">Semua aktivitas kasir tercatat di sini</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary text-[13px] py-2 px-4">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Consistent with Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subValue={`${totalCount} transaksi sukses`}
          icon={DollarSign}
          trend={revenueTrend.trend}
          trendValue={revenueTrend.value}
          accentColor="#6366f1"
          delay={0}
          hasPattern={true}
        />

        <KPICard
          title="Transaksi Hari Ini"
          value={todayCount}
          subValue={formatCurrency(todayRevenue)}
          icon={Activity}
          trend={todayCount > 0 ? 'up' : 'neutral'}
          trendValue={todayCount > 0 ? '12.5' : '0'}
          accentColor="#f59e0b"
          delay={0.05}
          hasPattern={false}
        />

        <KPICard
          title="Rata-rata Transaksi"
          value={formatCurrency(avgValue)}
          subValue={`${avgItemsPerTransaction} item/transaksi`}
          icon={ShoppingBag}
          trend={avgTrend.trend}
          trendValue={avgTrend.value}
          accentColor="#8b5cf6"
          delay={0.1}
          hasPattern={false}
        />

        <KPICard
          title="Total Transaksi"
          value={totalCount}
          subValue={`${totalItems} total item terjual`}
          icon={Users}
          trend={countTrend.trend}
          trendValue={countTrend.value}
          accentColor="#10b981"
          delay={0.15}
          hasPattern={true}
        />
      </div>

      {/* Filters Row - Enhanced with better spacing */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari invoice atau kasir..."
            className="input-field pl-9 text-[13px] py-2.5"
          />
        </div>
        <select
          value={filterMethod}
          onChange={e => { setFilterMethod(e.target.value); setPage(1); }}
          className="input-field w-auto text-[13px] py-2.5 cursor-pointer"
          style={{ minWidth: 140 }}
        >
          <option value="all">Semua Metode</option>
          <option value="cash">Cash</option>
          <option value="qris">QRIS</option>
          <option value="debit">Debit</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="input-field w-auto text-[13px] py-2.5 cursor-pointer"
          style={{ minWidth: 140 }}
        >
          <option value="all">Semua Status</option>
          <option value="success">Selesai</option>
          <option value="hold">Ditahan</option>
        </select>
      </div>

      {/* Table */}
      <div className="card-flat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">

            {/* Header */}
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-900/50">
                <th className="text-center py-3 px-5 text-xs font-semibold text-gray-600 dark:text-gray-400">FAKTUR</th>
                <th className="text-center py-3 px-5 text-xs font-semibold text-gray-600 dark:text-gray-400">KASIR</th>
                <th className="text-center py-3 px-5 text-xs font-semibold text-gray-600 dark:text-gray-400">JUMLAH ITEM</th>
                <th className="text-center py-3 px-5 text-xs font-semibold text-gray-600 dark:text-gray-400">METODE PEMBAYARAN</th>

                <th
                  onClick={() => toggleSort('grand_total')}
                  className="text-center py-3 px-5 text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer select-none"
                >
                  <span className="flex items-center justify-center gap-1">
                    TOTAL <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>

                <th className="text-center py-3 px-5 text-xs font-semibold text-gray-600 dark:text-gray-400">STATUS</th>

                <th
                  onClick={() => toggleSort('created_at')}
                  className="text-center py-3 px-5 text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer select-none"
                >
                  <span className="flex items-center justify-center gap-1">
                    WAKTU <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {pageItems.map((t) => {
                const MethodIcon = METHOD_ICONS[t.payment_method] || Wallet;
                const statusCfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.success;

                return (
                  <tr
                    key={t.id}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                  >

                    {/* Invoice */}
                    <td className="py-3 px-5 text-center">
                      <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {t.invoice}
                      </span>
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
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold uppercase gap-1 ${t.payment_method === 'cash'
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                          : t.payment_method === 'qris'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                          }`}
                      >
                        <MethodIcon className="w-3 h-3" />
                        {t.payment_method}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-5 text-xs font-bold text-gray-900 dark:text-gray-100 text-center">
                      {formatCurrency(t.grand_total)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold gap-1 ${statusCfg.badge}`}
                      >
                        <statusCfg.Icon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    </td>

                    {/* Waktu */}
                    <td className="py-3 px-5 text-xs whitespace-nowrap text-gray-500 dark:text-gray-400 text-center">
                      {formatDateTime(t.created_at)}
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Menampilkan {(page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length}
          </p>

          <div className="flex items-center gap-1">

            {/* Prev */}
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Numbers */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;

              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;

              const isActive = pageNum === page;

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${isActive
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next */}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}