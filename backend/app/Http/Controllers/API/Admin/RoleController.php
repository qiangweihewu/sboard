<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
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

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        return response()->json(['message' => 'Not implemented'], 501);
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        return response()->json(['message' => 'Not implemented'], 501);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        return response()->json(['message' => 'Not implemented'], 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        return response()->json(['message' => 'Not implemented'], 501);
    }
}