<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KotobaTopic;

class KotobaTopicController extends Controller
{
    public function index()
    {
        $categoryId = request('category_id');

        $query = KotobaTopic::withCount('kotoba')->orderBy('order')->orderBy('id');

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        $topics = $query->get();
        return $this->success($topics);
    }
}
