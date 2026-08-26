import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import type { Package } from '@/types';

export function PackageCard({ pkg }: { pkg: Package }) {
  const isLocked = pkg.access_state === 'locked';
  const isCompleted = pkg.access_state === 'completed';

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-brand-600">{pkg.category}</p>
          <h3 className="mt-0.5 font-semibold text-gray-900">{pkg.name}</h3>
        </div>
        {pkg.is_premium && <Badge variant="brand">Premium</Badge>}
      </div>

      <p className="mt-2 line-clamp-2 flex-1 text-sm text-gray-500">{pkg.description}</p>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
        <span className="rounded-md bg-gray-50 px-2.5 py-1">Level {pkg.level}</span>
        <span className="rounded-md bg-gray-50 px-2.5 py-1">{pkg.duration_minutes} menit</span>
        {pkg.total_questions !== undefined && (
          <span className="rounded-md bg-gray-50 px-2.5 py-1">{pkg.total_questions} soal</span>
        )}
      </div>

      {typeof pkg.progress === 'number' && pkg.progress > 0 && (
        <div className="mt-3">
          <ProgressBar value={pkg.progress} />
        </div>
      )}

      <div className="mt-4">
        {isLocked ? (
          <div className="space-y-2">
            <Badge variant="warning">Locked</Badge>
            <Link to={`/practice/${pkg.id}`}>
              <Button variant="outline" className="w-full">Upgrade Access</Button>
            </Link>
          </div>
        ) : (
          <Link to={`/practice/${pkg.id}`}>
            <Button className="w-full" variant={isCompleted ? 'outline' : 'primary'}>
              {isCompleted ? 'Review / Practice Again' : pkg.progress ? 'Continue' : 'Start Test'}
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
