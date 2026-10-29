import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { fetchDashboard } from '@/services/dashboard';
import { fetchCategories } from '@/services/packages';
import type { Category, DashboardData } from '@/types';
import { useAuth } from '@/stores/AuthContext';
import {
  ClipboardList,
  BookOpen,
  CalendarDays,
  Folder,
  Clock,
  CreditCard,
  Crown,
  User,
  ChevronRight,
  ArrowRight,
  Flame,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Helper                                                              */
/* ------------------------------------------------------------------ */

function formatToday(date = new Date()) {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
});

const statusBadge: Record<string, { variant: 'success' | 'warning'; label: string }> = {
  completed: { variant: 'success', label: 'Selesai' },
  in_progress: { variant: 'warning', label: 'Berlangsung' },
};

const quickMenus: Array<{ label: string; to: string; icon: LucideIcon }> = [
  { label: 'Latihan Soal', to: '/latihan-soal', icon: ClipboardList },
  { label: 'Latihan Kotoba', to: '/latihan-kotoba', icon: BookOpen },
  { label: 'Reservasi', to: '/reservasi', icon: CalendarDays },
  { label: 'Akses Modul', to: '/akses-modul', icon: Folder },
  { label: 'Riwayat Tes', to: '/history', icon: Clock },
  { label: 'Pembayaran', to: '/payments', icon: CreditCard },
  { label: 'Upgrade', to: '/subscription', icon: Crown },
  { label: 'Profil', to: '/profile', icon: User },
];

// Tombol berbentuk tautan (menghindari <a> yang membungkus <button>)
const linkButton =
  'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors';
const linkButtonOutline = `${linkButton} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`;
const linkButtonPrimary = `${linkButton} bg-brand-600 text-white hover:bg-brand-700`;

const brandGradient = 'bg-gradient-to-br from-[#025dd2] to-[#15a0f5] text-white';

/* ------------------------------------------------------------------ */
/* Kartu                                                               */
/* ------------------------------------------------------------------ */

function MasaBerlakuCard({ data }: { data: DashboardData }) {
  const items = data.masa_berlaku.items ?? [];
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length <= 1 || paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 4000);
    return () => clearInterval(t);
  }, [items.length, paused]);

  if (!data.masa_berlaku.is_active || items.length === 0) {
    return (
      <Card className={`flex items-center justify-between gap-3 p-5 ${brandGradient}`}>
        <div>
          <p className="text-xs font-medium text-white/80">Masa Berlaku</p>
          <p className="mt-1 text-base font-semibold md:text-lg">Belum aktif</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-white/80">Hari</p>
        </div>
      </Card>
    );
  }

  const item = items[idx % items.length];
  const isForever = item.days_left === null;
  const label = item.label ?? (isForever ? 'Selamanya' : 'Aktif');

  return (
    <Card
      className={`overflow-hidden p-0 ${brandGradient}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-white/80">Masa Berlaku</p>
          {item.category && <p className="mt-0.5 text-xs text-white/80">{item.category}</p>}
          <p className="mt-1 truncate text-base font-semibold md:text-lg">{item.package_name}</p>
          <p className="text-xs text-white/80">{label}</p>
          {item.expires_at && (
            <p className="mt-0.5 text-xs text-white/80">
              Berakhir{' '}
              {new Date(item.expires_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-4xl font-bold">{isForever ? '∞' : item.days_left}</p>
          <p className="text-xs text-white/80">Hari</p>
        </div>
      </div>

      {items.length > 1 && (
        <div className="flex justify-center pb-3">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Paket ${i + 1}`}
              aria-current={i === idx}
              className="flex h-5 w-5 items-center justify-center"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === idx ? 'bg-white' : 'bg-white/40'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

function UpgradeAccessCard({ categories }: { categories: Category[] }) {
  const premiumCats = categories.filter((c) => c.is_premium && c.is_active);
  if (premiumCats.length === 0) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-gray-900">Upgrade Akses</h3>
        <Link
          to="/subscription"
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          Lihat semua <ArrowRight size={12} />
        </Link>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Beli paket berbayar untuk membuka materi dan latihan lebih lengkap.
      </p>

      <div className="mt-4 space-y-3">
        {premiumCats.map((cat) => {
          const price = cat.price ?? 0;
          const isPopular = cat.is_popular === true;
          return (
            <div
              key={cat.id}
              className={`rounded-xl border p-4 ${
                isPopular ? 'border-brand-200 bg-brand-50' : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-gray-900">{cat.name}</p>
                    {isPopular && <Badge variant="brand">Paling populer</Badge>}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {cat.description ?? 'Paket pembelajaran premium'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-base font-bold text-gray-900">
                    {price === 0 ? 'Gratis' : rupiah.format(price)}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {cat.duration_days ? `/ ${cat.duration_days} hari` : 'sekali bayar'}
                  </p>
                </div>
              </div>
              <Link
                to="/subscription"
                className={`${linkButtonPrimary} mt-3 w-full gap-1 py-2 font-semibold`}
              >
                Pilih paket <ArrowRight size={12} />
              </Link>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ReferralCard({ data }: { data: DashboardData }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(data.referral.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard tidak tersedia (mis. bukan HTTPS); abaikan.
    }
  };

  return (
    <Card className="p-5">
      <p className="text-xs font-medium text-gray-500">Kode Referral Saya</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <p className="font-mono text-xl font-bold tracking-widest text-gray-900 md:text-2xl">
          {data.referral.code}
        </p>
        <Button size="sm" variant="outline" onClick={copyCode}>
          {copied ? 'Tersalin!' : 'Salin'}
        </Button>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Dipakai {data.referral.used_orders} order · Bonus {data.referral.bonus_days} hari
      </p>
    </Card>
  );
}

function StreakCard({ data }: { data: DashboardData }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Flame size={20} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Streak belajar</p>
          <p className="text-2xl font-bold text-gray-900">
            {data.streak.days} <span className="text-base font-medium text-gray-500">hari</span>
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Belajar minggu ini: {data.streak.weekly_minutes} menit
      </p>
    </Card>
  );
}

function WeakAreasCard({ data }: { data: DashboardData }) {
  return (
    <Card className="p-5">
      <h3 className="mb-4 font-semibold text-gray-900">Area yang Perlu Ditingkatkan (30 hari)</h3>
      {data.weak_areas.length === 0 ? (
        <EmptyState title="Belum ada data." description="Kerjakan beberapa tes dulu ya." />
      ) : (
        <div className="space-y-4">
          {data.weak_areas.map((w, i) => (
            <div key={`${w.section}-${i}`}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-gray-700">{w.section}</span>
                <span className="shrink-0 text-gray-500">
                  {w.accuracy}% · {w.total_answered} soal
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${w.accuracy < 50 ? 'bg-red-500' : 'bg-amber-400'}`}
                  style={{ width: `${Math.max(w.accuracy, 3)}%` }}
                />
              </div>
            </div>
          ))}
          <p className="pt-1 text-xs text-gray-400">
            Semakin rendah persentasenya, semakin perlu dilatih.
          </p>
        </div>
      )}
    </Card>
  );
}

