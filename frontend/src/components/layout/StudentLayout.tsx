import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={resolveTitle(location.pathname)} onMenuToggle={() => setMobileOpen((o) => !o)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
