<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AnnouncementRead;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $announcements = Announcement::where('status', 'published')
            ->orderByDesc('published_at')
            ->paginate(request('per_page', 10));

        $readIds = AnnouncementRead::where('user_id', $userId)->pluck('announcement_id')->toArray();

        $items = collect($announcements->items())->map(fn ($a) => [
            'id' => $a->id,
            'title' => $a->title,
            'description' => $a->description,
            'image' => $a->image,
            'published_at' => $a->published_at,
            'is_read' => in_array($a->id, $readIds),
        ]);

        return $this->success([
            'items' => $items,
            'meta' => ['current_page' => $announcements->currentPage(), 'last_page' => $announcements->lastPage()],
        ]);
    }

    public function markRead(Announcement $announcement)
    {
        AnnouncementRead::updateOrCreate(
            ['announcement_id' => $announcement->id, 'user_id' => Auth::id()],
            ['read_at' => now()]
        );

        return $this->success([], 'Marked as read.');
    }
}
