<?php

use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\PackageManagementController as AdminPackageController;
use App\Http\Controllers\Api\Admin\QuestionManagementController as AdminQuestionController;
use App\Http\Controllers\Api\Admin\SectionManagementController as AdminSectionController;
use App\Http\Controllers\Api\Admin\SubscriptionManagementController as AdminSubscriptionController;
use App\Http\Controllers\Api\Admin\UserManagementController as AdminUserController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AttemptController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HistoryController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ManualPaymentController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\Admin\PaymentApprovalController;
use App\Http\Controllers\Api\Admin\VoucherManagementController as AdminVoucherController;
use App\Http\Controllers\Api\Admin\CategoryManagementController as AdminCategoryController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ProgressController;
use App\Http\Controllers\Api\SubscriptionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| Authenticated (student) - P0 CORE
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/packages', [PackageController::class, 'index']);
    Route::get('/packages/{package}', [PackageController::class, 'show']);

    Route::get('/categories', [CategoryController::class, 'index']);

    Route::post('/attempts', [AttemptController::class, 'store']);
    Route::get('/attempts/{attempt}', [AttemptController::class, 'show']);
    Route::post('/attempts/{attempt}/answers', [AttemptController::class, 'saveAnswer']);
    Route::post('/attempts/{attempt}/submit', [AttemptController::class, 'submit']);
    Route::get('/attempts/{attempt}/result', [AttemptController::class, 'result']);
    Route::get('/attempts/{attempt}/review', [AttemptController::class, 'review']);

    Route::get('/history', [HistoryController::class, 'index']);
    Route::get('/progress', [ProgressController::class, 'index']);

    Route::get('/subscription', [SubscriptionController::class, 'index']);
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/manual-payments', [ManualPaymentController::class, 'index']);
    Route::post('/manual-payments', [ManualPaymentController::class, 'store']);
    Route::post('/vouchers/validate', [VoucherController::class, 'validate']);

    // P1
    Route::get('/modules', [ModuleController::class, 'index']);
    Route::get('/modules/{module}', [ModuleController::class, 'show']);
    Route::post('/modules/purchase', [\App\Http\Controllers\Api\ModuleAccessController::class, 'store']);
    Route::get('/module-purchases', [\App\Http\Controllers\Api\ModuleAccessController::class, 'index']);
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::post('/announcements/{announcement}/read', [AnnouncementController::class, 'markRead']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    /*
    |----------------------------------------------------------------------
    | Admin - requires role=admin (enforced server-side, never by frontend)
    |----------------------------------------------------------------------
    */
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        Route::get('/categories', [AdminCategoryController::class, 'index']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::put('/categories/{category}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);
        Route::post('/categories/{category}/toggle-active', [AdminCategoryController::class, 'toggleActive']);

        Route::get('/packages', [AdminPackageController::class, 'index']);
        Route::post('/packages', [AdminPackageController::class, 'store']);
        Route::put('/packages/{package}', [AdminPackageController::class, 'update']);
        Route::delete('/packages/{package}', [AdminPackageController::class, 'destroy']);
        Route::post('/packages/{package}/toggle-publish', [AdminPackageController::class, 'togglePublish']);

        Route::get('/packages/{package}/sections', [AdminSectionController::class, 'index']);
        Route::post('/packages/{package}/sections', [AdminSectionController::class, 'store']);
        Route::post('/packages/{package}/sections/reorder', [AdminSectionController::class, 'reorder']);
        Route::put('/sections/{section}', [AdminSectionController::class, 'update']);
        Route::delete('/sections/{section}', [AdminSectionController::class, 'destroy']);

        Route::get('/sections/{section}/questions', [AdminQuestionController::class, 'index']);
        Route::post('/questions', [AdminQuestionController::class, 'store']);
        Route::put('/questions/{question}', [AdminQuestionController::class, 'update']);
        Route::delete('/questions/{question}', [AdminQuestionController::class, 'destroy']);
        Route::post('/questions/{question}/image', [AdminQuestionController::class, 'uploadImage']);
        Route::post('/questions/{question}/audio', [AdminQuestionController::class, 'uploadAudio']);

        Route::get('/users', [AdminUserController::class, 'index']);
        Route::put('/users/{user}/status', [AdminUserController::class, 'updateStatus']);

        Route::get('/subscribers', [AdminSubscriptionController::class, 'index']);

        Route::get('/payments', [PaymentApprovalController::class, 'index']);
        Route::post('/payments/{payment}/approve', [PaymentApprovalController::class, 'approve']);
        Route::post('/payments/{payment}/reject', [PaymentApprovalController::class, 'reject']);

        Route::get('/vouchers', [AdminVoucherController::class, 'index']);
        Route::post('/vouchers', [AdminVoucherController::class, 'store']);
        Route::put('/vouchers/{voucher}', [AdminVoucherController::class, 'update']);
        Route::delete('/vouchers/{voucher}', [AdminVoucherController::class, 'destroy']);

        Route::get('/module-categories', [\App\Http\Controllers\Api\Admin\AdminModuleManagementController::class, 'categories']);
        Route::post('/module-categories', [\App\Http\Controllers\Api\Admin\AdminModuleManagementController::class, 'storeCategory']);
        Route::put('/module-categories/{moduleCategory}', [\App\Http\Controllers\Api\Admin\AdminModuleManagementController::class, 'updateCategory']);
        Route::delete('/module-categories/{moduleCategory}', [\App\Http\Controllers\Api\Admin\AdminModuleManagementController::class, 'destroyCategory']);

        Route::get('/modules', [\App\Http\Controllers\Api\Admin\AdminModuleManagementController::class, 'index']);
        Route::post('/modules', [\App\Http\Controllers\Api\Admin\AdminModuleManagementController::class, 'store']);
        Route::put('/modules/{module}', [\App\Http\Controllers\Api\Admin\AdminModuleManagementController::class, 'update']);
        Route::delete('/modules/{module}', [\App\Http\Controllers\Api\Admin\AdminModuleManagementController::class, 'destroy']);
        Route::post('/modules/{module}/toggle-publish', [\App\Http\Controllers\Api\Admin\AdminModuleManagementController::class, 'togglePublish']);
    });
});
