import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-md border border-gray-100 bg-white p-5 shadow-soft ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
