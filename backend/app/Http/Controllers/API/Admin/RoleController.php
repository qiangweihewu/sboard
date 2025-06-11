<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role; // Ensure Role model is imported
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Role::all());
    }

    // Other methods (store, show, update, destroy) can be left as placeholders
    // or implemented if full CRUD for Roles via API is desired later.
    // For now, only index is critical for fetching roles for forms.

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Placeholder - Not implemented in this step
        return response()->json(['message' => 'Not implemented'], 501);
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        // Placeholder - Not implemented in this step
        return response()->json(['message' => 'Not implemented'], 501);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        // Placeholder - Not implemented in this step
        return response()->json(['message' => 'Not implemented'], 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        // Placeholder - Not implemented in this step
        return response()->json(['message' => 'Not implemented'], 501);
    }
}
