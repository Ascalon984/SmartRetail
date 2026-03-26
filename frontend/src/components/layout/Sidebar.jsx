import { NavLink, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, Truck, BarChart3,
  ChevronLeft, ChevronRight, LogOut, Receipt, Settings, UsersRound
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useAppStore from '../../store/useAppStore';

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/pos', icon: ShoppingCart, label: 'Kasir (POS)' },
    ],
  },
  {
    label: 'Transaksi',
    items: [
      { to: '/transactions', icon: Receipt, label: 'Riwayat Transaksi' },
    ],
  },
  {
    label: 'Data',
    items: [
      { to: '/inventory', icon: Package, label: 'Inventaris' },
      { to: '/suppliers', icon: Truck, label: 'Supplier' },
    ],
  },
  {
    label: 'Analitik',
    items: [
      { to: '/reports', icon: BarChart3, label: 'Laporan' },
    ],
  },
  {
    label: 'Pengaturan',
    items: [
      { to: '/settings', icon: Settings, label: 'Pengaturan' },
      { to: '/staff', icon: UsersRound, label: 'Tim & Akses' },
    ],
  },
];

// ===== IMPROVED TOOLTIP COMPONENT WITH HIGHER Z-INDEX =====
const Tooltip = ({ children, text, show }) => {
  const [visible, setVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0 });
  const timeoutRef = useRef(null);
  const triggerRef = useRef(null);

  const handleEnter = () => {
    if (!show) return;

    // Get position of the trigger element
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + rect.height / 2
      });
    }

    timeoutRef.current = setTimeout(() => setVisible(true), 200);
  };

  const handleLeave = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!show) return children;

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="relative w-full"
    >
      {children}
      {visible && (
        <div
          className="fixed animate-tooltip-fade"
          style={{
            left: 'calc(72px + 8px)',
            top: `${tooltipPosition.top}px`,
            transform: 'translateY(-50%)',
            zIndex: 99999 // Very high z-index to ensure it's above everything
          }}
        >
          <div className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-xl whitespace-nowrap border border-gray-700">
            {text}
            {/* Arrow pointer */}
            <div
              className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2"
              style={{ zIndex: 99999 }}
            >
              <div className="w-2 h-2 bg-gray-900 rotate-45 border-l border-t border-gray-700" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== NAV ITEM WITH REF FOR TOOLTIP =====
const NavItem = ({ to, icon: Icon, label, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Tooltip text={label} show={collapsed}>
      <NavLink
        to={to}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
          transition-all duration-200 group relative
          ${collapsed ? 'justify-center' : ''}
        `}
        style={{
          background: isActive ? 'var(--color-primary-50)' : 'transparent',
          color: isActive ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
        }}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-r animate-slide-in" />
        )}

        <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />

        {!collapsed && <span className="animate-fade-in">{label}</span>}
      </NavLink>
    </Tooltip>
  );
};

export default function Sidebar() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleCollapse = useAppStore((s) => s.toggleSidebarCollapse);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside
      className={`
        hidden md:flex flex-col h-screen sticky top-0
        transition-all duration-300 ease-out
        border-r shadow-sm
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
      style={{
        background: 'var(--color-sidebar-bg)',
        borderColor: 'var(--color-border)',
        zIndex: 50
      }}
    >
      {/* ===== HEADER (ALIGN FIX) ===== */}
      <div
        className={`flex items-center h-16 border-b flex-shrink-0 transition-all duration-200 ${collapsed ? 'justify-center px-2' : 'px-5'
          }`}
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className={`
          relative group
          ${collapsed ? 'w-10 h-10' : 'w-9 h-9'}
        `}>
          <div className={`
            absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600
            transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg
            ${collapsed ? 'rounded-xl' : 'rounded-lg'}
          `} />
          <div className="relative w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
        </div>

        {!collapsed && (
          <div className="ml-3 animate-fade-in">
            <h1 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              SmartRetail
            </h1>
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              POS System
            </p>
          </div>
        )}
      </div>

      {/* ===== NAVIGATION ===== */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
        {navSections.map((section, sectionIdx) => (
          <div key={section.label} className="mb-6">
            {!collapsed ? (
              <div className="px-2 mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  {section.label}
                </p>
                {sectionIdx > 0 && (
                  <div className="h-px mt-2" style={{ background: 'var(--color-border)' }} />
                )}
              </div>
            ) : (
              <div className="h-px mx-2 mb-3" style={{ background: 'var(--color-border)' }} />
            )}

            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItem key={item.to} {...item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ===== FOOTER CLEAN ===== */}
      <div className="border-t px-3 py-3 space-y-2" style={{ borderColor: 'var(--color-border)' }}>
        {/* Logout */}
        <Tooltip text="Keluar" show={collapsed}>
          <button
            onClick={logout}
            className={`
              flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 group logout-button
              ${collapsed ? 'justify-center' : ''}
            `}
            style={{ color: 'var(--color-danger)' }}
            aria-label="Keluar dari aplikasi"
          >
            <LogOut className={`w-5 h-5 transition-transform duration-200 ${collapsed ? '' : 'group-hover:-translate-x-0.5'}`} />
            {!collapsed && <span>Keluar</span>}
          </button>
        </Tooltip>

        {/* Collapse */}
        <button
          onClick={toggleCollapse}
          className={`
            flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium
            transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800
            ${collapsed ? 'justify-center' : ''}
          `}
          style={{ color: 'var(--color-text-muted)' }}
          aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 transition-transform duration-200 hover:translate-x-0.5" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 transition-transform duration-200 hover:-translate-x-0.5" />
              <span className="animate-fade-in">Ciutkan menu</span>
            </>
          )}
        </button>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        /* Tooltip Animation */
        @keyframes tooltip-fade {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }
        
        .animate-tooltip-fade {
          animation: tooltip-fade 0.15s ease-out forwards;
        }
        
        /* Slide In Animation for Active Indicator */
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.2s ease-out forwards;
        }
        
        /* Fade In Animation */
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        
        /* Logout Button Hover Effect */
        .logout-button {
          position: relative;
          overflow: hidden;
        }
        
        .logout-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(239, 68, 68, 0.08);
          opacity: 0;
          transition: opacity 0.2s ease;
          border-radius: inherit;
        }
        
        .logout-button:hover::before {
          opacity: 1;
        }
        
        /* Custom Scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: var(--color-border);
          border-radius: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: var(--color-text-muted);
        }
      `}</style>
    </aside>
  );
}