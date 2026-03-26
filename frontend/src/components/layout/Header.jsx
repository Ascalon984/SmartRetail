import { useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import {
  Menu, X, Sun, Moon, Bell,
  LayoutDashboard, ShoppingCart, Package, Truck, BarChart3, LogOut, Receipt, Settings, UsersRound,
} from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import useAuthStore from '../../store/useAuthStore';

const mobileNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pos', icon: ShoppingCart, label: 'Kasir (POS)' },
  { to: '/transactions', icon: Receipt, label: 'Riwayat Transaksi' },
  { to: '/inventory', icon: Package, label: 'Inventaris' },
  { to: '/suppliers', icon: Truck, label: 'Supplier' },
  { to: '/reports', icon: BarChart3, label: 'Laporan' },
  { to: '/settings', icon: Settings, label: 'Pengaturan' },
  { to: '/staff', icon: UsersRound, label: 'Tim & Akses' },
];

const titleMap = {
  '/dashboard': 'Dashboard',
  '/': 'Dashboard',
  '/pos': 'Kasir (POS)',
  '/transactions': 'Riwayat Transaksi',
  '/inventory': 'Inventaris',
  '/suppliers': 'Supplier',
  '/reports': 'Laporan',
  '/settings': 'Pengaturan',
  '/staff': 'Tim & Akses',
};

export default function Header() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pageTitle = titleMap[location.pathname] || 'Dashboard';

  return (
    <>
      <header
        className="h-16 flex items-center justify-between px-4 md:px-6 border-b sticky top-0 z-20"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-1.5 rounded-lg btn-ghost" id="mobile-menu-open">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-[15px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{pageTitle}</h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={toggleTheme}
            className="p-2 rounded-lg transition-all duration-150 hover:scale-105"
            style={{ background: 'var(--color-surface-200)', color: 'var(--color-text-secondary)' }}
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            id="theme-toggle">
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button className="p-2 rounded-lg relative transition-all duration-150"
            style={{ background: 'var(--color-surface-200)', color: 'var(--color-text-secondary)' }}
            id="notifications-bell">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-danger)' }} />
          </button>

          {user && (
            <div className="hidden sm:flex items-center gap-2 ml-1.5 pl-2.5 border-l" style={{ borderColor: 'var(--color-border)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {user.name.charAt(0)}
              </div>
              <span className="text-[13px] font-semibold hidden md:block" style={{ color: 'var(--color-text-primary)' }}>
                {user.name.split(' ')[0]}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 p-4 animate-slide-in-left" style={{ background: 'var(--color-sidebar-bg)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-[14px] font-extrabold" style={{ color: 'var(--color-text-primary)' }}>SmartRetail</h1>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg" style={{ color: 'var(--color-text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-0.5">
              {mobileNavItems.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all"
                  style={{
                    background: location.pathname === to ? 'var(--color-primary-50)' : 'transparent',
                    color: location.pathname === to ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                  }}>
                  <Icon className="w-[18px] h-[18px]" /><span>{label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="absolute bottom-6 left-4 right-4">
              <button onClick={logout} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium"
                style={{ color: 'var(--color-danger)' }}>
                <LogOut className="w-[18px] h-[18px]" /><span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
