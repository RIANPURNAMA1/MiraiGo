import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/stores/AuthContext';

export function Header({ title, onMenuToggle }: { title: string; onMenuToggle?: () => void }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {(title === 'Latihan Soal' || title === 'Dashboard' || title === 'Akses Modul' || title === 'Reservasi' || title === 'Latihan Kotoba' || title === 'Riwayat Tes' || title === 'Langganan' || title === 'Pembayaran' || title === 'Pengaturan') ? (
          <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#025dd2] to-[#15a0f5] px-4 py-2 text-sm font-medium text-white transition-colors hover:from-[#0150b8] hover:to-[#0f96e0]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 8v5m-2.5-2.5h5M12 7a3 3 0 11-6 0 3 3 0 016 0zM4 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Ajak teman &amp; raih point
          </button>
        ) : (
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-50" aria-label="Notifikasi">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {user?.name?.charAt(0) ?? '?'}
            </div>
            <span className="hidden text-sm font-medium text-gray-700 sm:block">{user?.name}</span>
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-48 rounded-md border border-gray-100 bg-white p-1.5 shadow-lg">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/profile');
                }}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Profil Saya
              </button>
              <button
                onClick={async () => {
                  setOpen(false);
                  await logout();
                  navigate('/login');
                }}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
