import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { fetchPackages, fetchCategories } from '@/services/packages';
import type { Category, Package } from '@/types';
import { Crown, ArrowLeft, BookOpen, FileText, Headphones, Globe, Star } from 'lucide-react';

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
  const [showModuleAlert, setShowModuleAlert] = useState(true);
  const [lockedPkg, setLockedPkg] = useState<Package | null>(null);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .finally(() => setIsLoadingCategories(false));
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    setIsLoading(true);
    const t = setTimeout(() => {
      fetchPackages({ search: search || undefined, category: selectedCategory, page })
        .then((res) => {
          setItems(res.items);
        })
        .finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [selectedCategory, search, page]);

  const unlocked = items.filter((p) => p.access_state !== 'locked');
  const locked = items.filter((p) => p.access_state === 'locked');

  const stats = {
    total: items.length,
    unlocked: unlocked.length,
    locked: locked.length,
    totalQuestions: items.reduce((sum, p) => sum + (p.total_questions ?? 0), 0),
  };

  const selectedCat = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="space-y-6">
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
                setShowModuleAlert(true);
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

          {/* Stats banner */}
          {!isLoading && items.length > 0 && (
            <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-brand-100">Ringkasan Latihan</p>
                  <div className="mt-1.5 flex flex-wrap gap-3 text-sm">
                    <span className="font-semibold">{stats.total} Paket</span>
                    <span className="text-brand-200">·</span>
                    <span>{stats.totalQuestions} Soal</span>
                    <span className="text-brand-200">·</span>
                    <span>{stats.unlocked} Terbuka</span>
                    {stats.locked > 0 && (
                      <>
                        <span className="text-brand-200">·</span>
                        <span>{stats.locked} Terkunci</span>
                      </>
                    )}
                  </div>
                </div>
                {locked.length > 0 && (
                  <Link to={`/payment/${locked[0].id}`}>
                    <Button
                      size="lg"
                      variant="ghost"
                      className="!border-none !bg-amber-400 !text-black shadow-md hover:!bg-amber-300"
                    >
                      <Crown size={18} />
                      Upgrade
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
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
            <>
              {/* Unlocked packages */}
              {unlocked.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">Siap Dikerjakan</h3>
                    <Badge variant="success">{unlocked.length} paket</Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {unlocked.map((pkg) => (
                      <LatihanCard key={pkg.id} pkg={pkg} />
                    ))}
                  </div>
                </div>
              )}

              {/* Locked packages */}
              {locked.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">Perlu Upgrade</h3>
                    <Badge variant="warning">{locked.length} paket</Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {locked.map((pkg) => (
                      <LatihanCard key={pkg.id} pkg={pkg} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────── */
/*  Latihan Card                                        */
/* ──────────────────────────────────────────────────── */
function LatihanCard({ pkg }: { pkg: Package }) {
  const isLocked = pkg.access_state === 'locked';
  const isCompleted = pkg.access_state === 'completed';
  const progress = pkg.progress ?? 0;

  const categoryColors: Record<string, string> = {
    'JFT-Basic': 'bg-brand-100 text-brand-700',
    SSW: 'bg-brand-100 text-brand-700',
  };

  return (
    <Card className={`flex flex-col ${isLocked ? 'opacity-80' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        {pkg.category && (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[pkg.category] ?? 'bg-gray-100 text-gray-700'}`}>
            {pkg.category}
          </span>
        )}
        {pkg.is_premium && <Badge variant="brand">Premium</Badge>}
      </div>

      <h3 className="mt-2.5 font-semibold text-gray-900">{pkg.name}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-gray-500">{pkg.description ?? 'Paket latihan soal.'}</p>

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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" strokeLinecap="round" />
          </svg>
          {pkg.duration_minutes} mnt
        </span>
        {pkg.total_questions != null && (
          <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {pkg.total_questions} soal
          </span>
        )}
        {pkg.sections && pkg.sections.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
            {pkg.sections.length} section
          </span>
        )}
      </div>

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
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Butuh langganan
            </div>
            <Link to={`/payment/${pkg.id}`}>
              <Button variant="outline" className="w-full">
                Upgrade untuk Membuka
              </Button>
            </Link>
          </div>
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
    </Card>
  );
}
