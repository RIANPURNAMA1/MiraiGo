import type { ReactNode } from 'react';

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'md' | 'lg';
}

const widthClass = { md: 'max-w-md', lg: 'max-w-2xl' };

export function SlidePanel({ isOpen, onClose, title, children, footer, width = 'lg' }: SlidePanelProps) {
  if (!isOpen) return null;

  return (
    <div className="relative z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Backdrop — always covers full viewport */}
      <div
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        className="bg-gray-900/50"
        onClick={onClose}
      />

      {/* Panel slides from right */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0 }} className={`flex w-full justify-end`}>
        <div
          className={`flex h-full flex-col bg-white shadow-2xl ${widthClass[width]}`}
          style={{ animation: 'slideInRight 0.3s ease-out' }}
        >
          {/* Header */}
          {title && (
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 text-sm text-gray-600 sm:px-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 px-5 py-3 sm:px-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
