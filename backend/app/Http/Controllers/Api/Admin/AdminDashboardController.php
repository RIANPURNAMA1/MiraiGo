<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Question;
use App\Models\QuizAttempt;
use App\Models\Reservation;
use App\Models\Transaction;
use App\Models\User;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return $this->success([
            'total_users' => User::whereIn('role', ['student', 'studentmendunia'])->count(),
            'active_users' => User::whereIn('role', ['student', 'studentmendunia'])->where('status', 'active')->count(),
            'total_packages' => Package::count(),
            'total_questions' => Question::count(),
            'total_attempts' => QuizAttempt::count(),
            'average_score' => round(QuizAttempt::where('status', 'completed')->avg('score') ?? 0, 1),
            'transactions' => Transaction::where('status', 'paid')->count(),
            'reservations' => Reservation::count(),
            'recent_attempts' => QuizAttempt::with(['user:id,name', 'package:id,name'])
                ->orderByDesc('id')->limit(10)
                ->get(['id', 'user_id', 'package_id', 'status', 'score', 'submitted_at']),
        ]);
    }
}
