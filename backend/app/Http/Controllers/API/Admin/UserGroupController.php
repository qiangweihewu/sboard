<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserGroup; // Make sure this model exists or is created
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserGroupController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $groups = UserGroup::paginate($request->input('per_page', 15));
        return response()->json($groups);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:user_groups,name',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $group = UserGroup::create($validator->validated());

        return response()->json($group, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(UserGroup $userGroup) // Route model binding
    {
        // To load users in this group: $userGroup->load('users');
        return response()->json($userGroup);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserGroup $userGroup) // Route model binding
    {
        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('user_groups', 'name')->ignore($userGroup->id)],
            'description' => 'sometimes|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $userGroup->update($validator->validated());

        return response()->json($userGroup);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserGroup $userGroup) // Route model binding
    {
        // Current migration for user_user_group pivot table has onDelete('cascade')
        // Current migration for plans table (target_user_group_id) has onDelete('set null')
        // So, deleting a group will remove entries from pivot and set plan's group_id to null.
        $userGroup->delete();
        return response()->json(null, 204); // No content
    }
}
