import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  UserPlus, Shield, MoreVertical, Mail, CheckCircle2, X, Send,
  Crown, ShieldCheck, ScanLine, Users, UserCheck, UserX,
  ChevronDown, Edit2, Trash2, RefreshCw, AlertCircle, Info,
  ChevronRight, Clock, Calendar, Filter, Search, Download,
  Copy, Check, WifiOff
} from 'lucide-react';
import { fetchStaff, roleLabels, roleColors } from '../../services/dummyData';

const ROLE_ICONS = { owner: Crown, admin: ShieldCheck, cashier: ScanLine };
const ROLE_OPTIONS = [
  { value: 'owner', label: 'Pemilik', icon: Crown, description: 'Akses penuh ke semua fitur' },
  { value: 'admin', label: 'Admin', icon: ShieldCheck, description: 'Kelola toko & laporan' },
  { value: 'cashier', label: 'Kasir', icon: ScanLine, description: 'Hanya akses POS' }
];

const STATUS_STYLES = {
  active: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', label: 'Aktif', dot: 'bg-green-500' },
  pending: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', label: 'Menunggu', dot: 'bg-yellow-500' },
  inactive: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', label: 'Nonaktif', dot: 'bg-gray-400' }
};

const formatLastActive = (date) => {
  if (!date) return 'Belum pernah login';
  const lastActive = new Date(date);
  const now = new Date();
  const diffHours = Math.floor((now - lastActive) / (1000 * 60 * 60));

  if (diffHours < 1) return 'Aktif sekarang';
  if (diffHours < 24) return `Aktif ${diffHours} jam lalu`;
  if (diffHours < 48) return 'Aktif kemarin';
  return `Aktif ${Math.floor(diffHours / 24)} hari lalu`;
};

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getRandomColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
};

