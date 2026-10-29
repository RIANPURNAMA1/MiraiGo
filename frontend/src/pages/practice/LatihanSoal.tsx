import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { fetchPackages, fetchCategories } from "@/services/packages";
import type { Category, Package } from "@/types";
import { getCategoryIcon } from "@/constants/categoryIcons";
import {
  ArrowLeft,
  ArrowRight,
  Package as PackageIcon,
  BookOpen,
  FileText,
  Headphones,
  Globe,
  Star,
  Lock,
  Play,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

const categoryStyles: Record<string, { icon: typeof BookOpen; color: string }> =
  {
    "JFT-Basic": {
      icon: BookOpen,
      color:
        "bg-brand-50 text-brand-600 border-brand-200 hover:border-brand-300",
    },
    SSW: {
      icon: FileText,
      color:
        "bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-300",
    },
  };

const fallbackStyles = [
  {
    icon: Headphones,
    color:
      "bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-300",
  },
  {
    icon: Globe,
    color:
      "bg-[#eaf6ff] text-[#18a6fc] border-[#bfe2fc] hover:border-[#8fd3fb]",
  },
  {
    icon: Star,
    color: "bg-rose-50 text-rose-600 border-rose-200 hover:border-rose-300",
  },
];

function getCatStyle(cat: Category, index: number) {
  let style = categoryStyles[cat.slug];
  if (!style) style = fallbackStyles[index % fallbackStyles.length];

  // Use the admin-chosen icon when one is set; otherwise keep the default.
  if (cat.icon) {
    return { icon: getCategoryIcon(cat.icon), color: style.color };
  }

  return style;
}

const PAGE_SIZE = 15;

export default function LatihanSoal() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Package[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [catCounts, setCatCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [packagesLoaded, setPackagesLoaded] = useState(false);
  const [upgradePkg, setUpgradePkg] = useState<Package | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .finally(() => setIsLoadingCategories(false));
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    categories.forEach((cat) => {
      if (catCounts[cat.slug] === undefined) {
        fetchPackages({ category: cat.slug, page: 1, per_page: 1 })
          .then((res) =>
            setCatCounts((prev) => ({ ...prev, [cat.slug]: res.meta.total ?? 0 })),
          )
          .catch(() => {});
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  useEffect(() => {
    if (!selectedCategory) {
      setPackagesLoaded(false);
      setLastPage(1);
      return;
    }
    setIsLoading(true);
    setPackagesLoaded(false);
    const t = setTimeout(() => {
      fetchPackages({
        search: search || undefined,
        category: selectedCategory,
        page,
        per_page: PAGE_SIZE,
      })
        .then((res) => {
          setItems(res.items);
          setLastPage(res.meta.last_page ?? 1);
        })
        .finally(() => {
          setIsLoading(false);
          setPackagesLoaded(true);
        });
    }, 300);
    return () => clearTimeout(t);
  }, [selectedCategory, search, page]);

  const selectedCat = categories.find((c) => c.slug === selectedCategory);
  const visibleItems = items;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Latihan Soal</h2>
        <p className="text-sm text-gray-500">
          {selectedCategory
            ? `Menampilkan paket latihan kategori ${selectedCat?.name}.`
            : "Pilih kategori latihan untuk persiapan ujian kerja di Jepang."}
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
                      if (cat.is_premium && !cat.has_access) {
                        navigate("/subscription");
                        return;
                      }
                      setSelectedCategory(cat.slug);
                      setSearch("");
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
                        <div className="flex min-w-0 items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-gray-900">
                            {cat.name}
                          </h3>
                          {cat.is_premium &&
                            (cat.has_access ? (
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

                      <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                        <PackageIcon size={12} />
                        {catCounts[cat.slug] ?? 0} paket latihan
                      </div>
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
              setSearch("");
              setPackagesLoaded(false);
            }}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Kembali ke Kategori
          </button>

          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder={`Cari paket ${selectedCat?.name}...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
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
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 lg:gap-4">
                {visibleItems.map((pkg) => (
                  <LatihanCard
                    key={pkg.id}
                    pkg={pkg}
                    onUpgrade={() => setUpgradePkg(pkg)}
                  />
                ))}
              </div>
              <Pagination
                currentPage={page}
                lastPage={lastPage}
                onChange={setPage}
              />
            </>
          )}
        </>
      )}

      {/* Upgrade popup */}
      {upgradePkg &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setUpgradePkg(null)}
            />
            <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-center text-base font-semibold text-gray-900">
                Paket Soal Terkunci
              </h3>
              <p className="mt-2 text-center text-sm text-gray-500 leading-relaxed">
                Membuka paket ini hanya perlu{" "}
                <strong className="text-gray-700">sekali bayar</strong> dan
                semua akses terbuka untuk selamanya.
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setUpgradePkg(null)}
                  className="flex-1 rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Nanti Saja
                </button>
                <button
                  onClick={() => {
                    navigate(`/payment/${upgradePkg.id}`);
                    setUpgradePkg(null);
                  }}
                  className="flex-1 rounded-lg bg-[#5e8b5d] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4d7a4c]"
                >
                  Upgrade Sekarang
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function LatihanCard({
  pkg,
  onUpgrade,
}: {
  pkg: Package;
  onUpgrade?: () => void;
}) {
  const isLocked = pkg.access_state === "locked";
  const isCompleted = pkg.access_state === "completed";
  const progress = pkg.progress ?? 0;
  const displayProgress = isCompleted ? 100 : progress;

  const pkgStyle = isLocked
    ? { icon: BookOpen, color: "bg-gray-100 text-gray-500" }
    : pkg.category === "SSW"
      ? { icon: FileText, color: "bg-amber-50 text-amber-600" }
      : { icon: BookOpen, color: "bg-brand-50 text-brand-600" };
  const CatIcon = pkgStyle.icon;

  return (
    <div
      className={`group relative flex h-full flex-col rounded-xl border bg-white p-4 transition-all duration-200 ${isLocked ? "border-gray-200" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${pkgStyle.color}`}>
            <CatIcon size={13} />
          </div>
          <div className="min-w-0">
            <h4 className="break-words text-sm font-semibold leading-snug text-gray-900">
              {pkg.name}
            </h4>
            {pkg.level && (
              <span className="mt-0.5 block text-[11px] text-gray-400">Level {pkg.level}</span>
            )}
          </div>
        </div>

        {/* Status */}
{pkg.is_premium && (
          <span className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
            Premium
          </span>
        )}
      </div>

      {/* Description */}
      {pkg.description && (
        <p className="mt-2.5 line-clamp-2 text-xs leading-5 text-gray-500">{pkg.description}</p>
      )}

      {/* Progress */}
      <div className="mt-3 border-t border-gray-100 pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-lg font-bold tracking-tight text-gray-900">
            {isLocked ? "-" : `${displayProgress}%`}
          </span>
          <span className="text-[11px] text-gray-400">
            {isLocked
              ? "terkunci"
              : displayProgress > 0 || isCompleted
                ? "selesai"
                : "belum mulai"}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${isCompleted ? "bg-emerald-500" : "bg-brand-600"}`}
            style={{ width: `${Math.min(Math.max(displayProgress, 0), 100)}%` }}
          />
        </div>
      </div>

      {/* Action */}
      <div className="mt-3">
        {isLocked ? (
          <Button
            size="sm"
            className="w-full gap-1.5 bg-amber-400 text-gray-900 hover:bg-amber-300"
            onClick={(e) => {
              e.stopPropagation();
              onUpgrade?.();
            }}
          >
            <Lock size={13} />
            Upgrade
          </Button>
        ) : isCompleted ? (
          <Link to={`/practice/${pkg.id}`} className="block">
            <Button size="sm" variant="outline" className="w-full gap-1.5">
              <RotateCcw size={13} />
              Ulangi Latihan
            </Button>
          </Link>
        ) : (
          <Link to={`/practice/${pkg.id}`} className="block">
            <Button size="sm" className="w-full gap-1.5">
              <Play size={13} />
              {progress > 0 ? "Lanjutkan" : "Mulai Latihan"}
            </Button>
          </Link>
        )}
      </div>

      {/* Lock overlay for locked cards */}
      {isLocked && <div className="pointer-events-none absolute inset-0 z-10 bg-gray-900/5" />}
    </div>
  );
}