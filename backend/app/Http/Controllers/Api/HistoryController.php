<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuizAttemptResource;
use App\Models\QuizAttempt;
use Illuminate\Support\Facades\Auth;

class HistoryController extends Controller
{
    public function index()
    {
        $query = QuizAttempt::with('package')
            ->where('user_id', Auth::id())
            ->whereIn('status', ['completed', 'expired'])
            ->orderByDesc('submitted_at');

        if ($packageId = request('package_id')) {
            $query->where('package_id', $packageId);
        }
        if ($from = request('date_from')) {
            $query->whereDate('submitted_at', '>=', $from);
        }
        if ($to = request('date_to')) {
            $query->whereDate('submitted_at', '<=', $to);
        }

        $attempts = $query->paginate(request('per_page', 10));

        return $this->success([
            'items' => QuizAttemptResource::collection($attempts->items()),
            'meta' => [
                'current_page' => $attempts->currentPage(),
                'last_page' => $attempts->lastPage(),
                'total' => $attempts->total(),
            ],
        ]);
    }
}
