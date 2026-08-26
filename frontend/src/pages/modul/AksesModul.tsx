import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/stores/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { fetchModules, purchaseModule, fetchModulePurchases } from '@/services/modules';
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
  ShoppingCart,
  BadgeCheck,
} from 'lucide-react';

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

function openModul(m: LearningModule) {
  if (m.external_url) {
    window.open(m.external_url, '_blank');
  } else if (m.file_url) {
    window.open(m.file_url, '_blank');
  }
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID').format(n);
}

export default function AksesModul() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isMendunia = user?.role === 'studentmendunia';
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [purchases, setPurchases] = useState<ModulePurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);

  useEffect(() => {
    fetchModules()
      .then((res) => setModules(res.items))
      .catch(() => {})
      .finally(() => setIsLoading(false));
    fetchModulePurchases()
      .then(setPurchases)
      .catch(() => {});
  }, []);

  const purchasedIds = new Set(purchases.filter((p) => p.status === 'active').map((p) => p.module_id));

  const freeModules = isMendunia
    ? modules
    : modules.filter((m) => !m.is_premium);

  const premiumModules = isMendunia
    ? []
    : modules.filter((m) => m.is_premium);

  async function handleBuy(mod: LearningModule) {
    if (!confirm(`Beli modul "${mod.title}" seharga Rp${formatPrice(mod.price)}?`)) return;
    setPurchasingId(mod.id);
    try {
      await purchaseModule(mod.id);
      showToast('Modul berhasil dibeli!', 'success');
      const purch = await fetchModulePurchases();
      setPurchases(purch);
    } catch {
      showToast('Gagal membeli modul.', 'error');
    } finally {
      setPurchasingId(null);
    }
  }

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
                  locked={!purchasedIds.has(m.id)}
                  onBuy={() => handleBuy(m)}
                  buying={purchasingId === m.id}
                />
              ))}
            </div>

            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Mau akses semua sekaligus?</p>
                  <p className="mt-0.5 text-xs text-gray-500">Upgrade paket untuk buka semua modul premium.</p>
                </div>
                <Link to="/upgrade-akses">
                  <Button size="sm" className="shrink-0">
                    Upgrade Paket
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MODULE ROW
========================================================= */

function ModuleRow({
  modul,
  locked,
  onBuy,
  buying,
}: {
  modul: LearningModule;
  locked: boolean;
  onBuy?: () => void;
  buying?: boolean;
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
        <div className="flex items-center gap-2">
          {modul.price > 0 && (
            <span className="text-xs font-semibold text-gray-700">
              Rp{formatPrice(modul.price)}
            </span>
          )}
          {onBuy ? (
            <button
              type="button"
              disabled={buying}
              onClick={onBuy}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-gray-900 px-3 text-xs font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              <ShoppingCart size={13} />
              {buying ? '...' : 'Beli'}
            </button>
          ) : (
            <Link to="/upgrade-akses">
              <button
                type="button"
                className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
              >
                <Lock size={13} />
                Terkunci
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <BadgeCheck size={16} className="text-green-500" />
          <Button size="sm" className="h-8 px-3" onClick={() => openModul(modul)}>
            <BookOpen size={14} />
            Buka
          </Button>
        </div>
      )}
    </div>
  );
}
