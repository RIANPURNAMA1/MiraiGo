import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchPackages } from '@/services/packages';
import type { Package } from '@/types';
import { ArrowLeft, Crown, Check } from 'lucide-react';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function UpgradeAkses() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);

  useEffect(() => {
    fetchPackages({ page: 1, per_page: 50 })
      .then((res) => {
        setPackages(res.items);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const locked = packages.filter((p) => p.access_state === 'locked');
  const unlocked = packages.filter((p) => p.access_state !== 'locked');

  return (
    <div className="space-y-6">
      <div>
        <Link to="/latihan-soal" className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} />
          Kembali ke Latihan Soal
        </Link>
        <h2 className="text-2xl font-semibold text-gray-900">Upgrade Akses</h2>
        <p className="text-sm text-gray-500">Beli paket untuk membuka semua latihan soal dan materi.</p>
      </div>

      {isLoading ? (
        <LoadingState label="Memuat paket..." />
      ) : packages.length === 0 ? (
        <EmptyState title="Belum ada paket." description="Paket akan tersedia segera." />
      ) : (
        <>
          {/* Locked — needs purchase */}
          {locked.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Perlu Dibeli</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {locked.map((pkg) => (
                  <Card key={pkg.id} className="flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      {pkg.category && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                          {pkg.category}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        Terkunci
                      </span>
                    </div>

                    <h3 className="mt-3 font-semibold text-gray-400">{pkg.name}</h3>
                    <p className="mt-1 line-clamp-2 flex-1 text-sm text-gray-400">{pkg.description ?? 'Paket latihan premium.'}</p>

                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="mb-3 flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-gray-900">{formatCurrency(pkg.price)}</span>
                        <span className="text-xs text-gray-400">sekali bayar</span>
                      </div>
                      <Button className="w-full gap-2" onClick={() => setSelectedPkg(pkg)}>
                        <Crown size={16} />
                        Beli Sekarang
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Unlocked — already purchased */}
          {unlocked.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Sudah Diakses</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {unlocked.map((pkg) => (
                  <Card key={pkg.id} className="flex flex-col bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      {pkg.category && (
                        <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                          {pkg.category}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        <Check size={10} />
                        Sudah Upgrade
                      </span>
                    </div>

                    <h3 className="mt-3 font-semibold text-gray-900">{pkg.name}</h3>
                    <p className="mt-1 line-clamp-2 flex-1 text-sm text-gray-500">{pkg.description ?? 'Paket latihan.'}</p>

                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <Link to={`/practice/${pkg.id}`}>
                        <Button variant="outline" className="w-full">
                          Buka Paket
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Benefit popup */}
      {selectedPkg && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedPkg(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Crown size={24} className="text-amber-600" />
              </div>
            </div>
            <h3 className="text-center text-base font-semibold text-gray-900">Paket Soal Terkunci</h3>
            <p className="mt-2 text-center text-sm text-gray-500 leading-relaxed">
              Dengan paket <strong className="text-gray-700">{selectedPkg.name}</strong>, kamu mendapatkan akses ke soal latihan yang terkunci.
            </p>
            <p className="mt-1 text-center text-sm text-gray-500 leading-relaxed">
              Membuka paket ini hanya perlu <strong className="text-gray-700">sekali bayar</strong> dan semua akses terbuka untuk selamanya.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setSelectedPkg(null)}
                className="flex-1 rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
              >
                Nanti Saja
              </button>
              <Link to={`/payment/${selectedPkg.id}`} className="flex-1">
                <button className="w-full rounded-lg bg-[#5e8b5d] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4d7a4c]">
                  Upgrade Sekarang
                </button>
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
