<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NodeController;

Route::apiResource('nodes', NodeController::class);
