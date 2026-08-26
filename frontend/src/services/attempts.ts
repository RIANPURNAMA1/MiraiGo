import { api } from './api';
import type { ApiSuccess, Question, QuizAttempt, QuizReviewItem } from '@/types';

export async function startAttempt(packageId: number) {
  const res = await api.post<ApiSuccess<{ attempt: QuizAttempt; questions: Question[] }>>('/attempts', {
    package_id: packageId,
  });
  return res.data.data;
}

export async function fetchAttempt(attemptId: number) {
  const res = await api.get<ApiSuccess<{ attempt: QuizAttempt; questions: Question[] }>>(`/attempts/${attemptId}`);
  return res.data.data;
}

export async function saveAnswer(attemptId: number, questionId: number, optionId: number | null) {
  const res = await api.post<ApiSuccess<{ question_id: number; question_option_id: number | null }>>(
    `/attempts/${attemptId}/answers`,
    { question_id: questionId, question_option_id: optionId }
  );
  return res.data.data;
}

export async function submitAttempt(attemptId: number) {
  const res = await api.post<ApiSuccess<QuizAttempt>>(`/attempts/${attemptId}/submit`);
  return res.data.data;
}

export async function fetchResult(attemptId: number) {
  const res = await api.get<ApiSuccess<QuizAttempt>>(`/attempts/${attemptId}/result`);
  return res.data.data;
}

export async function fetchReview(attemptId: number) {
  const res = await api.get<ApiSuccess<QuizReviewItem[]>>(`/attempts/${attemptId}/review`);
  return res.data.data;
}
