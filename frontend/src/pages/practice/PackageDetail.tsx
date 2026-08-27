import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/components/ui/Toast';
import { fetchPackage } from '@/services/packages';
import { startAttempt } from '@/services/attempts';
import { getErrorMessage } from '@/services/api';
import type { Package } from '@/types';

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchPackage(id)
      .then(setPkg)
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleStart() {
    if (!pkg) return;
    setIsStarting(true);
    try {
      const { attempt } = await startAttempt(pkg.id);
      navigate(`/quiz/${attempt.id}`);
    } catch (err) {
      showToast(getErrorMessage(err, 'Gagal memulai quiz.'), 'error');
    } finally {
      setIsStarting(false);
    }
  }

  if (isLoading) return <LoadingState />;
  if (!pkg) return <EmptyState title="Paket tidak ditemukan" />;

  const isLocked = pkg.access_state === 'locked';
  const isCompleted = pkg.access_state === 'completed';

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-brand-600">{pkg.category}</p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">{pkg.name}</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">{pkg.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
              <span className="rounded-md bg-gray-50 px-2.5 py-1">Level {pkg.level}</span>
              <span className="rounded-md bg-gray-50 px-2.5 py-1">{pkg.duration_minutes} menit</span>
              <span className="rounded-md bg-gray-50 px-2.5 py-1">{pkg.total_questions ?? 0} soal</span>
              {pkg.is_premium && <Badge variant="brand">Premium</Badge>}
            </div>
          </div>
        </div>
      </Card>

      {isLocked ? (
        <Card>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900">Package Locked</h3>
            <p className="mt-1 text-sm text-gray-500">
              Paket ini adalah konten premium. Upgrade akses Anda untuk mulai berlatih.
            </p>
            <Button className="mt-4" onClick={() => showToast('Fitur upgrade akses akan segera hadir.', 'info')}>
              Upgrade Access
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <h3 className="mb-4 font-semibold text-gray-900">Sections</h3>
            <div className="space-y-4">
              {(pkg.sections ?? []).map((section) => (
                <div key={section.id} className="rounded-md border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{section.name}</p>
                    <span className="text-xs text-gray-500">{section.question_count} soal</span>
                  </div>
                  {typeof section.progress === 'number' && (
                    <div className="mt-2">
                      <ProgressBar value={section.progress} />
                    </div>
                  )}
                </div>
              ))}
              {(pkg.sections ?? []).length === 0 && (
                <Alert variant="info">Belum ada section untuk paket ini.</Alert>
              )}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleStart} isLoading={isStarting}>
              {isCompleted ? 'Practice Again' : 'Start Test'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
