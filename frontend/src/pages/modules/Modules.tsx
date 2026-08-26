import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { fetchModules } from '@/services/modules';
import type { LearningModule } from '@/types';

export default function Modules() {
  const [items, setItems] = useState<LearningModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    fetchModules(page)
      .then((res) => {
        setItems(res.items);
        setLastPage(res.meta.last_page);
      })
      .finally(() => setIsLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Learning Modules</h2>
        <p className="text-sm text-gray-500">Materi belajar pendukung untuk latihan JFT/SSW Anda.</p>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState title="Belum ada modul tersedia" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => (
              <Card key={m.id}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{m.title}</h3>
                  {m.is_premium && <Badge variant="brand">Premium</Badge>}
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-gray-500">{m.description}</p>
                {(m.file_url || m.external_url) && (
                  <a
                    href={m.file_url ?? m.external_url ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
                  >
                    Buka Modul →
                  </a>
                )}
              </Card>
            ))}
          </div>
          <Pagination currentPage={page} lastPage={lastPage} onChange={setPage} />
        </>
      )}
    </div>
  );
}
