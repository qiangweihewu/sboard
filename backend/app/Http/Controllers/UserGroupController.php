<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserGroup;

class UserGroupController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return UserGroup::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|unique:user_groups,name',
            'description' => 'nullable|string',
        ]);
        $group = UserGroup::create($data);
        return response()->json($group, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return UserGroup::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $group = UserGroup::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|required|string|unique:user_groups,name,' . $group->id,
            'description' => 'nullable|string',
        ]);
        $group->update($data);
        return $group;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        UserGroup::findOrFail($id)->delete();
        return response()->noContent();
    }
}