function RoleBadge({ role, size = 'sm' }) {
  const Icon = ROLE_ICONS[role] || Shield;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass}`}
      style={{ background: `${roleColors[role]}15`, color: roleColors[role] }}>
      <Icon className="w-3 h-3" />
      {roleLabels[role]}
    </span>
  );
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

function ActionMenu({ member, onRoleChange, onDeactivate, onRemove, onResendInvite }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Menu aksi"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 animate-scale-in">
          <div className="py-1">
            {member.status === 'pending' && (
              <button
                onClick={() => { onResendInvite(member); setIsOpen(false); }}
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Kirim Ulang Undangan
              </button>
            )}

            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
              <p className="text-[10px] font-medium text-gray-500 mb-1">Ubah Role</p>
              {ROLE_OPTIONS.filter(opt => opt.value !== 'owner' || member.role === 'owner').map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { onRoleChange(member, opt.value); setIsOpen(false); }}
                  className="w-full text-left text-xs py-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  disabled={member.role === opt.value}
                >
                  <opt.icon className="w-3 h-3" />
                  <span>{opt.label}</span>
                  {member.role === opt.value && <Check className="w-3 h-3 ml-auto" />}
                </button>
              ))}
            </div>

            {member.status === 'active' && (
              <button
                onClick={() => { onDeactivate(member); setIsOpen(false); }}
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
              >
                <UserX className="w-3.5 h-3.5" />
                Nonaktifkan Akun
              </button>
            )}

            {member.status === 'inactive' && (
              <button
                onClick={() => { onDeactivate(member); setIsOpen(false); }}
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Aktifkan Kembali
              </button>
            )}

            <button
              onClick={() => { onRemove(member); setIsOpen(false); }}
              className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-gray-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus Anggota
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteRole, setInviteRole] = useState('cashier');
  const [invited, setInvited] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showRoleGuide, setShowRoleGuide] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(null);

  useEffect(() => {
    fetchStaff().then(data => {
      setStaff(data);
      setLoading(false);
    });
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setShowSuccessMessage({ message, type });
    setTimeout(() => setShowSuccessMessage(null), 3000);
  }, []);

  const handleInvite = useCallback(() => {
    if (!inviteEmails.trim()) return;

    const emails = inviteEmails.split(',').map(e => e.trim()).filter(e => e);
    const invalidEmails = emails.filter(e => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (invalidEmails.length > 0) {
      showToast(`Email tidak valid: ${invalidEmails.join(', ')}`, 'error');
      return;
    }

    const newMembers = emails.map(email => ({
      id: Date.now() + Math.random(),
      name: email.split('@')[0],
      email: email,
      role: inviteRole,
      status: 'pending',
      avatar: null,
      joined_at: null,
      last_active: null,
    }));

    setStaff(prev => [...prev, ...newMembers]);
    setInvited(true);
    showToast(`${newMembers.length} undangan berhasil dikirim`, 'success');

    setTimeout(() => {
      setInvited(false);
      setShowInvite(false);
      setInviteEmails('');
    }, 1500);
  }, [inviteEmails, inviteRole, showToast]);

  const handleRoleChange = useCallback((member, newRole) => {
    setStaff(prev => prev.map(m =>
      m.id === member.id ? { ...m, role: newRole } : m
    ));
    showToast(`Role ${member.name} diubah menjadi ${ROLE_OPTIONS.find(r => r.value === newRole)?.label}`, 'success');
  }, [showToast]);

  const handleDeactivate = useCallback((member) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    setStaff(prev => prev.map(m =>
      m.id === member.id ? { ...m, status: newStatus } : m
    ));
    showToast(`Akun ${member.name} ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}`, 'success');
  }, [showToast]);

  const handleRemove = useCallback((member) => {
    if (window.confirm(`Hapus ${member.name} dari tim?`)) {
      setStaff(prev => prev.filter(m => m.id !== member.id));
      showToast(`${member.name} dihapus dari tim`, 'success');
    }
  }, [showToast]);

  const handleResendInvite = useCallback((member) => {
    showToast(`Undangan dikirim ulang ke ${member.email}`, 'success');
  }, [showToast]);

  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staff, searchQuery, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: staff.length,
    active: staff.filter(s => s.status === 'active').length,
    pending: staff.filter(s => s.status === 'pending').length,
    inactive: staff.filter(s => s.status === 'inactive').length
  }), [staff]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--color-primary-400)', borderTopColor: 'transparent' }} />
          <p className="text-sm text-gray-500">Memuat data tim...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Toast Notification */}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg ${showSuccessMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}>
            {showSuccessMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{showSuccessMessage.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Tim & Akses
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola tim Anda dan atur siapa bisa mengakses apa
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          Undang Anggota
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Anggota', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Aktif', value: stats.active, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Menunggu', value: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Nonaktif', value: stats.inactive, icon: UserX, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari anggota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:bg-gray-700 text-sm"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:bg-gray-700 text-sm"
          >
            <option value="all">Semua Role</option>
            <option value="owner">Pemilik</option>
            <option value="admin">Admin</option>
            <option value="cashier">Kasir</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:bg-gray-700 text-sm"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="pending">Menunggu</option>
            <option value="inactive">Nonaktif</option>
          </select>

          <button
            onClick={() => setShowRoleGuide(!showRoleGuide)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Info className="w-4 h-4" />
            Panduan Role
            <ChevronRight className={`w-3 h-3 transition-transform ${showRoleGuide ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Role Guide (Collapsible) */}
      {showRoleGuide && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 animate-slide-down">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Hak Akses per Role</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { role: 'owner', perms: ['Semua akses', 'Kelola staff', 'Lihat laporan', 'Ubah pengaturan', 'Hapus data'] },
              { role: 'admin', perms: ['Kasir (POS)', 'Kelola inventaris', 'Lihat laporan', 'Kelola supplier', 'Lihat semua transaksi'] },
              { role: 'cashier', perms: ['Kasir (POS)', 'Lihat produk', 'Riwayat transaksi sendiri', 'Buat transaksi'] },
            ].map(({ role, perms }) => (
              <div key={role} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <RoleBadge role={role} size="md" />
                <ul className="mt-2 space-y-1">
                  {perms.map(p => (
                    <li key={p} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: roleColors[role] }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Belum ada anggota tim
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Mulai dengan mengundang anggota pertama Anda
            </p>
            <button
              onClick={() => setShowInvite(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Undang Anggota
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Anggota
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aktivitas Terakhir
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                          style={{ background: getRandomColor(member.email) }}
                        >
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <StatusBadge status={member.status} />
                        {member.status === 'pending' && (
                          <p className="text-[10px] text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            Menunggu konfirmasi email
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatLastActive(member.last_active)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionMenu
                        member={member}
                        onRoleChange={handleRoleChange}
                        onDeactivate={handleDeactivate}
                        onRemove={handleRemove}
                        onResendInvite={handleResendInvite}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => !invited && setShowInvite(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl animate-scale-in border border-gray-200 dark:border-gray-700">
            {invited ? (
              <div className="text-center py-8 px-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100 dark:bg-green-900/20">
                  <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Undangan Terkirim!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Email undangan telah dikirim ke anggota baru
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Undang Anggota Baru
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Pisahkan dengan koma untuk mengundang banyak orang
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInvite(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Email
                    </label>
                    <textarea
                      value={inviteEmails}
                      onChange={(e) => setInviteEmails(e.target.value)}
                      placeholder="nama@email.com, nama2@email.com"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:bg-gray-700 text-sm resize-none"
                      rows="3"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      Masukkan satu atau lebih email, pisahkan dengan koma
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:bg-gray-700 text-sm"
                    >
                      {ROLE_OPTIONS.filter(opt => opt.value !== 'owner').map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} - {opt.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowInvite(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleInvite}
                    disabled={!inviteEmails.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Kirim Undangan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}