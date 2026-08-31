<?php

namespace App\Services;

use App\Models\Category;
use App\Models\LearningModule;
use App\Models\ModulePremiumAccess;
use App\Models\ModulePurchase;
use App\Models\Package;
use App\Models\User;
use App\Models\UserPackageAccess;

class AccessService
{
    /**
     * The ONLY place package authorization is decided. Frontend never determines
     * locked/unlocked state itself — it only reflects what this service returns.
     */
    public function canAccessPackage(User $user, Package $package): bool
    {
        if (! $this->packageIsPremium($package)) {
            return true;
        }

        if ($user->isAdmin()) {
            return true;
        }

        $access = UserPackageAccess::where('user_id', $user->id)
            ->where('package_id', $package->id)
            ->first();

        return $access?->isCurrentlyActive() ?? false;
    }

    /**
     * A package is premium if it is explicitly marked premium, or if its
     * category is marked premium (in which case the whole category is paid).
     */
    public function isPremiumPackage(Package $package): bool
    {
        return $this->packageIsPremium($package);
    }

    protected function packageIsPremium(Package $package): bool
    {
        if ($package->is_premium) {
            return true;
        }

        return $this->categoryForPackage($package)?->is_premium ?? false;
    }

    /**
     * Effective price for a package. If the package belongs to a premium
     * category, its price comes from the category (whole category is paid).
     * Otherwise the package is free (price 0).
     */
    public function packagePrice(Package $package): int
    {
        $category = $this->categoryForPackage($package);

        if ($category?->is_premium) {
            return (int) $category->price;
        }

        return (int) $package->price;
    }

    protected function categoryForPackage(Package $package): ?Category
    {
        if (! $package->category) {
            return null;
        }

        return Category::where('slug', $package->category)->first();
    }

    /**
     * All published packages that belong to the same category as the given package.
     */
    public function packagesInCategory(Package $package): \Illuminate\Support\Collection
    {
        if (! $package->category) {
            return collect([$package]);
        }

        return Package::where('category', $package->category)
            ->where('status', 'published')
            ->get();
    }

    public function grantAccess(User $user, Package $package, ?\DateTimeInterface $expiresAt = null): UserPackageAccess
    {
        return UserPackageAccess::updateOrCreate(
            ['user_id' => $user->id, 'package_id' => $package->id],
            ['status' => 'active', 'started_at' => now(), 'expires_at' => $expiresAt]
        );
    }

    /**
     * Expiry for access to a package's category. If the category has a
     * duration in days, access expires after that many days; otherwise it is
     * lifetime (null).
     */
    public function categoryExpiry(Package $package): ?\DateTimeInterface
    {
        $category = $this->categoryForPackage($package);

        $days = $category?->duration_days;

        if ($days === null || $days <= 0) {
            return null; // selamanya
        }

        return now()->addDays((int) $days);
    }

    /**
     * Grant access to every package in the same category as $package.
     * A single category payment opens the whole category.
     */
    public function grantCategoryAccess(User $user, Package $package, ?\DateTimeInterface $expiresAt = null): void
    {
        foreach ($this->packagesInCategory($package) as $pkg) {
            $this->grantAccess($user, $pkg, $expiresAt);
        }

        // Buying a latihan category also unlocks the premium modules linked to it.
        $this->grantModulesForCategory($user, $this->categoryForPackage($package), $expiresAt);
    }

    public function accessState(User $user, Package $package): string
    {
        if ($this->canAccessPackage($user, $package)) {
            return 'active';
        }

        return 'locked';
    }

    // ── Module Access ──

    /**
     * Check if user can access a module.
     * Access granted if:
     *  - module is not premium (free)
     *  - user is admin (full bypass)
     *  - user has the "All Premium" module bundle (ModulePremiumAccess)
     *  - user has an active individual purchase for this module
     *  - user has active access to a latihan category linked to this
     *    module's category (buying the category includes the premium modules)
     */
    public function canAccessModule(User $user, LearningModule $module): bool
    {
        if (! $this->moduleIsPremium($module)) {
            return true;
        }

        if ($user->isAdmin()) {
            return true;
        }

        if (ModulePremiumAccess::where('user_id', $user->id)->exists()) {
            return true;
        }

        $purchase = ModulePurchase::where('user_id', $user->id)
            ->where('module_id', $module->id)
            ->first();

        if ($purchase?->isCurrentlyActive()) {
            return true;
        }

        $category = $this->categoryForModule($module);

        if ($category && $this->categoryHasAccess($user, $category)) {
            return true;
        }

        return false;
    }

    /**
     * A module's premium status is determined ONLY by its latihan category.
     * If a module has no category or its category is not premium, it is free.
     */
    public function moduleIsPremium(LearningModule $module): bool
    {
        return (bool) ($this->categoryForModule($module)?->is_premium ?? false);
    }

    public function grantModuleAccess(
        User $user,
        LearningModule $module,
        int $amountPaid = 0,
        ?\DateTimeInterface $expiresAt = null
    ): ModulePurchase {
        return ModulePurchase::updateOrCreate(
            ['user_id' => $user->id, 'module_id' => $module->id],
            [
                'status' => 'active',
                'amount_paid' => $amountPaid,
                'purchased_at' => now(),
                'expires_at' => $expiresAt,
            ]
        );
    }

    /**
     * The latihan (soal) category the module belongs to, if any.
     */
    protected function categoryForModule(LearningModule $module): ?Category
    {
        if (! $module->category_id) {
            return null;
        }

        return Category::where('id', $module->category_id)->first();
    }

    /**
     * Whether the user currently has access to a package in the given latihan category.
     */
    public function categoryHasAccess(User $user, Category $category): bool
    {
        $activePackageIds = UserPackageAccess::where('user_id', $user->id)
            ->get()
            ->filter(fn (UserPackageAccess $a) => $a->isCurrentlyActive())
            ->pluck('package_id');

        if ($activePackageIds->isEmpty()) {
            return false;
        }

        return Package::whereIn('id', $activePackageIds)
            ->where('category', $category->slug)
            ->exists();
    }

    /**
     * Grant access to all published modules in the given premium latihan
     * category (every module in a premium category is premium). Expiry follows
     * the category's duration.
     */
    public function grantModulesForCategory(User $user, ?Category $category, ?\DateTimeInterface $expiresAt = null): void
    {
        if (! $category) {
            return;
        }

        $modules = LearningModule::where('status', 'published')
            ->where('category_id', $category->id)
            ->get();

        foreach ($modules as $module) {
            $this->grantModuleAccess($user, $module, 0, $expiresAt);
        }
    }
}
