<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role; // For validation
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Basic pagination, can be enhanced with filtering/sorting
        $users = User::with('role')->paginate($request->input('per_page', 15));
        return response()->json($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => ['nullable', Rule::exists('roles', 'id')],
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $validator->validated();
        $data['password'] = Hash::make($data['password']);
        if (!isset($data['is_active'])) {
            $data['is_active'] = true; // Default to active
        }
        // Assign a default role if role_id is not provided and a default role exists
        if (empty($data['role_id'])) {
            // Example: Find 'USER' role and assign its ID. This part depends on actual role names/logic.
            // $defaultUserRole = Role::where('name', 'USER')->first();
            // if ($defaultUserRole) {
            //     $data['role_id'] = $defaultUserRole->id;
            // }
        }


        $user = User::create($data);

        return response()->json($user->load('role'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return response()->json($user->load('role'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|nullable|string|min:8|confirmed',
            'role_id' => ['sometimes', 'nullable', Rule::exists('roles', 'id')],
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $validator->validated();

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']); // Don't update password if not provided
        }

        $user->update($data);

        return response()->json($user->load('role'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // Consider business logic: e.g., cannot delete self, cannot delete super admin
        // For now, a simple delete.
        if (auth()->id() === $user->id) {
            return response()->json(['error' => 'You cannot delete yourself.'], 403);
        }

        $user->delete();
        return response()->json(null, 204); // No content
    }
}
