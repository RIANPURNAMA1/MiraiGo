<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\User;
use App\Services\AccessService;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    public function index()
    {
        $accessService = new AccessService();
        $user = Auth::user();

        $categories = Category::where('is_active', true)
            ->orderBy('order')
            ->orderBy('id')
            ->get()
            ->each(function (Category $category) use ($user, $accessService) {
                $category->setAttribute(
                    'has_access',
                    ($user instanceof User) && $accessService->categoryHasAccess($user, $category)
                );
            });

        return $this->success($categories);
    }
}
