import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/stores/AuthContext';
import { Crown } from 'lucide-react';

interface NavItemData { to: string; label: string; icon: string; }
interface NavGroupData { label: string; items: NavItemData[]; }

const groups: NavGroupData[] = [
  {
    label: 'Latihan',
    items: [
      { to: '/latihan-soal', label: 'Latihan Soal', icon: 'list' },
      { to: '/latihan-kotoba', label: 'Latihan Kotoba', icon: 'kotoba' },
    ],
  },
  {
    label: 'Layanan',
    items: [
      { to: '/reservasi', label: 'Reservasi', icon: 'calendar' },
      { to: '/akses-modul', label: 'Akses Modul', icon: 'folder' },
    ],
  },
  {
    label: 'Akun Saya',
    items: [
      { to: '/history', label: 'Riwayat Tes', icon: 'clock' },
      { to: '/subscription', label: 'Langganan', icon: 'star' },
      { to: '/upgrade-akses', label: 'Upgrade Akses', icon: 'crown' },
      { to: '/payments', label: 'Pembayaran', icon: 'card' },
    ],
  },
];

const bottomNav: NavItemData[] = [
  { to: '/profile', label: 'Pengaturan', icon: 'gear' },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  if (name === 'crown') return <Crown size={size} />;
  const paths: Record<string, string> = {
    grid: 'M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z',
    book: 'M4 6a2 2 0 012-2h9a2 2 0 012 2v13l-6-3-6 3V6z',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    star: 'M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9-5.5 2.9 1-6.1L3 9.5l6.3-.9L12 3z',
    card: 'M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7zm0 3h20M6 15h4',
    list: 'M4 6h16M4 12h16M4 18h10',
    calendar: 'M8 2v4M16 2v4M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
    folder: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
    kotoba: 'M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-6l-4 4v-4H6a2 2 0 01-2-2V6zm5 4h6M9 12h4',
    gear:
      'M10.3 4.3a1.7 1.7 0 013.4 0l.2 1a1.7 1.7 0 002.4 1.2l.9-.5a1.7 1.7 0 012.4 2.4l-.5.9a1.7 1.7 0 001.2 2.4l1 .2a1.7 1.7 0 010 3.4l-1 .2a1.7 1.7 0 00-1.2 2.4l.5.9a1.7 1.7 0 01-2.4 2.4l-.9-.5a1.7 1.7 0 00-2.4 1.2l-.2 1a1.7 1.7 0 01-3.4 0l-.2-1a1.7 1.7 0 00-2.4-1.2l-.9.5a1.7 1.7 0 01-2.4-2.4l.5-.9a1.7 1.7 0 00-1.2-2.4l-1-.2a1.7 1.7 0 010-3.4l1-.2a1.7 1.7 0 001.2-2.4l-.5-.9A1.7 1.7 0 017.2 6l.9.5a1.7 1.7 0 002.4-1.2l.2-1zM12 9.7a2.3 2.3 0 100 4.6 2.3 2.3 0 000-4.6z',
    logout: 'M15 12H4m0 0l3-3m-3 3l3 3m4-10h6a2 2 0 012 2v10a2 2 0 01-2 2h-6',
    chevron: 'M9 5l7 7-7 7',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={paths[name]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavItem({ item, collapsed, onClick }: { item: NavItemData; collapsed: boolean; onClick?: () => void }) {
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center rounded-md py-2 text-sm font-medium transition-colors ${
          collapsed ? 'justify-center px-2' : 'gap-2.5 px-3'
        } ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
      }
    >
      <Icon name={item.icon} />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

function NavGroup({
  group,
  collapsed,
  defaultOpen = false,
  onNavClick,
}: {
  group: NavGroupData;
  collapsed: boolean;
  defaultOpen?: boolean;
  onNavClick?: () => void;
}) {
  const location = useLocation();
  const isActive = group.items.some((item) => location.pathname.startsWith(item.to));
  const [open, setOpen] = useState(defaultOpen || isActive);

  if (collapsed) {
    return (
      <div className="space-y-0.5">
        {group.items.map((item) => (
          <NavItem key={item.to} item={item} collapsed onClick={onNavClick} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
          isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <span className="flex-1 text-left">{group.label}</span>
        <span className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>
          <Icon name="chevron" size={14} />
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="ml-2 space-y-0.5 border-l border-gray-100 pl-2">
          {group.items.map((item) => (
            <NavItem key={item.to} item={item} collapsed={false} onClick={onNavClick} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: { collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onMobileClose: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`shrink-0 border-r border-gray-200 bg-white transition-all ${
          mobileOpen
            ? 'fixed inset-y-0 left-0 z-50 w-64 md:static md:z-auto'
            : collapsed
              ? 'hidden md:flex md:w-[72px]'
              : 'hidden md:flex md:w-64'
        } md:flex-col`}
      >
      {/* Logo */}
      <div className="flex items-center justify-center px-2 h-20">
        <img
          src={collapsed ? '/logo2.png' : '/logo.png'}
          alt="MiraiGo"
          className={`rounded-md object-contain ${collapsed ? 'h-10 w-10' : 'h-32 w-32'}`}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
          <div className={`space-y-5 ${collapsed && !mobileOpen ? 'flex flex-col items-center px-2' : 'px-3'}`}>
            <div className="space-y-0.5">
              <NavItem item={{ to: '/dashboard', label: 'Dashboard', icon: 'grid' }} collapsed={collapsed && !mobileOpen} onClick={onMobileClose} />
            </div>

            {groups.map((group) => (
            <NavGroup key={group.label} group={group} collapsed={collapsed && !mobileOpen} defaultOpen onNavClick={onMobileClose} />
          ))}

          <div className="border-t border-gray-100" />

          <div className="space-y-0.5">
            {!collapsed && (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Akun
              </p>
            )}
            {bottomNav.map((item) => (
              <NavItem key={item.to} item={item} collapsed={collapsed && !mobileOpen} onClick={onMobileClose} />
            ))}
          </div>

          <div className="pt-1">
            <button
              onClick={async () => { await logout(); onMobileClose(); navigate('/login'); }}
              title={collapsed ? 'Logout' : undefined}
              className={`flex items-center rounded-md py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 ${
                collapsed ? 'w-10 justify-center' : 'w-full gap-2.5 px-3'
              }`}
            >
              <Icon name="logout" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={onToggle}
        title={collapsed ? 'Perbesar sidebar' : 'Perkecil sidebar'}
        className={`m-3 hidden items-center justify-center rounded-lg border border-gray-100 py-2 text-xs text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 md:flex ${
          collapsed ? 'mx-auto h-9 w-9' : 'px-3'
        }`}
      >
        {collapsed ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5L6 12l5 7M18 5l-5 7 5 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 5L6 12l7 7M18 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="ml-2">Collapse</span>
          </>
        )}
      </button>
    </aside>
    </>
  );
}
