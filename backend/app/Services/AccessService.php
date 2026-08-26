<?php

namespace App\Services;

use App\Models\LearningModule;
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
        if (! $package->is_premium) {
            return true;
        }

        if ($user->isAdmin() || $user->isStudentMendunia()) {
            return true;
        }

        $access = UserPackageAccess::where('user_id', $user->id)
            ->where('package_id', $package->id)
            ->first();

        return $access?->isCurrentlyActive() ?? false;
    }

    public function grantAccess(User $user, Package $package, ?\DateTimeInterface $expiresAt = null): UserPackageAccess
    {
        return UserPackageAccess::updateOrCreate(
            ['user_id' => $user->id, 'package_id' => $package->id],
            ['status' => 'active', 'started_at' => now(), 'expires_at' => $expiresAt]
        );
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
     *  - user is admin or studentmendunia
     *  - user has an active individual purchase for this module
     */
    public function canAccessModule(User $user, LearningModule $module): bool
    {
        if (! $module->is_premium) {
            return true;
        }

        if ($user->isAdmin() || $user->isStudentMendunia()) {
            return true;
        }

        $purchase = ModulePurchase::where('user_id', $user->id)
            ->where('module_id', $module->id)
            ->first();

        return $purchase?->isCurrentlyActive() ?? false;
    }

    public function grantModuleAccess(User $user, LearningModule $module, int $amountPaid = 0): ModulePurchase
    {
        return ModulePurchase::updateOrCreate(
            ['user_id' => $user->id, 'module_id' => $module->id],
            [
                'status' => 'active',
                'amount_paid' => $amountPaid,
                'purchased_at' => now(),
            ]
        );
    }
}
