import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { fetchAdminSubscribers } from '@/services/admin';
import type { AdminSubscriberItem } from '@/types';

export default function AdminSubscribers() {
  const [items, setItems] = useState<AdminSubscriberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const load = useCallback(() => {
    setIsLoading(true);
    fetchAdminSubscribers({
      search: search || undefined,
      status: status || undefined,
      page,
    })
      .then((res) => {
        setItems(res.items);
        setLastPage(res.meta.last_page);
      })
      .finally(() => setIsLoading(false));
  }, [search, status, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  function fmtDate(d: string | null) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Langganan Pengguna</h2>
        <p className="text-sm text-gray-500">Daftar pengguna yang memiliki akses langganan paket.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="Cari nama / email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-44">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="expired">Kadaluarsa</option>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6">
            <LoadingState />
          </div>
        ) : items.length === 0 ? (
          <div className="p-6">
            <EmptyState title="Belum ada langganan." />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">#</th>
                    <th className="px-5 py-3 font-medium">Nama</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Paket</th>
                    <th className="px-5 py-3 font-medium">Harga</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Mulai</th>
                    <th className="px-5 py-3 font-medium">Kadaluarsa</th>
                    <th className="px-5 py-3 font-medium">Sisa Hari</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {items.map((s, i) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-400">{(page - 1) * 15 + i + 1}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">{s.user?.name ?? '-'}</td>
                      <td className="px-5 py-3 text-gray-700">{s.user?.email ?? '-'}</td>
                      <td className="px-5 py-3 text-gray-700">{s.package?.name ?? '-'}</td>
                      <td className="px-5 py-3 text-gray-700">
                        {s.package?.price != null
                          ? `Rp ${s.package.price.toLocaleString('id-ID')}`
                          : '-'}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={s.status === 'active' ? 'success' : 'error'}>
                          {s.status === 'active' ? 'Aktif' : 'Kadaluarsa'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{fmtDate(s.started_at)}</td>
                      <td className="px-5 py-3 text-gray-700">{fmtDate(s.expires_at)}</td>
                      <td className="px-5 py-3 text-gray-700">
                        {s.days_left != null ? `${s.days_left} hari` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 px-5 py-3">
              <Pagination currentPage={page} lastPage={lastPage} onChange={setPage} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
