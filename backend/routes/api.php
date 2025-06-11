<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\Admin\UserController;
use App\Http\Controllers\API\Admin\UserGroupController;
use App\Http\Controllers\API\Admin\PlanController;
use App\Http\Controllers\API\Admin\NodeController;

// Placeholder for future routes
// Route::middleware('auth:api')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Routes requiring authentication
Route::middleware('auth:api')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/auth/me', [AuthController::class, 'me']);
});

// Admin Routes
Route::middleware(['auth:api', 'role:ADMIN'])->prefix('admin')->name('admin.')->group(function () {
    Route::apiResource('users', UserController::class);
    Route::apiResource('user-groups', UserGroupController::class);
    Route::apiResource('plans', PlanController::class);
    Route::apiResource('nodes', NodeController::class);
});
