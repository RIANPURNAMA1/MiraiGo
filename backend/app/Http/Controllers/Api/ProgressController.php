<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserProgress;
use App\Services\ProgressService;
use Illuminate\Support\Facades\Auth;

class ProgressController extends Controller
{
    public function __construct(protected ProgressService $progressService) {}

    public function index()
    {
        $rows = UserProgress::where('user_id', Auth::id())
            ->with('section.package')
            ->get();

        $bySection = $rows->map(fn ($p) => [
            'section' => $p->section->name,
            'package' => $p->section->package->name,
            'package_id' => $p->section->package_id,
            'best_score' => (float) $p->best_score,
            'last_score' => (float) $p->last_score,
            'average_score' => (float) $p->average_score,
            'attempts_count' => $p->attempts_count,
            'last_attempted_at' => $p->last_attempted_at,
        ]);

        $byCategory = $rows->groupBy(fn ($p) => $p->section->name)
            ->map(fn ($group) => round($group->avg('average_score'), 1));

        return $this->success([
            'overall' => $rows->count() ? round($rows->avg('average_score'), 1) : 0,
            'by_category' => $byCategory,
            'sections' => $bySection->values(),
        ]);
    }
}
