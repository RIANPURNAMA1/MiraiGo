import { useEffect, useState, useRef, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { fetchPackage } from '@/services/packages';
import { createManualPayment, validateVoucher } from '@/services/manualPayment';
import { getErrorMessage } from '@/services/api';
import type { Package } from '@/types';
import type { VoucherData } from '@/services/manualPayment';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function Payment() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [finalTotal, setFinalTotal] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [voucher, setVoucher] = useState<VoucherData | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);

  useEffect(() => {
    if (!packageId) return;
    fetchPackage(Number(packageId))
      .then((p) => {
        setPkg(p);
        setFinalTotal(p.price);
        if (!p.is_premium) navigate('/latihan-soal', { replace: true });
      })
      .catch(() => setError('Paket tidak ditemukan.'))
      .finally(() => setIsLoading(false));
  }, [packageId, navigate]);

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

  async function handleApplyVoucher() {
    if (!voucherCode.trim() || !pkg) return;
    setVoucherError(null);
    setIsCheckingVoucher(true);
    try {
      const data = await validateVoucher(voucherCode.trim(), pkg.id);
      setVoucher(data);
      setFinalTotal(Math.max(0, pkg.price - data.discount));
    } catch (err) {
      setVoucherError(getErrorMessage(err, 'Voucher tidak valid.'));
      setVoucher(null);
      setFinalTotal(pkg.price);
    } finally {
      setIsCheckingVoucher(false);
    }
  }

  function handleRemoveVoucher() {
    setVoucher(null);
    setVoucherCode('');
    setVoucherError(null);
    if (pkg) setFinalTotal(pkg.price);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!pkg || !proofFile) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await createManualPayment({
        package_id: pkg.id,
        proof_image: proofFile,
        notes: notes.trim() || undefined,
        voucher_code: voucher?.code || undefined,
      });
      setInvoiceNumber(res.data.invoice_number);
      setFinalTotal(res.data.total_amount);
      setStep('success');
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal mengirim bukti pembayaran.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <LoadingState label="Memuat paket..." />;
  if (!pkg) return <Alert variant="error">Paket tidak ditemukan.</Alert>;

  if (step === 'success') {
    return (
      <div className="min-h-[70vh] px-4 py-16">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-10 w-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pembayaran Berhasil Dikirim!</h1>
          <p className="mt-2 text-gray-500">Bukti pembayaran Anda sedang menunggu verifikasi dari admin.</p>
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice</span>
                <span className="font-mono font-semibold text-gray-900">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Paket</span>
                <span className="font-medium text-gray-900">{pkg.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-gray-900">{formatCurrency(finalTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  Menunggu Verifikasi
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Link to="/latihan-soal" className="flex-1">
              <Button variant="outline" className="w-full">Kembali ke Latihan</Button>
            </Link>
            <Link to="/subscription" className="flex-1">
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
          <Link to="/latihan-soal" className="hover:text-gray-600">Latihan Soal</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Pembayaran</span>
        </nav>

        {error && <div className="mb-6"><Alert variant="error">{error}</Alert></div>}

        <div className="grid gap-8 lg:grid-cols-5">
          {/* ── Left: Payment Form ── */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-soft">
              <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
              <p className="mt-1 text-sm text-gray-500">Selesaikan pembayaran untuk membuka paket ini.</p>

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

                {/* Voucher */}
                <div>
                  <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Kode Voucher</h2>
                  {voucher ? (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                          <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-800">{voucher.code}</p>
                          <p className="text-xs text-emerald-600">
                            {voucher.type === 'percentage' ? `${voucher.value}% off` : formatCurrency(voucher.value) + ' off'}
                            {voucher.description && ` — ${voucher.description}`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveVoucher}
                        className="text-emerald-600 hover:text-emerald-800"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherError(null); }}
                        placeholder="Masukkan kode voucher"
                        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 uppercase tracking-wider outline-none transition-colors placeholder:text-gray-400 placeholder:normal-case focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyVoucher}
                        isLoading={isCheckingVoucher}
                        disabled={!voucherCode.trim()}
                      >
                        Gunakan
                      </Button>
                    </div>
                  )}
                  {voucherError && (
                    <p className="mt-2 text-xs text-red-500">{voucherError}</p>
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

                {/* Package card */}
                <div className="flex gap-3 rounded-xl bg-gray-50 p-3">
                  {pkg.thumbnail ? (
                    <img src={pkg.thumbnail} alt={pkg.name} className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
                      <span className="text-lg font-bold text-white/30">JFT</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{pkg.name}</p>
                    <p className="text-xs text-gray-500">{pkg.category} · {pkg.level}</p>
                    <p className="mt-1 text-xs text-gray-500">{pkg.duration_minutes} menit · {pkg.total_questions ?? 0} soal</p>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Harga paket</span>
                    <span className="text-gray-900">{formatCurrency(pkg.price)}</span>
                  </div>
                  {voucher && (
                    <div className="flex justify-between">
                      <span className="text-emerald-600">Diskon ({voucher.code})</span>
                      <span className="font-medium text-emerald-600">-{formatCurrency(voucher.discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total Pembayaran</span>
                      <span className={`text-lg font-bold ${voucher ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {formatCurrency(finalTotal)}
                      </span>
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
