import { useEffect, useRef, useState } from 'react';

import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';

import { fetchSubscription } from '@/services/subscription';
import { fetchPackages } from '@/services/packages';

import type { Package, SubscriptionData } from '@/types';

import {
  CheckCircle2,
  Clock3,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Lock,
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
  const [isLoading, setIsLoading] = useState(true);
  const premiumRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetchSubscription(),
      fetchPackages(),
    ])
      .then(([subData, pkgRes]) => {
        setSub(subData);
        setPackages(Array.isArray(pkgRes.items) ? pkgRes.items : []);
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
      Pilih paket yang sesuai dengan kebutuhan belajar Anda.
    </p>
  </div>

  {premiumPkgs.length === 0 ? (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
      <Lock
        size={22}
        className="mx-auto mb-3 text-gray-300"
      />

      <p className="text-sm font-medium text-gray-700">
        Belum ada paket premium
      </p>

      <p className="mt-1 text-xs text-gray-400">
        Paket premium belum tersedia saat ini.
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {premiumPkgs.map((pkg) => {
        const owned = sub?.accesses.some(
          (a) =>
            a.package === pkg.name &&
            a.status === 'active'
        );

        return (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            premium
            owned={!!owned}
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
    </div>
  );
}

/* =========================================================
   PACKAGE CARD
========================================================= */
function PackageCard({
  pkg,
  premium = false,
  owned,
}: {
  pkg: Package;
  premium?: boolean;
  owned: boolean;
}) {
  return (
    <div
      className={`group flex flex-col rounded-xl border bg-white p-4 transition-all duration-200 ${
        owned
          ? 'border-gray-200'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              premium
                ? 'bg-amber-50 text-amber-500'
                : 'bg-gray-50 text-gray-500'
            }`}
          >
            {premium ? (
              <Lock size={13} />
            ) : (
              <ShieldCheck size={13} />
            )}
          </div>

          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-gray-900">
              {pkg.name}
            </h4>

            {pkg.level && (
              <span className="mt-0.5 block text-[11px] text-gray-400">
                Level {pkg.level}
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        {owned ? (
          <span className="shrink-0 text-xs font-medium text-emerald-600">
            Aktif
          </span>
        ) : premium ? (
          <span className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
            Premium
          </span>
        ) : null}
      </div>

      {/* Description */}
      {pkg.description && (
        <p className="mt-2.5 line-clamp-2 text-xs leading-5 text-gray-500">
          {pkg.description}
        </p>
      )}

      {/* Price */}
      <div className="mt-3 border-t border-gray-100 pt-3">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold tracking-tight text-gray-900">
            {formatCurrency(pkg.price)}
          </span>

          <span className="text-[11px] text-gray-400">
            / 30 hari
          </span>
        </div>
      </div>

      {/* Action */}
      <div className="mt-3">
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
        ) : (
          <Link to={`/payment/${pkg.id}`} className="block">
            <Button className="w-full" size="sm">
              Pilih Paket
              <ArrowRight size={14} />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}