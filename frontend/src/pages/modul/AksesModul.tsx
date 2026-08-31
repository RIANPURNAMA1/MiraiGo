import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { api, ROOT_URL } from '@/services/api';
import { fetchModules } from '@/services/modules';
import { fetchCategories } from '@/services/packages';
import { fetchModulePremiumPayments } from '@/services/modulePremium';
import type { ModulePremiumPaymentItem } from '@/services/modulePremium';
import type { Category, LearningModule } from '@/types';
import { getCategoryIcon } from '@/constants/categoryIcons';
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
  Info,
  ReceiptText,
  Clock,
  Download,
  CheckCircle2,
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
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [premiumPrice, setPremiumPrice] = useState(0);
  const [premiumPayments, setPremiumPayments] = useState<ModulePremiumPaymentItem[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {});
    fetchModules()
      .then((res) => setModules(res.items))
      .catch(() => {})
      .finally(() => setIsLoading(false));
    api.get('/module-premium-settings').then((res) => {
      setPremiumPrice(res.data.data?.premium_price ?? 0);
    }).catch(() => {});
    fetchModulePremiumPayments().then((d) => setPremiumPayments(d.payments ?? [])).catch(() => {});
  }, []);

  const grouped = categories.map((cat) => ({
    cat,
    modul: modules.filter((m) => m.category?.id === cat.id),
  }));

  const catIds = new Set(categories.map((c) => c.id));
  const uncategorized = modules.filter((m) => !m.category_id || !catIds.has(m.category_id));

  const premiumModules = modules.filter((m) => m.is_premium);
  const premiumLocked = premiumModules.some((m) => !m.accessible);

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

      {/* Informasi Modul */}
      <Card className="border-brand-100 bg-brand-50/60 p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <Info size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">Informasi Modul</h3>
            <p className="text-xs text-gray-500">Hal yang perlu Anda ketahui tentang modul.</p>
          </div>
        </div>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 ring-1 ring-brand-200">
              <Check size={12} strokeWidth={2.5} />
            </span>
            Modul premium diperbarui setiap ada update.
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 ring-1 ring-brand-200">
              <Check size={12} strokeWidth={2.5} />
            </span>
            Materi sesuai dengan standar ujian terbaru.
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 ring-1 ring-brand-200">
              <Check size={12} strokeWidth={2.5} />
            </span>
            Konsultasi materi tersedia selama jam kerja.
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 ring-1 ring-brand-200">
              <Check size={12} strokeWidth={2.5} />
            </span>
            Akses modul berlaku selama link masih dapat diakses.
          </li>
        </ul>
      </Card>

      {/* Category sections */}
      {grouped.map(({ cat, modul }) => (
        <CategoryBlock key={cat.id} cat={cat} modul={modul} />
      ))}

      {/* Modules without a category */}
      {uncategorized.length > 0 && (
        <Card className="overflow-hidden border-gray-200 p-0 shadow-sm">
          <div className="border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                <BookOpen size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">Modul Lainnya</h3>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  Modul yang belum masuk kategori mana pun.
                </p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {uncategorized.map((m) => (
              <ModuleRow key={m.id} modul={m} locked={!m.accessible} />
            ))}
          </div>
        </Card>
      )}

      {/* Upgrade / all-open bar */}
      {premiumLocked ? (
        <Card className="border-gray-200 bg-gray-50 p-0 shadow-sm">
          <div className="flex flex-col gap-3 px-4 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">Mau akses semua sekaligus?</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-xs text-gray-500">
                  Upgrade paket untuk buka semua modul premium yang masih terkunci.
                </p>
                {premiumModules.length > 0 && premiumPrice > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                    <Crown size={11} />
                    Rp{formatPrice(premiumPrice)} / selamanya
                  </span>
                )}
              </div>
            </div>
            <Button size="sm" className="shrink-0" onClick={() => setShowUpgradeModal(true)}>
              Upgrade Paket
              <ArrowRight size={14} />
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <BadgeCheck size={20} className="shrink-0 text-green-600" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Semua Modul Terbuka</p>
              <p className="text-xs text-gray-600">Anda memiliki akses ke seluruh modul yang tersedia.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Upgrade modal */}
      {showUpgradeModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div
              className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowUpgradeModal(false)}
            />
            <div className="relative w-full max-w-md overflow-hidden rounded-md bg-white shadow-2xl max-h-[90dvh] overflow-y-auto">
              {/* Header */}
              <div className="relative border-b border-gray-100 bg-white px-4 py-6 sm:px-6 sm:text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-md bg-[#eaf6ff]">
                  <Crown size={26} className="text-[#18a6fc]" />
                </div>
                <h3 className="pr-8 text-xl font-bold text-gray-900 sm:pr-0 sm:text-center">Upgrade ke Akses Modul Premium</h3>
                <p className="mt-1 text-sm font-medium text-[#18a6fc]">
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
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#eaf6ff] text-[#18a6fc]">
                            <Icon size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">{m.title}</p>
                            <p className="text-xs text-gray-500">{getModulType(m)}</p>
                          </div>
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#18a6fc] text-white">
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
                    <button className="w-full rounded-md bg-[#18a6fc] py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#0f96e0]">
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
        <div className="border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eaf6ff] text-[#18a6fc]">
              <ReceiptText size={19} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900">Riwayat Transaksi Modul Premium</h3>
              <p className="mt-0.5 truncate text-xs text-gray-500">Riwayat pembelian paket akses modul premium.</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {premiumPayments.length === 0 ? (
            <div className="px-4 py-10 sm:px-6">
              <EmptyState
                title="Belum ada transaksi"
                description="Invoice pembelian paket modul premium akan muncul di sini."
              />
            </div>
          ) : (
            premiumPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <ReceiptText size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">Akses Modul Premium</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={12} className="shrink-0" />
                      <span className="truncate">
                        {p.created_at
                          ? new Date(p.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
   CATEGORY BLOCK
========================================================= */

function CategoryBlock({ cat, modul }: { cat: Category; modul: LearningModule[] }) {
  const Icon = getCategoryIcon(cat.icon);
  const hasAccess = !!cat.has_access;

  return (
    <Card className="overflow-hidden border-gray-200 p-0 shadow-sm">
      <div className="border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
              <Icon size={19} />
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-gray-900">{cat.name}</h3>
                {cat.is_premium &&
                  (hasAccess ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                      <CheckCircle2 size={10} />
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                      <Lock size={10} />
                      Premium
                    </span>
                  ))}
              </div>
              {cat.description && (
                <p className="mt-0.5 truncate text-xs text-gray-500">{cat.description}</p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {cat.is_premium && !hasAccess && (
              <Link
                to="/subscription"
                className="inline-flex items-center gap-1 rounded-md bg-gray-900 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-gray-700"
              >
                <Crown size={11} />
                Upgrade
              </Link>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
              <BookOpen size={12} />
              {modul.length} modul
            </span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {modul.length === 0 ? (
          <div className="px-4 py-8 sm:px-6">
            <EmptyState title="Belum ada modul di kategori ini." />
          </div>
        ) : (
          modul.map((m) => <ModuleRow key={m.id} modul={m} locked={!m.accessible} />)
        )}
      </div>
    </Card>
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
    <div className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-gray-50 sm:gap-4 sm:px-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600">
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium text-gray-900">{modul.title}</h4>
        <div className="mt-1 flex items-center gap-2">
          {modul.description && (
            <span className="truncate text-xs text-gray-500">{modul.description}</span>
          )}
          {modul.description && (
            <span className="text-gray-300">•</span>
          )}
          <span className="shrink-0 text-xs text-gray-400">{tipe}</span>
        </div>
      </div>

      {locked ? (
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-gray-400">
          <Lock size={13} />
          <span>Terkunci</span>
        </div>
      ) : (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <BadgeCheck size={16} className="hidden text-green-500 sm:block" />
          {modul.file_url && (
            <a
              href={buildFileUrl(modul) ?? '#'}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:px-3"
            >
              <Download size={14} />
              Download
            </a>
          )}
          <Button size="sm" className="h-8 px-2.5 sm:px-3" onClick={() => openModul(modul)}>
            <BookOpen size={14} />
            Buka
          </Button>
        </div>
      )}
    </div>
  );
}