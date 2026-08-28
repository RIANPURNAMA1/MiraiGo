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
import type { DashboardData } from '@/types';
import { useAuth } from '@/stores/AuthContext';
import { ClipboardList, BookOpen, CalendarDays, Folder, Clock, CreditCard, Crown, User, ChevronRight, Flame } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

function formatDateEn(date = new Date()) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateShort(date = new Date()) {
  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
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

function MasaBerlakuCard({ data }: { data: DashboardData }) {
  return (
    <Card className="flex items-center justify-between gap-3 bg-gradient-to-br from-[#025dd2] to-[#15a0f5] text-white">
      <div>
        <p className="text-xs uppercase tracking-wide text-brand-100">Masa Berlaku</p>
        <p className="mt-1 text-base font-semibold md:text-lg">{data.masa_berlaku.label}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-3xl font-bold">{data.masa_berlaku.days_left ?? '∞'}</p>
        <p className="text-xs text-brand-100">Hari</p>
      </div>
    </Card>
  );
}

function ReferralCard({ data, copied, onCopy }: { data: DashboardData; copied: boolean; onCopy: () => void }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-gray-400">Kode Referral Saya</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <p className="font-mono text-xl font-bold tracking-widest text-gray-900 md:text-2xl">{data.referral.code}</p>
        <Button size="sm" variant="outline" onClick={onCopy}>
          {copied ? 'Tersalin!' : 'Salin'}
        </Button>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Dipakai: {data.referral.used_orders} order • Bonus: {data.referral.bonus_days} hari
      </p>
    </Card>
  );
}

