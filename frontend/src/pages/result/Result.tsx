import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { fetchResult } from '@/services/attempts';
import type { QuizAttempt } from '@/types';

function ScoreCircle({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626';

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={radius} stroke="#f3f4f6" strokeWidth="12" fill="none" />
      <circle
        cx="70"
        cy="70"
        r={radius}
        stroke={color}
        strokeWidth="12"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="76" textAnchor="middle" fontSize="28" fontWeight="700" fill="#111827">
        {score}%
      </text>
    </svg>
  );
}

export default function Result() {
  const { attemptId } = useParams();
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    fetchResult(Number(attemptId))
      .then(setResult)
      .finally(() => setIsLoading(false));
  }, [attemptId]);

  if (isLoading) return <LoadingState />;
  if (!result) return null;

  const durationMinutes = result.submitted_at
    ? Math.round((new Date(result.submitted_at).getTime() - new Date(result.started_at).getTime()) / 60000)
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="text-center">
        <p className="text-sm font-medium text-gray-500">Test Completed</p>
        <div className="my-4 flex justify-center">
          <ScoreCircle score={result.score ?? 0} />
        </div>
        <p className="text-sm text-gray-500">{result.package_name}</p>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-semibold text-emerald-600">{result.correct_answers}</p>
          <p className="mt-1 text-xs text-gray-500">Correct</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-red-600">{result.wrong_answers}</p>
          <p className="mt-1 text-xs text-gray-500">Wrong</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-gray-500">{result.unanswered}</p>
          <p className="mt-1 text-xs text-gray-500">Unanswered</p>
        </Card>
      </div>

      {durationMinutes !== null && (
        <p className="text-center text-sm text-gray-500">Duration: {durationMinutes} menit</p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to={`/results/${result.id}/review`} className="flex-1">
          <Button variant="outline" className="w-full">Review Answers</Button>
        </Link>
        <Link to={`/practice/${result.package_id}`} className="flex-1">
          <Button variant="outline" className="w-full">Practice Again</Button>
        </Link>
        <Link to="/dashboard" className="flex-1">
          <Button className="w-full">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