function RecentTestsCard({ data }: { data: DashboardData }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  const total = data.recent_tests.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pagedTests = data.recent_tests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusOf = (status: string) => ({
    variant: statusBadge[status]?.variant ?? ('default' as const),
    label: statusBadge[status]?.label ?? status,
  });

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="font-semibold text-gray-900">Riwayat Tes Terakhir</h3>
        <Link to="/history" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Lihat semua
        </Link>
      </div>

      {total === 0 ? (
        <div className="px-5 pb-5">
          <EmptyState title="Belum ada riwayat tes." description="Mulai tes pertama Anda sekarang." />
        </div>
      ) : (
        <>
          {/* Mobile: daftar kartu */}
          <div className="divide-y divide-gray-100 border-t border-gray-100 md:hidden">
            {pagedTests.map((t) => {
              const s = statusOf(t.status);
              return (
                <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{t.package}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatTime(t.started_at)} · {t.percent !== null ? `${t.percent}%` : '-'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={s.variant}>{s.label}</Badge>
                    {t.status === 'completed' ? (
                      <Link to={`/results/${t.id}`} className={linkButtonOutline}>
                        Hasil
                      </Link>
                    ) : (
                      <Link to={`/quiz/${t.id}`} className={linkButtonPrimary}>
                        Lanjut
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: tabel */}
          <div className="hidden overflow-x-auto border-t border-gray-100 md:block">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-center font-semibold">#</th>
                  <th className="px-4 py-3 text-left font-semibold">Tes</th>
                  <th className="px-4 py-3 text-center font-semibold">Hasil</th>
                  <th className="px-4 py-3 text-center font-semibold">Persen</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Mulai</th>
                  <th className="px-4 py-3 text-center font-semibold">Selesai</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {pagedTests.map((t, i) => {
                  const s = statusOf(t.status);
                  return (
                    <tr key={t.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-4 py-3 text-center text-xs font-medium text-gray-400">
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </td>
                      <td className="max-w-[180px] px-4 py-3">
                        <span className="block truncate font-medium text-gray-900">{t.package}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-gray-700">
                        {t.result ?? '–'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center font-semibold text-gray-900">
                        {t.percent !== null ? `${t.percent}%` : '–'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-xs text-gray-500">
                        {formatTime(t.started_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-xs text-gray-500">
                        {formatTime(t.finished_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Link
                          to={t.status === 'completed' ? `/results/${t.id}` : `/quiz/${t.id}`}
                          className="text-sm font-medium text-brand-600 hover:text-brand-700"
                        >
                          {t.status === 'completed' ? 'Lihat hasil' : 'Lanjutkan'}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="border-t border-gray-100 px-5 py-4">
              <Pagination currentPage={page} lastPage={totalPages} onChange={setPage} />
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function Metric({
  label,
  value,
  unit,
  bar,
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  bar?: number;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm font-medium text-gray-400">{unit}</span>}
      </p>
      {bar !== undefined ? (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-brand-600"
            style={{ width: `${Math.min(Math.max(bar, 0), 100)}%` }}
          />
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-gray-400">{hint}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman                                                             */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(Array.isArray(res) ? res : []))
      .catch(() => {});
  }, []);

  if (isLoading) return <LoadingState label="Memuat dashboard..." />;
  if (!data) {
    return <EmptyState title="Gagal memuat dashboard" description="Silakan muat ulang halaman." />;
  }

  const name = user?.name ?? data.user.name;

  const statCards = [
    { label: 'Rata-rata 7 Hari', value: `${data.stats.average_score_7d}%` },
    { label: 'Tes Minggu Ini', value: data.stats.tests_this_week },
    { label: 'Akurasi 7 Hari', value: `${data.stats.accuracy_7d}%` },
  ];

  return (
    <div className="space-y-6">
      {/* Sapaan */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">
            こんにちは, {name} <span className="text-brand-600">さん</span>
          </h2>
          <p className="text-sm text-gray-500">
            Siap menaklukkan JFT/SSW hari ini? Ayo mulai latihan!
          </p>
        </div>
        <p className="inline-flex items-center gap-2 text-sm text-gray-500">
          <CalendarDays size={16} className="text-gray-400" />
          {formatToday()}
        </p>
      </div>

      {/*
        Satu layout untuk semua ukuran layar.
        - Mobile: satu kolom, urutan diatur dengan `order-*`.
        - Desktop (md+): kolom utama (2/3) + sidebar (1/3).
        Pembungkus `contents` membuat kartu di dalamnya ikut diurutkan di mobile.
      */}
      <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-6">
        {/* Kolom utama */}
        <div className="contents md:col-span-2 md:block md:space-y-6">
          {/* Ringkasan aktivitas (desktop saja; di mobile diganti 3 kartu statistik) */}
          <Card className="hidden p-6 md:block">
            <h3 className="font-semibold text-gray-900">Ringkasan Aktivitas</h3>
            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
              <Metric
                label="Rata-rata 7 Hari"
                value={`${data.stats.average_score_7d}%`}
                bar={data.stats.average_score_7d}
              />
              <Metric
                label="Akurasi 7 Hari"
                value={`${data.stats.accuracy_7d}%`}
                bar={data.stats.accuracy_7d}
              />
              <Metric
                label="Tes Minggu Ini"
                value={data.stats.tests_this_week}
                unit="tes"
                hint="Dalam 7 hari terakhir"
              />
              <Metric
                label="Waktu Belajar"
                value={data.streak.weekly_minutes}
                unit="mnt"
                hint="Total minggu ini"
              />
            </div>
          </Card>

          <div className="order-6">
            <WeakAreasCard data={data} />
          </div>

          <div className="order-9">
            <RecentTestsCard data={data} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="contents md:block md:space-y-6">
          <div className="order-1">
            <MasaBerlakuCard data={data} />
          </div>
          <div className="order-2 empty:hidden">
            <UpgradeAccessCard categories={categories} />
          </div>
          <div className="order-4">
            <ReferralCard data={data} />
          </div>
          <div className="order-7">
            <StreakCard data={data} />
          </div>
        </div>

        {/* Menu cepat (mobile saja) */}
        <Card className="order-3 p-4 md:hidden">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Menu Cepat</h3>
            <Link
              to="/practice"
              className="inline-flex items-center text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Lihat paket <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {quickMenus.map((m) => (
              <Link
                key={m.to}
                to={m.to}
                className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-center transition-colors hover:bg-gray-50"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <m.icon size={20} />
                </span>
                <span className="text-[11px] font-medium leading-tight text-gray-700">{m.label}</span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Statistik ringkas (mobile saja) */}
        <div className="order-5 grid grid-cols-3 gap-3 md:hidden">
          {statCards.map((s) => (
            <Card key={s.label} className="p-3 text-center">
              <p className="text-[11px] font-medium text-gray-500">{s.label}</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{s.value}</p>
            </Card>
          ))}
        </div>
      </div>

      <WhatsAppButton />
    </div>
  );
}