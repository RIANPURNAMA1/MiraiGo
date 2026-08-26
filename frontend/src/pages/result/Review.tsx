import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { fetchReview } from '@/services/attempts';
import type { QuizReviewItem } from '@/types';

export default function Review() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState<QuizReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    fetchReview(Number(attemptId))
      .then(setItems)
      .finally(() => setIsLoading(false));
  }, [attemptId]);

  if (isLoading) return <LoadingState />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Review Answers</h2>
        <Button variant="outline" onClick={() => navigate(-1)}>Kembali</Button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <Card key={item.question_id}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-gray-900">Question {index + 1}</p>
              <Badge variant={item.is_correct ? 'success' : 'error'}>
                {item.is_correct ? 'Correct' : 'Incorrect'}
              </Badge>
            </div>

            <p className="mt-2 text-sm text-gray-700">{item.question_text}</p>

            {item.image && <img src={item.image} alt="" className="mt-3 max-h-48 rounded-xl border border-gray-100" />}

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Your answer: </span>
                <span className={item.is_correct ? 'text-emerald-700' : 'text-red-700'}>
                  {item.your_answer ? `${item.your_answer.option}. ${item.your_answer.option_text}` : 'Tidak dijawab'}
                </span>
              </p>
              {!item.is_correct && item.correct_answer && (
                <p>
                  <span className="text-gray-500">Correct answer: </span>
                  <span className="text-emerald-700">
                    {item.correct_answer.option}. {item.correct_answer.option_text}
                  </span>
                </p>
              )}
            </div>

            {item.explanation && (
              <div className="mt-3 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                <span className="font-medium text-gray-700">Explanation: </span>
                {item.explanation}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
