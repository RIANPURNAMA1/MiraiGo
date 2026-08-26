import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, className = '', children, ...props }, ref) => {
  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>}
      <select
        ref={ref}
        className={`w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
});
Select.displayName = 'Select';
