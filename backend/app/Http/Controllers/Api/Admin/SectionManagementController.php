<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\PackageSection;

class SectionManagementController extends Controller
{
    public function index(Package $package)
    {
        return $this->success($package->sections);
    }

    public function store(Package $package)
    {
        $data = request()->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'order' => ['integer', 'min:0'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
        ]);

        $section = $package->sections()->create($data);

        return $this->success($section, 'Section created.', 201);
    }

    public function update(PackageSection $section)
    {
        $data = request()->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'order' => ['integer', 'min:0'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
        ]);

        $section->update($data);

        return $this->success($section, 'Section updated.');
    }

    public function destroy(PackageSection $section)
    {
        $section->delete();

        return $this->success([], 'Section deleted.');
    }

    public function reorder(Package $package)
    {
        $order = request()->validate(['order' => ['required', 'array']])['order'];

        foreach ($order as $index => $sectionId) {
            PackageSection::where('id', $sectionId)
                ->where('package_id', $package->id)
                ->update(['order' => $index]);
        }

        return $this->success([], 'Sections reordered.');
    }
}
