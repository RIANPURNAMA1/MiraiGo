import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { fetchPackages, fetchCategories } from '@/services/packages';
import type { Category, Package } from '@/types';
import { ArrowLeft, BookOpen, FileText, Headphones, Globe, Star } from 'lucide-react';

const categoryStyles: Record<string, { icon: typeof BookOpen; color: string }> = {
  'JFT-Basic': { icon: BookOpen, color: 'bg-brand-50 text-brand-600 border-brand-200 hover:border-brand-300' },
  SSW: { icon: FileText, color: 'bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-300' },
};

const fallbackStyles = [
  { icon: Headphones, color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-300' },
  { icon: Globe, color: 'bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-300' },
  { icon: Star, color: 'bg-rose-50 text-rose-600 border-rose-200 hover:border-rose-300' },
];

function getCatStyle(cat: Category, index: number) {
  if (categoryStyles[cat.slug]) return categoryStyles[cat.slug];
  return fallbackStyles[index % fallbackStyles.length];
}

export default function LatihanSoal() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Package[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModuleAlert, setShowModuleAlert] = useState(false);
  const [packagesLoaded, setPackagesLoaded] = useState(false);
  const [upgradePkg, setUpgradePkg] = useState<Package | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .finally(() => setIsLoadingCategories(false));
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setPackagesLoaded(false);
      return;
    }
    setIsLoading(true);
    setPackagesLoaded(false);
    const t = setTimeout(() => {
      fetchPackages({ search: search || undefined, category: selectedCategory, page })
        .then((res) => {
          setItems(res.items);
        })
        .finally(() => {
          setIsLoading(false);
          setPackagesLoaded(true);
          setShowModuleAlert(true);
        });
    }, 300);
    return () => clearTimeout(t);
  }, [selectedCategory, search, page]);

  const selectedCat = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Latihan Soal</h2>
        <p className="text-sm text-gray-500">
          {selectedCategory
            ? `Menampilkan paket latihan kategori ${selectedCat?.name}.`
            : 'Pilih kategori latihan untuk persiapan ujian kerja di Jepang.'}
        </p>
      </div>

    {/* =====================================================
    CATEGORY SELECTION
===================================================== */}

