import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { fetchAdminPayments, approvePayment, rejectPayment, approveModulePremiumPayment, rejectModulePremiumPayment } from '@/services/admin';
import { ROOT_URL } from '@/services/api';
import type { AdminPaymentItem } from '@/services/admin';
import { getErrorMessage } from '@/services/api';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<AdminPaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentItem | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);

  function load() {
    setIsLoading(true);
    fetchAdminPayments()
      .then((data) => setPayments(data.payments))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, []);

  function handleApprove(p: AdminPaymentItem) {
    setSelectedPayment(p);
    setAdminNotes('');
    setShowApproveModal(true);
  }

  function handleReject(p: AdminPaymentItem) {
    setSelectedPayment(p);
    setAdminNotes('');
    setShowRejectModal(true);
  }

  async function confirmApprove() {
    if (!selectedPayment) return;
    const isModule = selectedPayment.type === 'module-premium';
    setIsProcessing(true);
    setError(null);
    try {
      if (isModule) {
        await approveModulePremiumPayment(selectedPayment.id, adminNotes.trim() || undefined);
      } else {
        await approvePayment(selectedPayment.id, adminNotes.trim() || undefined);
      }
      setSuccess(isModule
        ? 'Pembayaran disetujui. Akses modul premium telah diberikan.'
        : 'Pembayaran disetujui. Akses paket telah diberikan.');
      setShowApproveModal(false);
      load();
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menyetujui pembayaran.'));
    } finally {
      setIsProcessing(false);
    }
  }

  async function confirmReject() {
    if (!selectedPayment || !adminNotes.trim()) {
      setError('Catatan wajib diisi untuk penolakan.');
      return;
    }
    const isModule = selectedPayment.type === 'module-premium';
    setIsProcessing(true);
    setError(null);
    try {
      if (isModule) {
        await rejectModulePremiumPayment(selectedPayment.id, adminNotes.trim());
      } else {
        await rejectPayment(selectedPayment.id, adminNotes.trim());
      }
      setSuccess('Pembayaran ditolak.');
      setShowRejectModal(false);
      load();
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menolak pembayaran.'));
    } finally {
      setIsProcessing(false);
    }
  }

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const processedPayments = payments.filter((p) => p.status !== 'pending');

  if (isLoading) return <LoadingState label="Memuat pembayaran..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Pembayaran</h2>
        <p className="text-sm text-gray-500">Verifikasi bukti pembayaran manual dari pengguna.</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Pending Payments */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Menunggu Verifikasi ({pendingPayments.length})
        </h3>
        {pendingPayments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">Tidak ada pembayaran yang menunggu verifikasi.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingPayments.map((p) => (
              <div key={p.id} className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  {/* Proof thumbnail */}
                  {p.proof_image && (
                    <button
                      onClick={() => { setSelectedPayment(p); setShowProofModal(true); }}
                      className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200"
                    >
                      <img
                        src={p.proof_image.startsWith('http') ? p.proof_image : `${ROOT_URL}${p.proof_image}`}
                        alt="Bukti"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                        <svg className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{p.transaction.user?.name ?? 'Unknown'}</p>
                      <Badge variant="warning">Menunggu</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{p.transaction.user?.email}</p>
                    <p className="mt-2 text-sm text-gray-600">
                      {p.transaction.items.map((i) => i.name).join(', ')}
                    </p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(p.transaction.total_amount)}</p>
                    <p className="mt-1 text-xs text-gray-400">INV: {p.transaction.invoice_number} · {formatDate(p.created_at)}</p>
                    {p.notes && <p className="mt-1 text-xs text-gray-500">Catatan: {p.notes}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="danger" className="!bg-red-500 !text-white" onClick={() => handleReject(p)}>
                      Tolak
                    </Button>
                    <Button onClick={() => handleApprove(p)}>
                      Setujui
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Payments */}
      {processedPayments.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Riwayat</h3>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">User</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Paket</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Jumlah</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {processedPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.transaction.user?.name ?? '-'}</p>
                      <p className="text-xs text-gray-500">{p.transaction.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.transaction.items.map((i) => i.name).join(', ')}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(p.transaction.total_amount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status === 'paid' ? 'success' : p.status === 'failed' ? 'error' : 'warning'}>
                        {p.status === 'paid' ? 'Disetujui' : p.status === 'failed' ? 'Ditolak' : p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(p.reviewed_at ?? p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Setujui Pembayaran"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>Batal</Button>
            <Button onClick={confirmApprove} isLoading={isProcessing}>Ya, Setujui</Button>
          </>
        }
      >
        {selectedPayment && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Menyetujui pembayaran <strong>{selectedPayment.transaction.user?.name}</strong> untuk paket{' '}
              <strong>{selectedPayment.transaction.items.map((i) => i.name).join(', ')}</strong> sebesar{' '}
              <strong>{formatCurrency(selectedPayment.transaction.total_amount)}</strong>.
            </p>
            <p className="text-sm text-gray-600">
              {selectedPayment.type === 'module-premium'
                ? 'Akses Modul Premium akan aktif untuk selamanya.'
                : 'Akses paket akan aktif selama 30 hari.'}
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Catatan admin <span className="text-gray-400">(opsional)</span></label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Contoh: Pembayaran terverifikasi"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Tolak Pembayaran"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>Batal</Button>
            <Button variant="danger" onClick={confirmReject} isLoading={isProcessing}>Ya, Tolak</Button>
          </>
        }
      >
        {selectedPayment && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Menolak pembayaran <strong>{selectedPayment.transaction.user?.name}</strong>.
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Alasan penolakan *</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                required
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Contoh: Bukti transfer tidak valid"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Proof Image Modal */}
      <Modal
        isOpen={showProofModal}
        onClose={() => setShowProofModal(false)}
        title="Bukti Pembayaran"
      >
        {selectedPayment?.proof_image && (
          <img
            src={selectedPayment.proof_image.startsWith('http') ? selectedPayment.proof_image : `${ROOT_URL}${selectedPayment.proof_image}`}
            alt="Bukti pembayaran"
            className="w-full rounded-xl border border-gray-100"
          />
        )}
      </Modal>
    </div>
  );
}
