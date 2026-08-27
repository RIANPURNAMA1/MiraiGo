import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/stores/AuthContext';
import { api, ROOT_URL } from '@/services/api';
import { fetchModules, fetchModulePurchases } from '@/services/modules';
import { fetchModulePremiumAccess, fetchModulePremiumPayments } from '@/services/modulePremium';
import type { ModulePremiumPaymentItem } from '@/services/modulePremium';
import type { LearningModule, ModulePurchase } from '@/types';
import {
  BookOpen,
  FileText,
  Video,
  Headphones,
  Globe,
  Lock,
  Crown,
  ArrowRight,
  Check,
  BadgeCheck,
  X,
  ReceiptText,
  Clock,
  Download,
} from 'lucide-react';

function buildFileUrl(m: LearningModule): string | null {
  if (!m.file_url) return null;
  if (m.file_url.startsWith('http')) return m.file_url;
  const path = m.file_url.startsWith('/') ? m.file_url : `/${m.file_url}`;
  const normalized = path.startsWith('/storage/') ? path : `/storage${path}`;
  return `${ROOT_URL}${normalized}`;
}

function openModul(m: LearningModule) {
  if (m.external_url) {
    window.open(m.external_url, '_blank');
  } else {
    const url = buildFileUrl(m);
    if (url) window.open(url, '_blank');
  }
}

function getModulIcon(m: LearningModule) {
  if (m.external_url) return Globe;
  if (m.file_url?.match(/\.(mp4|webm|mov)$/i)) return Video;
  if (m.file_url?.match(/\.(mp3|wav|ogg|m4a)$/i)) return Headphones;
  if (m.file_url?.match(/\.pdf$/i)) return FileText;
  return BookOpen;
}

function getModulType(m: LearningModule): string {
  if (m.external_url) return 'Web';
  if (m.file_url?.match(/\.(mp4|webm|mov)$/i)) return 'Video';
  if (m.file_url?.match(/\.(mp3|wav|ogg|m4a)$/i)) return 'Audio';
  if (m.file_url?.match(/\.pdf$/i)) return 'PDF';
  return 'Modul';
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID').format(n);
}

