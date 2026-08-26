<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;

class UserManagementController extends Controller
{
    public function index()
    {
        $query = User::whereIn('role', ['student', 'studentmendunia']);

        if ($search = request('search')) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
        }
        if ($status = request('status')) {
            $query->where('status', $status);
        }

        $users = $query->withCount('quizAttempts')->paginate(request('per_page', 15));

        return $this->success([
            'items' => $users->items(),
            'meta' => ['current_page' => $users->currentPage(), 'last_page' => $users->lastPage()],
        ]);
    }

    public function updateStatus(User $user)
    {
        $data = request()->validate(['status' => ['required', 'in:active,suspended']]);
        $user->update($data);

        return $this->success($user, 'User status updated.');
    }
}
