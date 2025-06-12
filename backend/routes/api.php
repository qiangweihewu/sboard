<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\Admin\UserController;
use App\Http\Controllers\API\Admin\UserGroupController;
use App\Http\Controllers\API\Admin\PlanController;
use App\Http\Controllers\API\Admin\NodeController;
use App\Http\Controllers\API\Admin\RoleController;
use App\Http\Controllers\API\Admin\SubscriptionController as AdminSubscriptionController;
use App\Http\Controllers\API\User\ProfileController;
use App\Http\Controllers\API\User\PlanController as UserPlanController;
use App\Http\Controllers\API\User\SubscriptionController as UserSubscriptionController;
use App\Http\Controllers\API\SubscriptionController;

// Authentication routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Routes requiring authentication
Route::middleware('auth:api')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/auth/me', [AuthController::class, 'me']);
});

// Admin Routes
Route::middleware(['auth:api', 'role:ADMIN,SUPER_ADMIN'])->prefix('admin')->name('admin.')->group(function () {
    Route::apiResource('users', UserController::class);
    Route::apiResource('user-groups', UserGroupController::class);
    Route::apiResource('plans', PlanController::class);
    Route::apiResource('nodes', NodeController::class);
    Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
    
    // Admin subscription management
    Route::apiResource('subscriptions', AdminSubscriptionController::class);
    Route::post('subscriptions/{subscription}/approve', [AdminSubscriptionController::class, 'approve'])->name('subscriptions.approve');
    Route::post('subscriptions/{subscription}/reject', [AdminSubscriptionController::class, 'reject'])->name('subscriptions.reject');
});

// User Routes
Route::middleware('auth:api')->prefix('user')->name('user.')->group(function () {
    Route::get('profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
    
    Route::get('plans', [UserPlanController::class, 'index'])->name('plans.index');
    Route::get('plans/{plan}', [UserPlanController::class, 'show'])->name('plans.show');
    
    Route::get('subscriptions', [UserSubscriptionController::class, 'index'])->name('subscriptions.index');
    Route::post('subscriptions/request', [UserSubscriptionController::class, 'request'])->name('subscriptions.request');
    Route::get('subscriptions/{subscription}', [UserSubscriptionController::class, 'show'])->name('subscriptions.show');
    Route::delete('subscriptions/{subscription}', [UserSubscriptionController::class, 'destroy'])->name('subscriptions.destroy');
});

// Public subscription endpoint
Route::get('/subscribe/{token}', [SubscriptionController::class, 'getSubscription'])->name('subscription.get');