export default function AksesModul() {
  const { user } = useAuth();
  const isMendunia = user?.role === 'studentmendunia';
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [purchases, setPurchases] = useState<ModulePurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [premiumPrice, setPremiumPrice] = useState(0);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [premiumPayments, setPremiumPayments] = useState<ModulePremiumPaymentItem[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchModules()
      .then((res) => setModules(res.items))
      .catch(() => {})
      .finally(() => setIsLoading(false));
    fetchModulePurchases()
      .then(setPurchases)
      .catch(() => {});
    api.get('/module-premium-settings').then((res) => {
      setPremiumPrice(res.data.data?.premium_price ?? 0);
    }).catch(() => {});
    fetchModulePremiumAccess().then((a) => setHasPremiumAccess(!!a.has_access)).catch(() => {});
    fetchModulePremiumPayments().then((d) => setPremiumPayments(d.payments ?? [])).catch(() => {});
  }, []);

  const purchasedIds = new Set(purchases.filter((p) => p.status === 'active').map((p) => p.module_id));

  const freeModules = isMendunia
    ? modules
    : modules.filter((m) => !m.is_premium);

  const premiumModules = isMendunia
    ? []
    : modules.filter((m) => m.is_premium);

  if (isLoading) return <LoadingState label="Memuat modul..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
          Akses Modul
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Akses materi pembelajaran yang tersedia untuk Anda.
        </p>
      </div>

      {/* Access Cards */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* ================= FREE ================= */}
        <Card className="overflow-hidden border-gray-200 p-0 shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                  <BookOpen size={19} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Akses Modul Free</h3>
                  <p className="mt-0.5 text-xs text-gray-500">Materi yang dapat diakses secara gratis</p>
                </div>
              </div>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">FREE</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {freeModules.length === 0 ? (
              <div className="px-6 py-8">
                <EmptyState title="Belum ada modul gratis." />
              </div>
            ) : (
              freeModules.map((m) => (
                <ModuleRow key={m.id} modul={m} locked={false} />
              ))
            )}
          </div>

          <div className="border-t border-gray-100 px-6 py-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Check size={14} className="text-gray-700" />
              <span>{freeModules.length} modul tersedia secara gratis</span>
            </div>
          </div>
        </Card>

        {/* ================= PREMIUM ================= */}
        {premiumModules.length > 0 && (
          <Card className="overflow-hidden border-gray-200 p-0 shadow-sm">
            <div className="h-0.5 bg-gray-900" />
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500 text-black">
                    <Crown size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Akses Modul Premium</h3>
                    <p className="mt-0.5 text-xs text-gray-500">Materi eksklusif — beli satuan atau upgrade paket</p>
                  </div>
                </div>
                <span className="rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white">PREMIUM</span>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {premiumModules.map((m) => (
                <ModuleRow
                  key={m.id}
                  modul={m}
                  locked={!purchasedIds.has(m.id) && !hasPremiumAccess}
                />
              ))}
            </div>

            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
              {hasPremiumAccess ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <BadgeCheck size={20} className="text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Akses Modul Premium Aktif</p>
                      <p className="text-xs text-gray-500">Semua modul premium telah terbuka untuk Anda.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mau akses semua sekaligus?</p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-xs text-gray-500">Upgrade paket untuk buka semua modul premium.</p>
                      {premiumPrice > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                          <Crown size={11} />
                          Rp{formatPrice(premiumPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" className="shrink-0" onClick={() => setShowUpgradeModal(true)}>
                    Upgrade Paket
                    <ArrowRight size={14} />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Upgrade modal */}
      {showUpgradeModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div
              className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowUpgradeModal(false)}
            />
            <div className="relative w-full max-w-md overflow-hidden rounded-md bg-white shadow-2xl">
              {/* Header */}
              <div className="relative border-b border-gray-100 bg-white px-6 py-6 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-md bg-purple-100">
                  <Crown size={26} className="text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Upgrade ke Akses Modul Premium</h3>
                <p className="mt-1 text-sm font-medium text-purple-600">
                  {premiumPrice > 0 ? `Rp${formatPrice(premiumPrice)} / selamanya` : 'Buka semua modul premium'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X size={15} />
              </button>

              <div className="bg-gray-50 p-6">
                <p className="mb-4 text-sm font-medium text-gray-700">
                  Anda akan mendapatkan akses ke {premiumModules.length} modul berikut:
                </p>

                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {premiumModules.length === 0 ? (
                    <p className="text-sm text-gray-400">Belum ada modul premium.</p>
                  ) : (
                    premiumModules.map((m) => {
                      const Icon = getModulIcon(m);
                      return (
                        <div key={m.id} className="flex items-center gap-3 rounded-md border border-gray-100 bg-white px-3 py-2.5 shadow-sm">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                            <Icon size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">{m.title}</p>
                            <p className="text-xs text-gray-500">{getModulType(m)}</p>
                          </div>
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white">
                            <Check size={12} />
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 bg-white px-6 py-4">
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1 rounded-md border border-gray-300 bg-white py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <Link to="/payment-module-premium" onClick={() => setShowUpgradeModal(false)} className="flex-1">
                    <button className="w-full rounded-md bg-purple-600 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-purple-700">
                      {premiumPrice > 0 ? `Bayar Rp${formatPrice(premiumPrice)}` : 'Lanjutkan Pembayaran'}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ================= RIWAYAT TRANSAKSI ================= */}
      <Card className="border-gray-200 p-0 shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <ReceiptText size={19} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Riwayat Transaksi Modul Premium</h3>
              <p className="mt-0.5 text-xs text-gray-500">Riwayat pembelian paket akses modul premium.</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {premiumPayments.length === 0 ? (
            <div className="px-6 py-10">
              <EmptyState
                title="Belum ada transaksi"
                description="Invoice pembelian paket modul premium akan muncul di sini."
              />
            </div>
          ) : (
            premiumPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <ReceiptText size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Akses Modul Premium</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>
                        {p.created_at
                          ? new Date(p.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">Rp{formatPrice(p.amount)}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   MODULE ROW
========================================================= */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Menunggu', cls: 'bg-amber-100 text-amber-700' },
    paid: { label: 'Disetujui', cls: 'bg-green-100 text-green-700' },
    failed: { label: 'Ditolak', cls: 'bg-red-100 text-red-700' },
  };
  const s = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

function ModuleRow({
  modul,
  locked,
}: {
  modul: LearningModule;
  locked: boolean;
}) {
  const Icon = getModulIcon(modul);
  const tipe = getModulType(modul);

  return (
    <div className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600">
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium text-gray-900">{modul.title}</h4>
        <div className="mt-1 flex items-center gap-2">
          {modul.description && (
            <span className="truncate text-xs text-gray-500">{modul.description}</span>
          )}
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-400">{tipe}</span>
        </div>
      </div>

      {locked ? (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Lock size={13} />
          <span>Terkunci</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <BadgeCheck size={16} className="hidden text-green-500 sm:block" />
          {modul.file_url && (
            <a
              href={buildFileUrl(modul) ?? '#'}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Download size={14} />
              Download
            </a>
          )}
          <Button size="sm" className="h-8 px-3" onClick={() => openModul(modul)}>
            <BookOpen size={14} />
            Buka
          </Button>
        </div>
      )}
    </div>
  );
}
