import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { PackageCard } from '@/components/package/PackageCard';
import { fetchPackages } from '@/services/packages';
import type { Package } from '@/types';

export default function Practice() {
  const [items, setItems] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      fetchPackages({ search: search || undefined, category: category || undefined, page })
        .then((res) => {
          setItems(res.items);
          setLastPage(res.meta.last_page);
        })
        .finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, category, page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Practice Tests</h2>
        <p className="text-sm text-gray-500">Pilih paket latihan JFT/SSW yang ingin Anda kerjakan.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Cari paket latihan..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="sm:w-56">
          <Select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua Kategori</option>
            <option value="JFT-Basic">JFT-Basic</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState title="No practice package found." description="Coba ubah kata kunci pencarian atau filter Anda." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
          <Pagination currentPage={page} lastPage={lastPage} onChange={setPage} />
        </>
      )}
    </div>
  );
}
