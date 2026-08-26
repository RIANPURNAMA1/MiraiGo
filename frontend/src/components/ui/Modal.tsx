import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-gray-900/50 " onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <div
          className={`relative flex max-h-[100dvh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:max-h-[85dvh] sm:rounded-2xl ${sizeClass[size]}`}
        >
          {title && (
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 sm:hidden"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-gray-600 sm:px-6 sm:py-5">
            {children}
          </div>
          {footer && (
            <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 px-5 py-3 sm:px-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
