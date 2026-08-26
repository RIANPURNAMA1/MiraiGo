import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/services/api';
import { fetchAdminUsers, updateAdminUserStatus } from '@/services/admin';
import type { AdminUserItem } from '@/types';

export default function AdminUsers() {
  const { showToast } = useToast();
  const [items, setItems] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const load = useCallback(() => {
    setIsLoading(true);
    fetchAdminUsers({ search: search || undefined, page })
      .then((res) => {
        setItems(res.items);
        setLastPage(res.meta.last_page);
      })
      .finally(() => setIsLoading(false));
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function handleStatus(u: AdminUserItem) {
    const next: 'active' | 'suspended' = u.status === 'active' ? 'suspended' : 'active';
    try {
      await updateAdminUserStatus(u.id, next);
      showToast(`Status ${u.name} diubah.`, 'success');
      load();
    } catch (err) {
      showToast(getErrorMessage(err, 'Gagal mengubah status.'), 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Kelola Pengguna</h2>
        <p className="text-sm text-gray-500">Daftar pengguna siswa dan statusnya di platform.</p>
      </div>

      <div className="max-w-sm">
        <Input
          placeholder="Cari nama / email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6">
            <LoadingState />
          </div>
        ) : items.length === 0 ? (
          <div className="p-6">
            <EmptyState title="Belum ada pengguna." />
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
                    <th className="px-5 py-3 font-medium">Tes</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {items.map((u, i) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-400">{(page - 1) * 15 + i + 1}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="px-5 py-3 text-gray-700">{u.email}</td>
                      <td className="px-5 py-3 text-gray-700">{u.quiz_attempts_count ?? 0}</td>
                      <td className="px-5 py-3">
                        <Badge variant={u.status === 'active' ? 'success' : 'error'}>{u.status}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Button size="sm" variant="outline" onClick={() => handleStatus(u)}>
                          {u.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
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