function WeakAreasCard({ data }: { data: DashboardData }) {
  return (
    <Card>
      <h3 className="mb-4 font-semibold text-gray-900">Area yang Perlu Ditingkatkan (30 hari)</h3>
      {data.weak_areas.length === 0 ? (
        <EmptyState title="Belum ada data." description="Kerjakan beberapa tes dulu ya." />
      ) : (
        <div className="space-y-4">
          {data.weak_areas.map((w, i) => (
            <div key={`${w.section}-${i}`}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{w.section}</span>
                <span className="text-gray-500">
                  {w.accuracy}% • {w.total_answered} soal
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${w.accuracy < 50 ? 'bg-red-500' : 'bg-amber-400'}`}
                  style={{ width: `${Math.max(w.accuracy, 3)}%` }}
                />
              </div>
            </div>
          ))}
          <p className="pt-2 text-xs text-gray-400">Semakin rendah persentasenya, semakin perlu dilatih.</p>
        </div>
      )}
    </Card>
  );
}

function RecentTestsCard({ data }: { data: DashboardData }) {
  const [historyPage, setHistoryPage] = useState(1);
  const PAGE_SIZE = 5;
  const historyTotalPages = Math.ceil(data.recent_tests.length / PAGE_SIZE);
  const pagedTests = data.recent_tests.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE);

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="font-semibold text-gray-900">Riwayat Tes Terakhir</h3>
        <Link to="/history" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Lihat Semua
        </Link>
      </div>
      {data.recent_tests.length === 0 ? (
        <div className="px-5 pb-5">
          <EmptyState title="Belum ada riwayat tes." description="Mulai tes pertama Anda sekarang." />
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="divide-y divide-gray-50 md:hidden">
            {pagedTests.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{t.package}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatTime(t.started_at)} • {t.percent !== null ? `${t.percent}%` : '-'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={statusBadge[t.status]?.variant ?? 'default'}>
                    {statusBadge[t.status]?.label ?? t.status}
                  </Badge>
                  {t.status === 'completed' ? (
                    <Link to={`/results/${t.id}`}>
                      <Button size="sm" variant="outline">
                        Hasil
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/quiz/${t.id}`}>
                      <Button size="sm">Lanjut</Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: full table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
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
              <tbody className="divide-y divide-gray-50 text-sm">
                {pagedTests.map((t, i) => (
                  <tr key={t.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3 text-center text-xs font-medium text-gray-400">{(historyPage - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="max-w-[180px] px-4 py-3">
                      <span className="block truncate font-medium text-gray-900">{t.package}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-gray-700">{t.result ?? '–'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-center font-semibold text-gray-900">
                      {t.percent !== null ? `${t.percent}%` : '–'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge variant={statusBadge[t.status]?.variant ?? 'default'}>
                        {statusBadge[t.status]?.label ?? t.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-xs text-gray-500">{formatTime(t.started_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-xs text-gray-500">{formatTime(t.finished_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {t.status === 'completed' ? (
                        <Link to={`/results/${t.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                          Lihat Hasil
                        </Link>
                      ) : (
                        <Link to={`/quiz/${t.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                          Lanjutkan
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {data.recent_tests.length > 0 && (
        <div className="px-5 pb-4">
          <Pagination currentPage={historyPage} lastPage={historyTotalPages} onChange={setHistoryPage} />
        </div>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState label="Memuat dashboard..." />;
  if (!data) return <EmptyState title="Gagal memuat dashboard" description="Silakan muat ulang halaman." />;

  const name = user?.name ?? data.user.name;

  const statCards = [
    { label: 'Rata-rata 7 Hari', value: `${data.stats.average_score_7d}%` },
    { label: 'Tes Minggu Ini', value: data.stats.tests_this_week },
    { label: 'Akurasi 7 Hari', value: `${data.stats.accuracy_7d}%` },
  ];

  const copyCode = async () => {
    await navigator.clipboard.writeText(data.referral.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">
            こんにちは, {name} <span className="text-brand-600">さん</span>
          </h2>
          <p className="text-sm text-gray-500">Siap menaklukkan JFT/SSW hari ini? Ayo mulai latihan!</p>
        </div>
      </div>

      {/* ================= MOBILE LAYOUT ================= */}
      <div className="space-y-4 md:hidden">
        <MasaBerlakuCard data={data} />

        {/* Menu Cepat */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Menu Cepat</h3>
            <Link to="/practice" className="inline-flex items-center text-xs font-medium text-brand-600 hover:text-brand-700">
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

        <ReferralCard data={data} copied={copied} onCopy={copyCode} />

        {/* Statistik */}
        <div className="grid grid-cols-3 gap-3">
          {statCards.map((s) => (
            <Card key={s.label} className="p-3 text-center">
              <p className="text-[10px] font-medium text-gray-500">{s.label}</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{s.value}</p>
            </Card>
          ))}
        </div>

        <WeakAreasCard data={data} />

        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-gray-900">Streak</h3>
            <p className="mt-2 text-3xl font-bold text-brand-600">
              {data.streak.days} <span className="text-base font-medium text-gray-600">hari</span>
            </p>
            <p className="mt-2 text-xs text-gray-500">Belajar minggu ini: {data.streak.weekly_minutes} menit</p>
          </Card>

          <Card className="bg-gray-900 text-white">
            <p className="text-xs uppercase tracking-wide text-gray-400">Hari Ini</p>
            <p className="mt-2 text-lg font-semibold">{formatDateEn()}</p>
          </Card>
        </div>

        <RecentTestsCard data={data} />
      </div>

      {/* ================= DESKTOP LAYOUT ================= */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-6">
        {/* Main column */}
        <div className="space-y-6 md:col-span-2">
          {/* Ringkasan Aktivitas */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-900">Ringkasan Aktivitas</h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">
                <Flame size={13} />
                Streak {data.streak.days} hari
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Rata-rata 7 Hari</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{data.stats.average_score_7d}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.min(data.stats.average_score_7d, 100)}%` }} />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">Akurasi 7 Hari</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{data.stats.accuracy_7d}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(data.stats.accuracy_7d, 100)}%` }} />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">Tes Minggu Ini</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{data.stats.tests_this_week}</span>
                  <span className="text-sm font-medium text-gray-400">tes</span>
                </div>
                <p className="mt-2 text-[11px] text-gray-400">Dalam 7 hari terakhir</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">Waktu Belajar</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{data.streak.weekly_minutes}</span>
                  <span className="text-sm font-medium text-gray-400">mnt</span>
                </div>
                <p className="mt-2 text-[11px] text-gray-400">Total minggu ini</p>
              </div>
            </div>
          </Card>

          <WeakAreasCard data={data} />

          <RecentTestsCard data={data} />
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-[#025dd2] to-[#15a0f5] text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-brand-100">Masa Berlaku</p>
                <p className="mt-1 text-lg font-semibold">{data.masa_berlaku.label}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{data.masa_berlaku.days_left ?? '∞'}</p>
                <p className="text-xs text-brand-100">Hari</p>
              </div>
            </div>
            <div className="mt-4 border-t border-white/15 pt-4">
              <p className="text-xs text-brand-100">Hari ini</p>
              <p className="mt-1 font-medium text-white">{formatDateShort()}</p>
            </div>
          </Card>

          <ReferralCard data={data} copied={copied} onCopy={copyCode} />

          <Card>
            <h3 className="font-semibold text-gray-900">Streak</h3>
            <p className="mt-2 text-3xl font-bold text-brand-600">
              {data.streak.days} <span className="text-base font-medium text-gray-600">hari</span>
            </p>
            <p className="mt-2 text-xs text-gray-500">Belajar minggu ini: {data.streak.weekly_minutes} menit</p>
          </Card>
        </div>
      </div>

      <WhatsAppButton />
    </div>
  );
}