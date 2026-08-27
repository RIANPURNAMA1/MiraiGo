<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kotoba;

class KotobaController extends Controller
{
    public function index()
    {
        $query = Kotoba::with('topics')->where('is_active', true);

        if ($categoryId = request('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($topicId = request('topic_id')) {
            $query->whereHas('topics', function ($q) use ($topicId) {
                $q->where('kotoba_topics.id', $topicId);
            });
        }

        return $this->success($query->orderBy('order')->orderBy('id')->get());
    }
}
