<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Plan;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Plan::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'duration_days' => 'required|integer',
            'traffic_limit_gb' => 'required|numeric',
            'device_limit' => 'required|integer',
            'price' => 'nullable|numeric',
            'node_selection_criteria' => 'nullable|array',
            'target_user_group_id' => 'nullable|exists:user_groups,id',
            'is_active' => 'boolean',
        ]);
        $plan = Plan::create($data);
        return response()->json($plan, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Plan::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $plan = Plan::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'description' => 'nullable|string',
            'duration_days' => 'sometimes|required|integer',
            'traffic_limit_gb' => 'sometimes|required|numeric',
            'device_limit' => 'sometimes|required|integer',
            'price' => 'nullable|numeric',
            'node_selection_criteria' => 'nullable|array',
            'target_user_group_id' => 'nullable|exists:user_groups,id',
            'is_active' => 'boolean',
        ]);
        $plan->update($data);
        return $plan;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Plan::findOrFail($id)->delete();
        return response()->noContent();
    }
}