{!selectedCategory && (
  <>
    {isLoadingCategories ? (
      <LoadingState label="Memuat kategori..." />
    ) : categories.length === 0 ? (
      <EmptyState
        title="Belum ada kategori."
        description="Kategori latihan akan muncul di sini setelah admin menerbitkannya."
      />
    ) : (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {categories.map((cat, i) => {
          const style = getCatStyle(cat, i);
          const Icon = style.icon;

          return (
            <button
              key={cat.slug}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setSearch('');
                setPage(1);
              }}
              className="group flex items-center gap-4 rounded-md border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
            >
              {/* Icon */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-600 transition-colors group-hover:bg-gray-900 group-hover:text-white">
                <Icon size={20} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="truncate text-sm font-semibold text-gray-900">
                    {cat.name}
                  </h3>

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-gray-700"
                  >
                    <path
                      d="M9 18l6-6-6-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {cat.description && (
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                    {cat.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    )}
  </>
)}

      {/* Packages View */}
      {selectedCategory && (
        <>
          {/* Back button */}
          <button
            onClick={() => {
              setSelectedCategory(null);
              setItems([]);
              setSearch('');
              setShowModuleAlert(false);
              setPackagesLoaded(false);
            }}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Kembali ke Kategori
          </button>

          {/* Module reminder popup */}
          {showModuleAlert && createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowModuleAlert(false)} />
              <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-base font-semibold text-gray-900">Baca Modul Dulu</h3>
                <p className="mt-1.5 text-sm text-gray-500">Disarankan membaca materi sebelum memulai latihan soal.</p>
                <div className="mt-5 flex gap-2">
                  <Link to="/modul" className="flex-1" onClick={() => setShowModuleAlert(false)}>
                    <Button className="w-full gap-2" size="sm">
                      <BookOpen size={14} />
                      Akses Modul
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={() => setShowModuleAlert(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Sudah Baca
                  </Button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder={`Cari paket ${selectedCat?.name}...`}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Content */}
          {isLoading ? (
            <LoadingState label="Memuat paket latihan..." />
          ) : items.length === 0 ? (
            <EmptyState
              title="Belum ada paket latihan."
              description="Paket latihan akan muncul di sini setelah admin menerbitkannya."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((pkg) => (
                <LatihanCard key={pkg.id} pkg={pkg} onUpgrade={() => setUpgradePkg(pkg)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Upgrade popup */}
      {upgradePkg && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setUpgradePkg(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
            </div>
            <h3 className="text-center text-base font-semibold text-gray-900">Paket Soal Terkunci</h3>
            <p className="mt-2 text-center text-sm text-gray-500 leading-relaxed">
              Membuka paket ini hanya perlu <strong className="text-gray-700">sekali bayar</strong> dan semua akses terbuka untuk selamanya.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setUpgradePkg(null)}
                className="flex-1 rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
              >
                Nanti Saja
              </button>
              <button
                onClick={() => { navigate(`/payment/${upgradePkg.id}`); setUpgradePkg(null); }}
                className="flex-1 rounded-lg bg-[#5e8b5d] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4d7a4c]"
              >
                Upgrade Sekarang
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────── */
/*  Latihan Card                                        */
/* ──────────────────────────────────────────────────── */
function LatihanCard({ pkg, onUpgrade }: { pkg: Package; onUpgrade?: () => void }) {
  const isLocked = pkg.access_state === 'locked';
  const isCompleted = pkg.access_state === 'completed';
  const progress = pkg.progress ?? 0;

  const categoryColors: Record<string, string> = {
    'JFT-Basic': 'bg-brand-100 text-brand-700',
    SSW: 'bg-brand-100 text-brand-700',
  };

  return (
    <Card className={`group relative flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer overflow-hidden ${isLocked ? 'bg-gray-100 border-gray-300 hover:border-gray-400' : 'hover:border-gray-300'}`}>
      {/* Lock overlay for locked cards */}
      {isLocked && (
        <div className="absolute inset-0 z-10 bg-gray-900/5 pointer-events-none" />
      )}

      <div className="relative z-20 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          {pkg.category && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isLocked ? 'bg-gray-200 text-gray-500' : categoryColors[pkg.category] ?? 'bg-gray-100 text-gray-700'}`}>
              {pkg.category}
            </span>
          )}
          {isLocked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-500">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Terkunci
            </span>
          ) : pkg.is_premium ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-300">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
                <path d="M2 18h20v2H2v-2zm.6-11l4.1 3.2L12 6l5.3 4.2L21.4 7l-1.6 9H4.2L2.6 7z"/>
              </svg>
              Premium
            </span>
          ) : null}
        </div>

        <h3 className={`mt-2.5 font-semibold transition-colors ${isLocked ? 'text-gray-400' : 'text-gray-900 group-hover:text-[#5e8b5d]'}`}>{pkg.name}</h3>
        <p className={`mt-1 line-clamp-2 flex-1 text-sm ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>{pkg.description ?? 'Paket latihan soal.'}</p>

      {progress > 0 && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>
      )}

      {isCompleted && (
        <div className="mt-3">
          <Badge variant="success">
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Selesai
            </span>
          </Badge>
        </div>
      )}

      <div className="mt-4">
        {isLocked ? (
          <Button
            variant="outline"
            className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={(e) => { e.stopPropagation(); onUpgrade?.(); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Upgrade untuk Membuka
          </Button>
        ) : (
          <Link to={`/practice/${pkg.id}`}>
            <Button className="w-full" variant={isCompleted ? 'outline' : 'primary'}>
              {isCompleted ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Ulangi Latihan
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 6l9 6-9 6V6z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {progress > 0 ? 'Lanjutkan' : 'Mulai Latihan'}
                </>
              )}
            </Button>
          </Link>
        )}
      </div>
      </div>
    </Card>
  );
}
