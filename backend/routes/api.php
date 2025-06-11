<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NodeController;
use App\Http\Controllers\UserGroupController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\AuthController;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::apiResource('nodes', NodeController::class);
    Route::apiResource('groups', UserGroupController::class);
    Route::apiResource('plans', PlanController::class);
});
