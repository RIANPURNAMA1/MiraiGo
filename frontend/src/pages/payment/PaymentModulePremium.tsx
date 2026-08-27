import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import {
  fetchModulePremiumSettings,
  createModulePremiumPayment,
  fetchModulePremiumAccess,
  fetchModulePremiumPayments,
} from '@/services/modulePremium';
import type { ModulePremiumPaymentItem } from '@/services/modulePremium';
import { getErrorMessage } from '@/services/api';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function PaymentModulePremium() {
  const [price, setPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [payments, setPayments] = useState<ModulePremiumPaymentItem[]>([]);
  const [accessActive, setAccessActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([fetchModulePremiumSettings(), fetchModulePremiumAccess(), fetchModulePremiumPayments()])
      .then(([settings, access, pay]) => {
        setPrice(settings.premium_price ?? 0);
        setAccessActive(!!access.has_access);
        setPayments(pay.payments ?? []);
        if (access.has_access) {
          setStep('success');
        }
      })
      .catch(() => setError('Gagal memuat data pembayaran.'))
      .finally(() => setIsLoading(false));
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB.');
      return;
    }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!proofFile) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await createModulePremiumPayment({
        proof_image: proofFile,
        notes: notes.trim() || undefined,
      });
      setStep('success');
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal mengirim bukti pembayaran.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <LoadingState label="Memuat pembayaran..." />;

  if (step === 'success') {
    const latest = payments[0];
    const status = accessActive ? 'paid' : (latest?.status ?? 'pending');
    const isApproved = status === 'paid';
    const isRejected = status === 'failed';

    return (
      <div className="min-h-[70vh] px-4 py-16">
        <div className="mx-auto max-w-lg text-center">
          <div
            className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
              isApproved ? 'bg-green-100' : isRejected ? 'bg-red-100' : 'bg-emerald-100'
            }`}
          >
            {isApproved ? (
              <svg className="h-10 w-10 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : isRejected ? (
              <svg className="h-10 w-10 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="h-10 w-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isApproved ? 'Pembayaran Disetujui!' : isRejected ? 'Pembayaran Ditolak' : 'Pembayaran Berhasil Dikirim!'}
          </h1>
          <p className="mt-2 text-gray-500">
            {isApproved
              ? 'Selamat! Akses Modul Premium Anda telah aktif. Semua modul premium sudah terbuka.'
              : isRejected
                ? 'Pembayaran Anda ditolak. Silakan hubungi admin untuk detail lebih lanjut.'
                : 'Bukti pembayaran Anda sedang menunggu verifikasi dari admin.'}
          </p>
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Produk</span>
                <span className="font-medium text-gray-900">Akses Modul Premium</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-gray-900">{formatCurrency(price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isApproved ? 'bg-green-100 text-green-700' : isRejected ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {isApproved ? 'Disetujui' : isRejected ? 'Ditolak' : 'Menunggu Verifikasi'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Link to="/akses-modul" className="flex-1">
              <Button variant="outline" className="w-full">Kembali ke Modul</Button>
            </Link>
            <Link to="/akses-modul" className="flex-1">
              <Button className="w-full">Lihat Status</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-400">
          <Link to="/akses-modul" className="hover:text-gray-600">Akses Modul</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Pembayaran</span>
        </nav>

        {error && <div className="mb-6"><Alert variant="error">{error}</Alert></div>}

        <div className="grid gap-8 lg:grid-cols-5">
          {/* ── Left: Payment Form ── */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-soft">
              <h1 className="text-xl font-bold text-gray-900">Checkout Akses Modul Premium</h1>
              <p className="mt-1 text-sm text-gray-500">Selesaikan pembayaran untuk membuka semua modul premium.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                {/* Payment Method */}
                <div>
                  <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Metode Pembayaran</h2>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 rounded-xl border-2 border-brand-500 bg-brand-50 p-4 cursor-pointer">
                      <input type="radio" name="method" value="bca" defaultChecked className="h-4 w-4 text-brand-600 focus:ring-brand-500" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Transfer Bank BCA</p>
                        <p className="text-xs text-gray-500">a.n. PT RSP Sensei Indonesia</p>
                      </div>
                      <span className="font-mono text-sm font-bold text-gray-900">1234 5678 9012</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 cursor-pointer hover:border-gray-300">
                      <input type="radio" name="method" value="mandiri" className="h-4 w-4 text-brand-600 focus:ring-brand-500" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Transfer Bank Mandiri</p>
                        <p className="text-xs text-gray-500">a.n. PT RSP Sensei Indonesia</p>
                      </div>
                      <span className="font-mono text-sm font-bold text-gray-900">9876 5432 1098</span>
                    </label>
                  </div>
                </div>

                {/* Upload Proof */}
                <div>
                  <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Bukti Pembayaran</h2>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {proofPreview ? (
                    <div className="relative">
                      <img src={proofPreview} alt="Bukti" className="w-full max-h-56 rounded-xl border border-gray-200 object-contain" />
                      <button
                        type="button"
                        onClick={() => { setProofFile(null); setProofPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                      >
                        ✕
                      </button>
                      <p className="mt-2 text-xs text-gray-500">{proofFile?.name}</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 text-center transition-colors hover:border-brand-400 hover:bg-brand-50"
                    >
                      <svg className="mb-3 h-10 w-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 16V4m0 0L8 8m4-4l4 4M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-sm font-medium text-gray-600">Klik atau seret file ke sini</p>
                      <p className="mt-1 text-xs text-gray-400">JPG, PNG, maks 5MB</p>
                    </button>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Catatan <span className="text-gray-400 font-normal normal-case">(opsional)</span></h2>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Transfer dari BCA atas nama Rizal, tanggal 25 Agustus"
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isSubmitting}
                  disabled={!proofFile}
                >
                  Kirim Bukti Pembayaran
                </Button>
              </form>
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-soft">
                <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Ringkasan Pesanan</h2>

                <div className="flex gap-3 rounded-xl bg-gray-50 p-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-yellow-500 text-black">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M2 18h20v2H2v-2zm.6-11l4.1 3.2L12 6l5.3 4.2L21.4 7l-1.6 9H4.2L2.6 7z"/></svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">Akses Modul Premium</p>
                    <p className="text-xs text-gray-500">Buka semua modul pembelajaran premium</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Harga akses</span>
                    <span className="text-gray-900">{formatCurrency(price)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total Pembayaran</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(price)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps info */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-soft">
                <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Cara Pembayaran</h2>
                <ol className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">1</span>
                    <span>Pilih bank dan catat nomor rekening di atas.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">2</span>
                    <span>Transfer sesuai nominal ke rekening yang dipilih.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">3</span>
                    <span>Unggah bukti transfer pada form di sebelah kiri.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">4</span>
                    <span>Admin akan memverifikasi dalam 1×24 jam.</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
      <WhatsAppButton />
    </div>
  );
}
