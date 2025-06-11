<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan; // Make sure this model exists or is created
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $plans = Plan::with('targetUserGroup')->paginate($request->input('per_page', 15));
        return response()->json($plans);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration_days' => 'required|integer|min:1',
            'traffic_limit_gb' => 'required|numeric|min:0',
            'device_limit' => 'required|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'node_selection_criteria' => 'required|json', // Or 'array' if you prefer to pass as array
            'target_user_group_id' => ['nullable', Rule::exists('user_groups', 'id')],
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $validator->validated();
        if (!isset($data['is_active'])) {
            $data['is_active'] = true; // Default to active
        }
        // Ensure node_selection_criteria is stored as JSON if it's passed as an array
        // if (is_array($data['node_selection_criteria'])) {
        //     $data['node_selection_criteria'] = json_encode($data['node_selection_criteria']);
        // }

        $plan = Plan::create($data);

        return response()->json($plan->load('targetUserGroup'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Plan $plan) // Route model binding
    {
        return response()->json($plan->load('targetUserGroup'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Plan $plan) // Route model binding
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'duration_days' => 'sometimes|required|integer|min:1',
            'traffic_limit_gb' => 'sometimes|required|numeric|min:0',
            'device_limit' => 'sometimes|required|integer|min:0',
            'price' => 'sometimes|nullable|numeric|min:0',
            'node_selection_criteria' => 'sometimes|required|json', // Or 'array'
            'target_user_group_id' => ['sometimes', 'nullable', Rule::exists('user_groups', 'id')],
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $validator->validated();
        // if (isset($data['node_selection_criteria']) && is_array($data['node_selection_criteria'])) {
        //     $data['node_selection_criteria'] = json_encode($data['node_selection_criteria']);
        // }

        $plan->update($data);

        return response()->json($plan->load('targetUserGroup'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Plan $plan) // Route model binding
    {
        // Consider related user_subscriptions. The migration for user_subscriptions
        // has plan_id foreign key. Default behavior is RESTRICT.
        // If there are active subscriptions, this delete might fail unless onDelete('cascade') or onDelete('set null')
        // is set on the user_subscriptions table for plan_id.
        // For now, simple delete. This needs to be addressed when user_subscriptions are implemented.
        $plan->delete();
        return response()->json(null, 204); // No content
    }
}
