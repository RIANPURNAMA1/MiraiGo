import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-700 text-white',
  success: 'bg-emerald-700 text-white',
  warning: 'bg-amber-700 text-white',
  error: 'bg-red-700 text-white',
  info: 'bg-blue-700 text-white',
  brand: 'bg-brand-700 text-white',
};

export function Badge({
  children,
  variant = 'default',
  className = '',
}: { children: ReactNode; variant?: BadgeVariant; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
