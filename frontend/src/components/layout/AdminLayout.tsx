import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/stores/AuthContext';

interface NavItemData { to: string; label: string; icon: string; }
interface NavGroupData { label: string; items: NavItemData[]; }

const groups: NavGroupData[] = [
  {
    label: 'Konten',
    items: [
      { to: '/admin/categories', label: 'Kategori Soal', icon: 'tag' },
      { to: '/admin/module-categories', label: 'Kategori Modul', icon: 'tag' },
      { to: '/admin/packages', label: 'Paket', icon: 'package' },
      { to: '/admin/modules', label: 'Modul', icon: 'book' },
      { to: '/admin/questions', label: 'Soal', icon: 'list' },
    ],
  },
  {
    label: 'Pengguna',
    items: [
      { to: '/admin/users', label: 'Pengguna', icon: 'users' },
      { to: '/admin/subscribers', label: 'Langganan', icon: 'star' },
    ],
  },
  {
    label: 'Keuangan',
    items: [
      { to: '/admin/payments', label: 'Pembayaran', icon: 'credit' },
      { to: '/admin/vouchers', label: 'Voucher', icon: 'ticket' },
    ],
  },
];

const bottomNav: NavItemData[] = [
  { to: '/admin/settings', label: 'Pengaturan', icon: 'gear' },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, string> = {
    grid: 'M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z',
    package:
      'M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16V8zM3.3 7L12 12l8.7-5M12 22V12',
    tag: 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01',
    list: 'M4 6h16M4 12h16M4 18h10',
    users:
      'M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM21 21v-2a4 4 0 00-3-3.87M15 3.13a4 4 0 010 7.75',
    gear:
      'M10.3 4.3a1.7 1.7 0 013.4 0l.2 1a1.7 1.7 0 002.4 1.2l.9-.5a1.7 1.7 0 012.4 2.4l-.5.9a1.7 1.7 0 001.2 2.4l1 .2a1.7 1.7 0 010 3.4l-1 .2a1.7 1.7 0 00-1.2 2.4l.5.9a1.7 1.7 0 01-2.4 2.4l-.9-.5a1.7 1.7 0 00-2.4 1.2l-.2 1a1.7 1.7 0 01-3.4 0l-.2-1a1.7 1.7 0 00-2.4-1.2l-.9.5a1.7 1.7 0 01-2.4-2.4l.5-.9a1.7 1.7 0 00-1.2-2.4l-1-.2a1.7 1.7 0 010-3.4l1-.2a1.7 1.7 0 001.2-2.4l-.5-.9A1.7 1.7 0 017.2 6l.9.5a1.7 1.7 0 002.4-1.2l.2-1zM12 9.7a2.3 2.3 0 100 4.6 2.3 2.3 0 000-4.6z',
    star: 'M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9-5.5 2.9 1-6.1L3 9.5l6.3-.9L12 3z',
    credit: 'M1 10a2 2 0 012-2h18a2 2 0 012 2v4a2 2 0 01-2 2H3a2 2 0 01-2-2v-4zM1 10h20M6 15h.01M10 15h.01',
    ticket: 'M2 9a3 3 0 013-3h14a3 3 0 013 3 3 3 0 010 6 3 3 0 01-3 3H5a3 3 0 01-3-3 3 3 0 010-6zM9 3v18',
    book: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 004 22h16a1 1 0 001-1V4a1 1 0 00-1-1H6.5A2.5 2.5 0 004 5.5v14',
    logout: 'M15 12H4m0 0l3-3m-3 3l3 3m4-10h6a2 2 0 012 2v10a2 2 0 01-2 2h-6',
    chevron: 'M9 5l7 7-7 7',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={paths[name]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavItem({ item, collapsed, className = '' }: { item: NavItemData; collapsed: boolean; className?: string }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/admin'}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `flex items-center rounded-md py-2 text-sm font-medium transition-colors ${
          collapsed ? 'justify-center px-2' : 'gap-2.5 px-3'
        } ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} ${className}`
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
}: {
  group: NavGroupData;
  collapsed: boolean;
  defaultOpen?: boolean;
}) {
  const location = useLocation();
  const isActive = group.items.some((item) =>
    item.to === '/admin' ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );
  const [open, setOpen] = useState(defaultOpen || isActive);

  if (collapsed) {
    return (
      <div className="space-y-0.5">
        {group.items.map((item) => (
          <NavItem key={item.to} item={item} collapsed />
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
            <NavItem key={item.to} item={item} collapsed={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`hidden shrink-0 border-r border-gray-200 bg-white transition-all md:flex md:flex-col ${
          collapsed ? 'md:w-[72px]' : 'md:w-64'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center px-2 h-20">
          <img
            src={collapsed ? '/logo2.png' : '/logo.png'}
            alt="Admin"
            className={`object-contain ${collapsed ? 'h-10 w-10 rounded-md' : 'h-28 w-28 rounded-md'}`}
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          <div className={`space-y-5 ${collapsed ? 'flex flex-col items-center px-2' : 'px-3'}`}>
            <div className="space-y-0.5">
              <NavItem item={{ to: '/admin', label: 'Dashboard', icon: 'grid' }} collapsed={collapsed} />
            </div>

            {groups.map((group) => (
              <NavGroup key={group.label} group={group} collapsed={collapsed} defaultOpen />
            ))}

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Bottom items */}
            <div className="space-y-0.5">
              {!collapsed && (
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Akun
                </p>
              )}
              {bottomNav.map((item) => (
                <NavItem key={item.to} item={item} collapsed={collapsed} />
              ))}
            </div>

            {/* Logout */}
            <div className="pt-1">
              <button
                onClick={async () => { await logout(); navigate('/login'); }}
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

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Perbesar sidebar' : 'Perkecil sidebar'}
          className={`m-3 flex items-center justify-center rounded-lg border border-gray-100 py-2 text-xs text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 ${
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b border-gray-100 bg-white px-4 md:px-6">
          <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">Super Admin</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
