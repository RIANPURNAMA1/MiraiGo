import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Crown, 
  Check, 
  Sparkles, 
  BadgeCheck, 
  ArrowRight, 
  Gift, 
  Clock 
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchPackages } from '@/services/packages';
import { api } from '@/services/api';
import type { Package } from '@/types';

// ==========================================
// Helper Functions
// ==========================================
function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID').format(n);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// ==========================================
// Main Component
// ==========================================
export default function UpgradeAkses() {
  // --- States ---
  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [premiumPrice, setPremiumPrice] = useState(0);

  // --- Effects ---
  useEffect(() => {
    // 1. Fetch Packages
    fetchPackages({ page: 1, per_page: 50 })
      .then((res) => {
        setPackages(res.items);
      })
      .finally(() => setIsLoading(false));

    // 2. Fetch Premium Settings
    api.get('/module-premium-settings')
      .then((res) => {
        setPremiumPrice(res.data.data?.premium_price ?? 0);
      })
      .catch(() => {});

    // 3. Fetch Premium Access Status
    api.get('/module-premium-access')
      .then((res) => {
        setHasPremiumAccess(res.data.data?.has_access ?? false);
      })
      .catch(() => {});
  }, []);

  // --- Derived Variables ---
  const locked = packages.filter((p) => p.access_state === 'locked');
  const unlocked = packages.filter((p) => p.access_state !== 'locked');

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      
      {/* Header Section */}
      <div className="border-b border-gray-100 pb-6">
        <Link
          to="/latihan-soal"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Kembali ke Latihan Soal
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Upgrade Akses Premium
        </h2>
        <p className="mt-2 text-base text-gray-500">
          Tingkatkan potensi belajarmu. Buka semua materi dan bank soal eksklusif.
        </p>
      </div>

      {/* Status Akses Section */}
      <Card className="overflow-hidden border-gray-200 p-0 shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Status Akses</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-3">
          {/* Status */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              {hasPremiumAccess ? (
                <BadgeCheck size={20} className="text-green-500" />
              ) : (
                <Clock size={20} />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500">Status Akses</p>
              {hasPremiumAccess ? (
                <p className="text-sm font-semibold text-green-600">Aktif</p>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                  Belum Aktif
                </span>
              )}
            </div>
          </div>

          {/* Bonus Referral */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <Gift size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Bonus referral</p>
              <p className="text-sm font-semibold text-gray-900">+0 hari</p>
            </div>
          </div>

          {/* Masa Berlaku */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Masa berlaku</p>
              <p className="text-sm font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Empty / No Access Message */}
      {!hasPremiumAccess && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
            <Crown size={22} />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            Anda belum memiliki akses premium
          </h3>
          <p className="mt-1.5 max-w-md text-sm text-gray-500">
            Pilih paket di bawah untuk membuka seluruh materi pembelajaran.
          </p>
        </div>
      )}

      {/* Akses Premium Promo Card */}
      <Card className="overflow-hidden border-gray-200 p-0 shadow-sm">
        <div className="flex flex-col gap-5 bg-gray-900 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500 text-black">
              <Crown size={24} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Akses Premium</h3>
              <p className="mt-1 text-sm text-gray-300">
                Buka seluruh materi pembelajaran JFT dan SSW.
              </p>
              {premiumPrice > 0 && (
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">
                  Rp{formatPrice(premiumPrice)}
                </p>
              )}
            </div>
          </div>
          <Link
            to="/subscription"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
          >
            Lihat Paket
            <ArrowRight size={16} />
          </Link>
        </div>
      </Card>

      {/* Packages Section */}
      {isLoading ? (
        <LoadingState label="Memuat paket eksklusif..." />
      ) : packages.length === 0 ? (
        <EmptyState title="Belum ada paket." description="Paket premium akan segera tersedia." />
      ) : (
        <div className="space-y-12">
          
          {/* Locked Packages */}
          {locked.length > 0 && (
            <section>
              <div className="mb-6 flex items-center gap-2">
                <Crown className="text-amber-500" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Penawaran Premium</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {locked.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className="group relative flex cursor-pointer flex-col overflow-hidden border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
                    onClick={() => setSelectedPkg(pkg)}
                  >
                    {/* Top Accent Line */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 to-amber-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="flex h-full flex-col p-6">
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                          <Crown size={14} className="text-amber-500" />
                          Premium
                        </span>
                        {pkg.category && (
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                            {pkg.category}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                      <p className="mt-2 flex-1 line-clamp-3 text-sm leading-relaxed text-gray-500">
                        {pkg.description ?? 'Dapatkan akses tak terbatas ke semua soal latihan dalam paket premium ini.'}
                      </p>

                      <div className="mt-6 border-t border-gray-100 pt-6">
                        <div className="mb-4 flex items-baseline gap-1.5">
                          <span className="text-3xl font-extrabold text-gray-900">
                            {formatCurrency(pkg.price)}
                          </span>
                          <span className="text-sm font-medium text-gray-400">/selamanya</span>
                        </div>
                        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-gray-800 hover:shadow-md focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                          Beli Sekarang
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Unlocked Packages */}
          {unlocked.length > 0 && (
            <section>
              <div className="mb-6 flex items-center gap-2">
                <Check className="text-emerald-500" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Paket Dimiliki</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {unlocked.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className="flex flex-col border border-emerald-100 bg-emerald-50/30 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex h-full flex-col p-6">
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                          <Check size={14} />
                          Sudah Akses
                        </span>
                        {pkg.category && (
                          <span className="inline-flex items-center rounded-md bg-white/60 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                            {pkg.category}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                      <p className="mt-2 flex-1 line-clamp-2 text-sm leading-relaxed text-gray-600">
                        {pkg.description ?? 'Paket latihan sudah tersedia untuk kamu kerjakan.'}
                      </p>

                      <div className="mt-6">
                        <Link to={`/practice/${pkg.id}`} className="block w-full">
                          <button className="flex w-full items-center justify-center rounded-xl border-2 border-emerald-600 bg-transparent px-4 py-2.5 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2">
                            Mulai Latihan
                          </button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Benefit Modal Redesign */}
      {selectedPkg &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => setSelectedPkg(null)}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 overflow-hidden rounded-2xl bg-white shadow-2xl">
              
              {/* Header Gradient */}
              <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 px-6 py-8 text-center">
                <Sparkles className="absolute right-4 top-2 h-16 w-16 text-white/20" />
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/20 shadow-inner backdrop-blur-md">
                  <Crown size={32} className="text-white drop-shadow-md" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">Upgrade ke Premium</h3>
              </div>
              
              {/* Modal Body */}
              <div className="p-6">
                <p className="mb-4 text-center text-base text-gray-600">
                  Dapatkan akses selamanya untuk paket{' '}
                  <span className="font-bold text-gray-900">{selectedPkg.name}</span>.
                </p>
                
                <div className="mb-8 rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
                  <p className="mb-1 text-sm font-medium text-gray-500">Total Pembayaran</p>
                  <p className="text-3xl font-extrabold text-gray-900">
                    {formatCurrency(selectedPkg.price)}
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    onClick={() => setSelectedPkg(null)}
                    className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <Link to={`/payment/${selectedPkg.id}`} className="flex-1">
                    <button className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-amber-600 hover:shadow-lg">
                      Lanjutkan Pembayaran
                    </button>
                  </Link>
                </div>
              </div>

            </div>
          </div>,
          document.body
        )}
    </div>
  );
}