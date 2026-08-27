import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { fetchPayments } from '@/services/payments';
import { ROOT_URL } from '@/services/api';
import type { PaymentsData } from '@/types';

const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'error',
  cancelled: 'default',
  expired: 'default',
};

const statusLabel: Record<string, string> = {
  paid: 'Dibayar',
  pending: 'Menunggu',
  failed: 'Ditolak',
  cancelled: 'Dibatalkan',
  expired: 'Kadaluarsa',
};

function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}

function ProofThumb({ src, onClick }: { src: string; onClick: () => void }) {
  const url = src.startsWith('http') ? src : `${ROOT_URL}${src}`;
  return (
    <button
      onClick={onClick}
      className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200"
    >
      <img src={url} alt="Bukti" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
        <svg className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
}

export default function Payments() {
  const [data, setData] = useState<PaymentsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments()
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState label="Memuat pembayaran..." />;
  if (!data) return <EmptyState title="Gagal memuat data" description="Silakan muat ulang halaman." />;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Pembayaran</h2>
        <p className="text-sm text-gray-500">Riwayat transaksi dan invoice Anda.</p>
      </div>

      {data.transactions.length === 0 ? (
        <EmptyState title="Belum ada transaksi" description="Invoice pembelian paket akan muncul di sini." />
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-gray-100">
            {data.transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  {t.proof_image && (
                    <ProofThumb src={t.proof_image} onClick={() => setPreviewSrc(t.proof_image)} />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.invoice_number}</p>
                    <p className="text-xs text-gray-500">
                      {t.items.map((i) => i.name).join(', ')} •{' '}
                      {new Date(t.created_at ?? '').toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">{rupiah(t.total_amount)}</span>
                  <Badge variant={statusVariant[t.status] ?? 'default'}>{statusLabel[t.status] ?? t.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal isOpen={!!previewSrc} onClose={() => setPreviewSrc(null)} title="Bukti Pembayaran">
        {previewSrc && (
          <img
            src={previewSrc.startsWith('http') ? previewSrc : `${ROOT_URL}${previewSrc}`}
            alt="Bukti pembayaran"
            className="w-full rounded-xl border border-gray-100"
          />
        )}
      </Modal>
    </div>
  );
}
