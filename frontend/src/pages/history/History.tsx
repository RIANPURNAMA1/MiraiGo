import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchHistory } from '@/services/history';
import type { QuizAttempt } from '@/types';

export default function History() {
  const [items, setItems] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    fetchHistory(page)
      .then((res) => {
        setItems(res.items);
        setLastPage(res.meta.last_page);
      })
      .finally(() => setIsLoading(false));
  }, [page]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Riwayat Latihan</h2>
        <p className="text-sm text-gray-500">Semua percobaan quiz yang sudah Anda selesaikan.</p>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState title="Belum ada riwayat" description="Selesaikan practice test pertama Anda untuk melihatnya di sini." />
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-gray-100">
            {items.map((attempt) => (
              <Link
                key={attempt.id}
                to={`/results/${attempt.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{attempt.package_name}</p>
                  <p className="text-xs text-gray-500">
                    {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString('id-ID') : '-'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={attempt.status === 'completed' ? 'success' : 'warning'}>{attempt.status}</Badge>
                  <span className="w-12 text-right text-sm font-semibold text-gray-900">{attempt.score ?? '-'}%</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <Pagination currentPage={page} lastPage={lastPage} onChange={setPage} />
    </div>
  );
}
