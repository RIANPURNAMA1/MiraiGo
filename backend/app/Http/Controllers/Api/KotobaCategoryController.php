<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KotobaCategory;

class KotobaCategoryController extends Controller
{
    public function index()
    {
        $categories = KotobaCategory::withCount('kotoba')
            ->where('is_active', true)
            ->orderBy('order')
            ->orderBy('id')
            ->get()
            ->map(function ($cat) {
                $cat->total_words = $cat->kotoba_count;
                return $cat;
            });

        return $this->success($categories);
    }
}
