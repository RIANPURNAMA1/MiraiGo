import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

const backgroundPaths = [
  '/dashboard',
  '/latihan-soal',
  '/latihan-kotoba',
  '/akses-modul',
  '/history',
  '/subscription',
  '/payments',
  '/profile',
];

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/practice': 'Tes',
  '/latihan-soal': 'Latihan Soal',
  '/latihan-kotoba': 'Latihan Kotoba',
  '/reservasi': 'Reservasi',
  '/akses-modul': 'Akses Modul',
  '/progress': 'Progress',
  '/modules': 'Learning Modules',
  '/history': 'Riwayat Tes',
  '/subscription': 'Langganan',
  '/payments': 'Pembayaran',
  '/profile': 'Pengaturan',
};

function resolveTitle(pathname: string): string {
  const match = Object.keys(titles).find((key) => pathname.startsWith(key));
  return match ? titles[match] : 'MiraiGo';
}

export function StudentLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const showBackground = backgroundPaths.some((p) => location.pathname.startsWith(p));

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="relative isolate flex min-w-0 flex-1 flex-col">
        {showBackground && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 top-16 -z-10 bg-cover bg-center bg-no-repeat opacity-25"
            style={{
              backgroundImage:
                'url("https://i.pinimg.com/736x/d3/06/90/d3069074a097a03eefd743add101a7d1.jpg")',
            }}
          />
        )}
        <Header title={resolveTitle(location.pathname)} onMenuToggle={() => setMobileOpen((o) => !o)} />
        <main className="flex-1 overflow-y-auto px-4 pb-20 pt-5 md:p-6 md:pb-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
