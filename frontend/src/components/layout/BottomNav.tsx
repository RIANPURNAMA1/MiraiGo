import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, BookOpen, CalendarDays, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface BottomNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const items: BottomNavItem[] = [
  { to: '/dashboard', label: 'Beranda', icon: Home },
  { to: '/latihan-soal', label: 'Latihan', icon: ClipboardList },
  { to: '/latihan-kotoba', label: 'Kotoba', icon: BookOpen },
  { to: '/reservasi', label: 'Reservasi', icon: CalendarDays },
  { to: '/profile', label: 'Akun', icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="flex items-stretch justify-around">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                isActive ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}