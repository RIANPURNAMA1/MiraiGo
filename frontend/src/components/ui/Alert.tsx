import type { ReactNode } from 'react';

type AlertVariant = 'success' | 'warning' | 'error' | 'info';

const styles: Record<AlertVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  error: 'bg-red-50 text-red-700 border-red-100',
  info: 'bg-blue-50 text-blue-700 border-blue-100',
};

export function Alert({ variant = 'info', children }: { variant?: AlertVariant; children: ReactNode }) {
  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles[variant]}`}>{children}</div>;
}
