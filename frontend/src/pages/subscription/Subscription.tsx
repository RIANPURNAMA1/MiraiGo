import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';

import { fetchSubscription } from '@/services/subscription';
import { fetchPackages, fetchCategories } from '@/services/packages';

import type { Category, Package, SubscriptionData } from '@/types';

import {
  CheckCircle2,
  Clock3,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Lock,
  BookOpen,
  Infinity as InfinityIcon,
  Sparkles,
  RefreshCw,
  Headset,
  X,
} from 'lucide-react';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) return '-';

  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function daysUntil(value: string | null) {
  if (!value) return null;

  const diff = Math.ceil(
    (new Date(value).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  return Math.max(0, diff);
}

export default function Subscription() {
  const [sub, setSub] = useState<SubscriptionData | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const premiumRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetchSubscription(),
      fetchPackages(),
      fetchCategories(),
    ])
      .then(([subData, pkgRes, catData]) => {
        setSub(subData);
        setPackages(Array.isArray(pkgRes.items) ? pkgRes.items : []);
        setCategories(Array.isArray(catData) ? catData : []);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <LoadingState label="Memuat langganan..." />;
  }

  const premiumPkgs = packages.filter(
    (p) => p.is_premium && p.status === 'published'
  );

  const premiumCategories = categories.filter((c) => c.is_premium);

  const getCategoryPackages = (cat: Category) =>
    premiumPkgs.filter((p) => p.category === cat.slug);

  const activeAccesses =
    sub?.accesses.filter((a) => a.status === 'active') ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />

          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            Subscription
          </span>
        </div>

        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
          Langganan
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Kelola akses premium dan masa berlaku paket pembelajaran Anda.
        </p>
      </div>

      {/* =====================================================
          CURRENT STATUS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Status Card */}
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-md ${
                  sub?.is_active
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {sub?.is_active ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <Clock3 size={22} />
                )}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Status Akses
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {sub?.is_active
                      ? 'Akses Aktif'
                      : 'Belum Aktif'}
                  </h3>

                  <Badge
                    variant={
                      sub?.is_active ? 'success' : 'warning'
                    }
                  >
                    {sub?.is_active ? 'Aktif' : 'Belum Aktif'}
                  </Badge>
                </div>
              </div>
            </div>

            {sub?.referral_bonus_days !== undefined && (
              <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">
                  Bonus referral
                </p>

                <p className="mt-0.5 text-sm font-semibold text-gray-900">
                  +{sub.referral_bonus_days ?? 0} hari
                </p>
              </div>
            )}
          </div>

          {/* Status Description */}
          <div className="mt-6 border-t border-gray-100 pt-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-gray-400"
              />

              <p className="text-sm leading-6 text-gray-500">
                {sub?.is_active
                  ? 'Anda saat ini memiliki akses ke modul dan materi premium yang tersedia pada paket aktif.'
                  : 'Anda belum memiliki akses premium. Pilih paket di bawah untuk membuka seluruh materi pembelajaran.'}
              </p>
            </div>
          </div>
        </div>

        {/* Premium Quick Action */}
        <div className="rounded-md border border-gray-900 bg-gray-900 p-6 text-white shadow-sm">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-yellow-500 text-black">
                <Lock size={19} />
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                Akses Premium
              </h3>

              <p className="mt-1 text-sm leading-5 text-gray-400">
                Buka seluruh materi pembelajaran JFT dan SSW.
              </p>
            </div>

            <Button
              onClick={() => premiumRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="mt-6 w-full bg-yellow-500 text-black hover:bg-yellow-600"
            >
              Lihat Paket
              <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      </div>

      {/* =====================================================
          ACTIVE ACCESS
      ====================================================== */}

      {activeAccesses.length > 0 && (
        <section>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Akses Aktif
            </h3>

            <p className="mt-0.5 text-xs text-gray-500">
              Paket premium yang sedang aktif pada akun Anda.
            </p>
          </div>

          <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
            {activeAccesses.map((access, index) => {
              const dLeft = daysUntil(access.expires_at);

              return (
                <div
                  key={index}
                  className={`p-5 ${
                    index !== activeAccesses.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    {/* Package */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700">
                        <CreditCard size={18} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {access.package}
                          </p>

                          <Badge variant="success">
                            Aktif
                          </Badge>
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(access.started_at)}
                          {' — '}
                          {access.expires_at
                            ? formatDate(access.expires_at)
                            : 'Selamanya'}
                        </p>
                      </div>
                    </div>

                    {/* Remaining */}
                    {dLeft !== null && (
                      <div className="min-w-[220px]">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Sisa masa aktif
                          </span>

                          <span className="text-xs font-semibold text-gray-900">
                            {dLeft} hari
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-gray-900 transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                (dLeft / 30) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =====================================================
          PREMIUM PACKAGES
      ====================================================== */}

    <section id="premium-packages" ref={premiumRef}>
  {/* Header */}
  <div className="mb-6">
    <div className="flex items-center gap-2">
      <Lock size={17} className="text-amber-500" />
      <h3 className="text-base font-semibold text-gray-900">
        Upgrade Akses
      </h3>
    </div>

    <p className="mt-1 text-sm text-gray-500">
      Pilih kategori yang sesuai dengan kebutuhan belajar Anda.
    </p>
  </div>

  {premiumCategories.length === 0 ? (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
      <Lock
        size={22}
        className="mx-auto mb-3 text-gray-300"
      />

      <p className="text-sm font-medium text-gray-700">
        Belum ada kategori premium
      </p>

      <p className="mt-1 text-xs text-gray-400">
        Kategori premium belum tersedia saat ini.
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {premiumCategories.map((cat) => {
        const catPkgs = getCategoryPackages(cat);

        return (
          <CategoryCard
            key={cat.slug}
            cat={cat}
            packages={catPkgs}
            owned={
              catPkgs.some((p) =>
                sub?.accesses.some(
                  (a) => a.package === p.name && a.status === 'active'
                )
              )
            }
            onSelect={() => setSelectedCat(cat)}
          />
        );
      })}
    </div>
  )}
</section>

      {/* =====================================================
          PAYMENT HISTORY
      ====================================================== */}

      <section>
        <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-600">
              <CreditCard size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Riwayat Pembayaran
              </p>

              <p className="text-xs text-gray-500">
                Lihat transaksi dan pembayaran Anda.
              </p>
            </div>
          </div>

          <Link
            to="/payments"
            className="flex items-center gap-1.5 text-xs font-medium text-gray-700 transition hover:text-gray-900"
          >
            Lihat semua
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* =====================================================
          BENEFITS POPUP
      ====================================================== */}

      {selectedCat &&
        createPortal(
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setSelectedCat(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setSelectedCat(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pr-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Buka akses penuh {selectedCat.name}
                </h3>
                <p className="text-xs text-gray-500">
                  1x bayar, semua paket {selectedCat.name} langsung terbuka.
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <span className="text-lg font-bold tracking-tight text-gray-900">
                {formatCurrency(selectedCat.price ?? 0)}
              </span>
              <span className="text-xs text-gray-400">
                {selectedCat.duration_days ? `/ ${selectedCat.duration_days} hari` : '/ selamanya'}
              </span>
            </div>

            {/* Benefits */}
            <ul className="mt-4 space-y-3">
              {[
                {
                  icon: InfinityIcon,
                  title: 'Akses unlimited',
                  desc: 'Semua paket soal terbuka tanpa batasan, belajar sepuasnya.',
                },
                {
                  icon: Lock,
                  title: 'Akses selamanya',
                  desc: 'Bayar sekali, pakai selamanya. Tanpa biaya bulanan.',
                },
                {
                  icon: RefreshCw,
                  title: 'Update gratis',
                  desc: 'Paket soal baru otomatis terbuka tanpa biaya tambahan.',
                },
                {
                  icon: Headset,
                  title: 'Priority utama',
                  desc: 'Dukungan prioritas untuk member premium.',
                },
              ].map((b) => {
                const BIcon = b.icon;
                return (
                  <li key={b.title} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <BIcon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {b.title}
                      </p>
                      <p className="text-xs leading-5 text-gray-500">
                        {b.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
              <button
                onClick={() => setSelectedCat(null)}
                className="flex-1 rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const pkg = getCategoryPackages(selectedCat)[0];
                  if (pkg) navigate(`/payment/${pkg.id}`);
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-gradient-to-br from-[#025dd2] to-[#15a0f5] py-2.5 text-sm font-semibold text-white transition hover:from-[#0150b8] hover:to-[#0f96e0] shadow-soft"
              >
                Lanjut Bayar
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

/* =========================================================
   CATEGORY CARD
========================================================= */
function CategoryCard({
  cat,
  packages,
  owned,
  onSelect,
}: {
  cat: Category;
  packages: Package[];
  owned: boolean;
  onSelect: () => void;
}) {
  const price = cat.price ?? 0;
  const firstPkgId = packages[0]?.id;

  return (
    <div
      className={`group flex h-full flex-col rounded-xl border bg-white p-5 transition-all duration-200 ${
        owned
          ? 'border-gray-200'
          : 'border-gray-200 hover:border-amber-300 hover:shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <BookOpen size={18} />
          </div>

          <div className="min-w-0">
            <h4 className="break-words text-sm font-semibold text-gray-900">
              {cat.name}
            </h4>

            <span className="mt-0.5 block text-[11px] text-gray-400">
              {packages.length} paket latihan
            </span>
          </div>
        </div>

        {owned ? (
          <span className="shrink-0 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
            Aktif
          </span>
        ) : (
          <span className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
            Premium
          </span>
        )}
      </div>

      {/* Description */}
      {cat.description && (
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-gray-500">
          {cat.description}
        </p>
      )}

      {/* Price */}
      <div className="mt-4 border-t border-gray-100 pt-3">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold tracking-tight text-gray-900">
            {formatCurrency(price)}
          </span>

          <span className="text-[11px] text-gray-400">
            {cat.duration_days ? `/ ${cat.duration_days} hari` : 'selamanya'}
          </span>
        </div>
      </div>

      {/* Action */}
      <div className="mt-4">
        {owned ? (
          <Button
            className="w-full"
            variant="outline"
            size="sm"
            disabled
          >
            <CheckCircle2 size={14} />
            Sudah Aktif
          </Button>
        ) : firstPkgId ? (
          <Button className="w-full" size="sm" onClick={onSelect}>
            Pilih Paket
            <ArrowRight size={14} />
          </Button>
        ) : (
          <Button className="w-full" size="sm" disabled>
            Segera Hadir
          </Button>
        )}
      </div>
    </div>
  );
}