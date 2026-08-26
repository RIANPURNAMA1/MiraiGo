import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { fetchDashboard } from '@/services/dashboard';
import type { DashboardData } from '@/types';
import { useAuth } from '@/stores/AuthContext';

function formatDateEn(date = new Date()) {
  return date.toLocaleDateString('en-GB', {
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

const statusBadge: Record<string, { variant: 'success' | 'warning'; label: string }> = {
  completed: { variant: 'success', label: 'Selesai' },
  in_progress: { variant: 'warning', label: 'Berlangsung' },
};

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
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Halo, {name} <span className="text-brand-600">さん</span>
        </h2>
        <p className="text-sm text-gray-500">Siap menaklukkan JFT/SSW hari ini? Ayo mulai latihan!</p>
      </div>

      {/* Masa Berlaku + Referral */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="flex items-center justify-between bg-gradient-to-br from-brand-600 to-brand-700 text-white">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-100">Masa Berlaku</p>
            <p className="mt-1 text-lg font-semibold">{data.masa_berlaku.label}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{data.masa_berlaku.days_left ?? '∞'}</p>
            <p className="text-xs text-brand-100">Hari</p>
          </div>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-400">Kode Referral Saya</p>
          <div className="mt-1 flex items-center gap-3">
            <p className="font-mono text-2xl font-bold tracking-widest text-gray-900">{data.referral.code}</p>
            <Button size="sm" variant="outline" onClick={copyCode}>
              {copied ? 'Tersalin!' : 'Salin'}
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Dipakai: {data.referral.used_orders} order • Bonus: {data.referral.bonus_days} hari
          </p>
        </Card>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label} className="text-center">
            <p className="text-xs font-medium text-gray-500">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Area lemah + Streak/Tanggal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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

        <div className="space-y-6">
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
      </div>

      {/* Riwayat Tes Terakhir */}
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Tes</th>
                  <th className="px-5 py-3 font-medium">Hasil</th>
                  <th className="px-5 py-3 font-medium">Persen</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Mulai</th>
                  <th className="px-5 py-3 font-medium">Selesai</th>
                  <th className="px-5 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {data.recent_tests.map((t, i) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{t.package}</td>
                    <td className="px-5 py-3 text-gray-700">{t.result ?? '-'}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">
                      {t.percent !== null ? `${t.percent}%` : '-'}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={statusBadge[t.status]?.variant ?? 'default'}>
                        {statusBadge[t.status]?.label ?? t.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatTime(t.started_at)}</td>
                    <td className="px-5 py-3 text-gray-500">{formatTime(t.finished_at)}</td>
                    <td className="px-5 py-3">
                      {t.status === 'completed' ? (
                        <Link to={`/results/${t.id}`}>
                          <Button size="sm" variant="outline">
                            Lihat Hasil
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/quiz/${t.id}`}>
                          <Button size="sm">Lanjutkan</Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <WhatsAppButton />
    </div>
  );
}
