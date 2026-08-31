<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PackageResource;
use App\Models\Package;
use App\Models\QuizAttempt;
use App\Services\AccessService;
use Illuminate\Support\Facades\Auth;

class PackageController extends Controller
{
    public function __construct(protected AccessService $accessService) {}

    public function index()
    {
        $user = Auth::user();

        $query = Package::query()
            ->where('status', 'published')
            ->with(['sections.questions']);

        if ($search = request('search')) {
            $query->where('name', 'like', "%{$search}%");
        }
        if ($category = request('category')) {
            $query->where('category', $category);
        }
        if ($level = request('level')) {
            $query->where('level', $level);
        }

        $packages = $query->paginate(request('per_page', 12));

        $packages->getCollection()->transform(function (Package $package) use ($user) {
            $this->attachUserContext($package, $user);

            return $package;
        });

        return $this->success([
            'items' => PackageResource::collection($packages->items()),
            'meta' => [
                'current_page' => $packages->currentPage(),
                'last_page' => $packages->lastPage(),
                'total' => $packages->total(),
            ],
        ]);
    }

    public function show(Package $package)
    {
        if ($package->status !== 'published') {
            return $this->error('Package not found.', [], 404);
        }

        $user = Auth::user();
        $package->load('sections.questions');
        $this->attachUserContext($package, $user);

        return $this->success(new PackageResource($package));
    }

    /**
     * Attaches access_state (locked/active/completed) and progress percentage —
     * both are per-user and MUST be computed server-side, never trusted from the client.
     */
    protected function attachUserContext(Package $package, $user): void
    {
        $hasAccess = $this->accessService->canAccessPackage($user, $package);

        // Expose effective premium + price (category-level when the category is premium)
        $package->is_premium = $this->accessService->isPremiumPackage($package);
        $package->price = $this->accessService->packagePrice($package);

        $completedAttempt = QuizAttempt::where('user_id', $user->id)
            ->where('package_id', $package->id)
            ->where('status', 'completed')
            ->exists();

        $package->access_state = ! $hasAccess
            ? 'locked'
            : ($completedAttempt ? 'completed' : 'active');

        $inProgress = QuizAttempt::where('user_id', $user->id)
            ->where('package_id', $package->id)
            ->where('status', 'in_progress')
            ->latest('id')
            ->first();

        $totalQ = $package->totalQuestions();

        $package->progress_percent = $inProgress && $totalQ
            ? round(($inProgress->answers()->count() / max(1, $totalQ)) * 100)
            : 0;
    }
}
