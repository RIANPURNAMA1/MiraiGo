<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Models\UserPackageAccess;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        return $this->success([
            'user' => ['name' => $user->name],
            'masa_berlaku' => $this->masaBerlaku($user),
            'referral' => $this->referral($user),
            'stats' => $this->weeklyStats($user),
            'weak_areas' => $this->weakAreas($user),
            'streak' => $this->streak($user),
            'recent_tests' => $this->recentTests($user),
        ]);
    }

    private function masaBerlaku(User $user): array
    {
        $active = UserPackageAccess::where('user_id', $user->id)
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->get();

        if ($active->isEmpty()) {
            return ['is_active' => false, 'label' => 'Belum aktif', 'days_left' => 0, 'expires_at' => null];
        }

        if ($active->contains(fn ($a) => $a->expires_at === null)) {
            return ['is_active' => true, 'label' => 'Selamanya', 'days_left' => null, 'expires_at' => null];
        }

        $furthest = $active->max('expires_at');
        $daysLeft = (int) ceil(now()->diffInDays(Carbon::parse($furthest)));

        return [
            'is_active' => true,
            'label' => 'Aktif',
            'days_left' => max($daysLeft, 1),
            'expires_at' => $furthest?->toIso8601String(),
        ];
    }

    private function referral(User $user): array
    {
        $code = $user->ensureReferralCode();
        $usedOrders = $user->referredTransactions()->whereIn('status', ['paid', 'completed'])->count();

        return [
            'code' => $code,
            'used_orders' => $usedOrders,
            'bonus_days' => (int) $user->referral_bonus_days,
        ];
    }

    private function weeklyStats(User $user): array
    {
        $weekStart = now()->startOfWeek();

        $base = QuizAttempt::where('user_id', $user->id);

        $avg7 = (clone $base)->where('status', 'completed')
            ->where('submitted_at', '>=', now()->subDays(7))
            ->avg('score');

        $testsThisWeek = (clone $base)->where('started_at', '>=', $weekStart)->count();

        $accuracy = DB::table('quiz_answers as qa')
            ->join('quiz_attempts as a', 'a.id', '=', 'qa.quiz_attempt_id')
            ->where('a.user_id', $user->id)
            ->where('a.status', 'completed')
            ->where('a.submitted_at', '>=', now()->subDays(7))
            ->selectRaw('SUM(qa.is_correct = 1) as correct, SUM(qa.is_correct IN (0)) as wrong')
            ->first();

        $totalScored = ((int) $accuracy->correct) + ((int) $accuracy->wrong);

        return [
            'average_score_7d' => $avg7 !== null ? round((float) $avg7, 0) : 0,
            'tests_this_week' => $testsThisWeek,
            'accuracy_7d' => $totalScored > 0 ? round(((int) $accuracy->correct / $totalScored) * 100) : 0,
        ];
    }

    private function weakAreas(User $user): array
    {
        $rows = DB::table('quiz_answers as qa')
            ->join('quiz_attempts as a', 'a.id', '=', 'qa.quiz_attempt_id')
            ->join('questions as q', 'q.id', '=', 'qa.question_id')
            ->join('package_sections as s', 's.id', '=', 'q.section_id')
            ->where('a.user_id', $user->id)
            ->where('a.status', 'completed')
            ->where('a.submitted_at', '>=', now()->subDays(30))
            ->whereNotNull('qa.is_correct')
            ->groupBy('s.id', 's.name')
            ->orderByRaw('accuracy ASC')
            ->limit(3)
            ->get([
                's.name',
                DB::raw('ROUND(AVG(qa.is_correct) * 100) as accuracy'),
                DB::raw('COUNT(*) as total_answered'),
            ]);

        return $rows->map(fn ($r) => [
            'section' => $r->name,
            'accuracy' => (int) $r->accuracy,
            'total_answered' => (int) $r->total_answered,
        ])->all();
    }

    private function streak(User $user): array
    {
        $attemptDates = QuizAttempt::where('user_id', $user->id)
            ->where(function ($q) {
                $q->whereNotNull('started_at')->orWhereNotNull('submitted_at');
            })
            ->get(['started_at', 'submitted_at'])
            ->flatMap(fn ($a) => array_filter([
                $a->started_at?->toDateString(),
                $a->submitted_at?->toDateString(),
            ]));

        $dates = $attemptDates->unique()->sort()->values();

        $streakDays = 0;
        $cursor = now()->startOfDay();
        if (!$dates->contains($cursor->toDateString())) {
            $cursor = $cursor->subDay();
        }
        while ($dates->contains($cursor->toDateString())) {
            $streakDays++;
            $cursor = $cursor->subDay();
        }

        $weekStart = now()->startOfWeek();
        $minutes = QuizAttempt::where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('submitted_at', '>=', $weekStart)
            ->with('package:id,duration_minutes')
            ->get()
            ->sum(function ($a) {
                $spent = $a->started_at && $a->submitted_at
                    ? $a->started_at->diffInMinutes($a->submitted_at)
                    : 0;

                return min(max($spent, 0), $a->package->duration_minutes ?? 120);
            });

        return ['days' => $streakDays, 'weekly_minutes' => (int) $minutes];
    }

    private function recentTests(User $user): array
    {
        return QuizAttempt::with('package:id,name')
            ->where('user_id', $user->id)
            ->whereIn('status', ['completed', 'in_progress'])
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'package_id' => $a->package_id,
                'package' => $a->package->name,
                'result' => $a->status === 'completed'
                    ? sprintf('%d/%d', $a->correct_answers, $a->total_questions)
                    : null,
                'percent' => $a->score !== null ? round((float) $a->score) : null,
                'status' => $a->status,
                'started_at' => $a->started_at?->toIso8601String(),
                'finished_at' => $a->submitted_at?->toIso8601String(),
            ])
            ->all();
    }
}
