<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePackageRequest;
use App\Http\Resources\PackageResource;
use App\Models\Package;
use Illuminate\Support\Str;

class PackageManagementController extends Controller
{
    public function index()
    {
        $query = Package::withCount('sections');

        if ($search = request('search')) {
            $query->where('name', 'like', "%{$search}%");
        }
        if ($status = request('status')) {
            $query->where('status', $status);
        }

        $packages = $query->orderByDesc('id')->paginate(request('per_page', 15));

        return $this->success([
            'items' => $packages->items(),
            'meta' => ['current_page' => $packages->currentPage(), 'last_page' => $packages->lastPage(), 'total' => $packages->total()],
        ]);
    }

    public function store(StorePackageRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['name']).'-'.Str::random(4);

        $package = Package::create($data);

        return $this->success(new PackageResource($package), 'Package created.', 201);
    }

    public function update(StorePackageRequest $request, Package $package)
    {
        $package->update($request->validated());

        return $this->success(new PackageResource($package), 'Package updated.');
    }

    public function destroy(Package $package)
    {
        $package->delete();

        return $this->success([], 'Package deleted.');
    }

    public function togglePublish(Package $package)
    {
        $package->update([
            'status' => $package->status === 'published' ? 'draft' : 'published',
        ]);

        return $this->success(new PackageResource($package), 'Status updated.');
    }
}
