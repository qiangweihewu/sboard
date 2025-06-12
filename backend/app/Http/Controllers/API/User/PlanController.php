<?php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    /**
     * Display a listing of active plans available for subscription.
     */
    public function index(Request $request)
    {
        $plans = Plan::where('is_active', true)
            ->orderBy('price')
            ->paginate($request->input('per_page', 15));

        return response()->json($plans);
    }

    /**
     * Display the specified plan.
     */
    public function show(Plan $plan)
    {
        if (!$plan->is_active) {
            return response()->json(['error' => 'Plan not found or not available.'], 404);
        }

        return response()->json($plan);
    }
}