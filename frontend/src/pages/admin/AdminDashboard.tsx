import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchAdminDashboard } from '@/services/admin';
import type { AdminDashboardData } from '@/types';

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const DAYS = 7;

function buildDailySeries(attempts: AdminDashboardData['recent_attempts']) {
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (DAYS - 1 - i));
    return d;
  });
  const counts = days.map((day) => {
    const key = day.toDateString();
    return attempts.filter((a) => {
      if (!a.submitted_at) return false;
      return new Date(a.submitted_at).toDateString() === key;
    }).length;
  });
  const max = Math.max(...counts, 1);
  return { days, counts, max };
}

function ChartBar({ data }: { data: AdminDashboardData }) {
  const { days, counts, max } = buildDailySeries(data.recent_attempts);
  const barArea = 104;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Aktivitas Tes 7 Hari Terakhir</h3>
        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
          {data.recent_attempts.length} tes total
        </span>
      </div>
      <div className="mt-4 flex items-end gap-2">
        {days.map((day, i) => (
          <div key={day.toISOString()} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-600">{counts[i]}</span>
            <div
              className="w-full max-w-[30px] rounded-t-md bg-gradient-to-t from-[#025dd2] to-[#15a0f5] transition-all"
              style={{ height: `${(counts[i] / max) * barArea}px` }}
            />
            <span className="text-[10px] text-gray-400">
              {day.toLocaleDateString('id-ID', { weekday: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

const metricBars = [
  { key: 'Pengguna', extract: (d: AdminDashboardData) => d.total_users },
  { key: 'Soal', extract: (d: AdminDashboardData) => d.total_questions },
  { key: 'Mengerjakan', extract: (d: AdminDashboardData) => d.total_attempts },
  { key: 'Transaksi Paid', extract: (d: AdminDashboardData) => d.transactions },
  { key: 'Reservasi', extract: (d: AdminDashboardData) => d.reservations },
];

function MetricChart({ data }: { data: AdminDashboardData }) {
  const items = metricBars.map((m) => ({ key: m.key, value: m.extract(data) }));
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <Card>
      <h3 className="font-semibold text-gray-900">Kinerja Platform</h3>
      <p className="mt-0.5 text-xs text-gray-400">Perbandingan metrik utama platform.</p>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-gray-600">{item.key}</span>
              <span className="font-semibold text-gray-900">{item.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#025dd2] to-[#15a0f5]"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-gray-600">Rata-rata Skor</span>
            <span className="font-semibold text-gray-900">{data.average_score}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              style={{ width: `${Math.min(data.average_score, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboard()
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState label="Memuat dashboard admin..." />;
  if (!data) return <EmptyState title="Gagal memuat dashboard admin" />;

  const statCards = [
    { label: 'Total Pengguna', value: data.total_users, tone: 'text-brand-600' },
    { label: 'Pengguna Aktif', value: data.active_users, tone: 'text-emerald-600' },
    { label: 'Total Paket', value: data.total_packages, tone: 'text-indigo-600' },
    { label: 'Total Soal', value: data.total_questions, tone: 'text-amber-600' },
    { label: 'Total Mengerjakan', value: data.total_attempts, tone: 'text-gray-900' },
    { label: 'Rata-rata Skor', value: `${data.average_score}%`, tone: 'text-gray-900' },
    { label: 'Transaksi Paid', value: data.transactions, tone: 'text-emerald-600' },
    { label: 'Reservasi', value: data.reservations, tone: 'text-blue-600' },
  ];

  const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
    completed: 'success',
    in_progress: 'warning',
    expired: 'error',
    abandoned: 'default',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard Admin</h2>
        <p className="text-sm text-gray-500">Ringkasan aktivitas platform MiraiGo.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <p className="text-xs uppercase tracking-wide text-gray-400">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold ${s.tone}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartBar data={data} />
        <MetricChart data={data} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="px-5 py-4">
          <h3 className="font-semibold text-gray-900">Aktivitas Tes Terbaru</h3>
        </div>
        {data.recent_attempts.length === 0 ? (
          <div className="px-5 pb-5">
            <EmptyState title="Belum ada aktivitas tes." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Pengguna</th>
                  <th className="px-5 py-3 font-medium">Paket</th>
                  <th className="px-5 py-3 font-medium">Skor</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Dikerjakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {data.recent_attempts.map((a, i) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{a.user?.name ?? '-'}</td>
                    <td className="px-5 py-3 text-gray-700">{a.package?.name ?? '-'}</td>
                    <td className="px-5 py-3 text-gray-700">{a.score !== null ? `${Math.round(a.score)}%` : '-'}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariant[a.status] ?? 'default'}>{a.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(a.submitted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}