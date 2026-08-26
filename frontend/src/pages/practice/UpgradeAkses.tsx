import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchPackages } from '@/services/packages';
import type { Package } from '@/types';
import { ArrowLeft, Crown, Clock, FileText, Layers, Check } from 'lucide-react';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function UpgradeAkses() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);

  useEffect(() => {
    fetchPackages({ page: 1 })
      .then((res) => {
        const premium = res.items.filter((p) => p.is_premium);
        setPackages(premium);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/latihan-soal" className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} />
          Kembali ke Latihan Soal
        </Link>
        <h2 className="text-2xl font-semibold text-gray-900">Upgrade Akses</h2>
        <p className="text-sm text-gray-500">Pilih paket premium untuk membuka semua latihan soal dan materi.</p>
      </div>

      {isLoading ? (
        <LoadingState label="Memuat paket..." />
      ) : packages.length === 0 ? (
        <EmptyState title="Belum ada paket premium." description="Paket premium akan tersedia segera." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                {pkg.category && (
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                    {pkg.category}
                  </span>
                )}
                <Badge variant="brand">Premium</Badge>
              </div>

              <h3 className="mt-3 font-semibold text-gray-900">{pkg.name}</h3>
              <p className="mt-1 line-clamp-2 flex-1 text-sm text-gray-500">{pkg.description ?? 'Paket latihan premium.'}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {pkg.level && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20V10M18 20V4M6 20v-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {pkg.level}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                  <Clock size={12} />
                  {pkg.duration_minutes} mnt
                </span>
                {pkg.total_questions != null && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                    <FileText size={12} />
                    {pkg.total_questions} soal
                  </span>
                )}
                {pkg.sections && pkg.sections.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                    <Layers size={12} />
                    {pkg.sections.length} section
                  </span>
                )}
              </div>

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
      )}

      {/* Benefit popup */}
      {selectedPkg && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedPkg(null)} />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Crown size={20} />
            </div>
            <h3 className="mt-3 text-base font-semibold text-gray-900">Upgrade ke Premium</h3>
            <p className="mt-1 text-sm text-gray-500">
              Dengan paket <span className="font-medium text-gray-700">{selectedPkg.name}</span>, kamu mendapatkan:
            </p>
            <ul className="mt-4 space-y-2.5">
              {[
                'Akses unlimited ke semua soal latihan',
                'Pembahasan lengkap tiap soal',
                'Simulasi ujian dengan timer',
                'Update soal terbaru secara berkala',
                'Grup Telegram eksklusif',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <Check size={16} className="mt-0.5 shrink-0 text-brand-500" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1" onClick={() => setSelectedPkg(null)}>
                Nanti Dulu
              </Button>
              <Link to={`/payment/${selectedPkg.id}`} className="flex-1">
                <Button size="sm" className="w-full gap-2" onClick={() => setSelectedPkg(null)}>
                  Lanjutkan
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
