import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchProgress } from '@/services/progress';
import type { ProgressData } from '@/types';

export default function Progress() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProgress()
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Progress</h2>
        <p className="text-sm text-gray-500">Perkembangan kemampuan Anda berdasarkan kategori.</p>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Overall Progress</h3>
          <span className="text-2xl font-semibold text-brand-600">{data.overall}%</span>
        </div>
      </Card>

      {Object.keys(data.by_category).length === 0 ? (
        <EmptyState title="Belum ada data progress" description="Selesaikan latihan untuk melihat progres per kategori." />
      ) : (
        <Card>
          <h3 className="mb-4 font-semibold text-gray-900">By Category</h3>
          <div className="space-y-4">
            {Object.entries(data.by_category).map(([category, value]) => (
              <ProgressBar key={category} label={category} value={value} />
            ))}
          </div>
        </Card>
      )}

      {data.sections.length > 0 && (
        <Card className="p-0">
          <div className="divide-y divide-gray-100">
            {data.sections.map((s, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.section}</p>
                  <p className="text-xs text-gray-500">{s.package} &middot; {s.attempts_count}x percobaan</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{s.average_score}%</p>
                  <p className="text-xs text-gray-500">Terbaik: {s.best_score}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
