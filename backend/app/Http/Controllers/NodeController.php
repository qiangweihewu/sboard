<?php

namespace App\Http\Controllers;

use App\Models\Node;
use Illuminate\Http\Request;

class NodeController extends Controller
{
    public function index()
    {
        return Node::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'type' => 'required|in:VLESS,VMESS,SS,TROJAN,HYSTERIA,SHADOW_TLS',
            'address' => 'required|string',
            'port' => 'required|integer',
            'protocol_specific_config' => 'required|array',
            'tags' => 'array',
            'is_active' => 'boolean',
        ]);

        $node = Node::create($data);

        return response()->json($node, 201);
    }

    public function show(Node $node)
    {
        return $node;
    }

    public function update(Request $request, Node $node)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'type' => 'sometimes|required|in:VLESS,VMESS,SS,TROJAN,HYSTERIA,SHADOW_TLS',
            'address' => 'sometimes|required|string',
            'port' => 'sometimes|required|integer',
            'protocol_specific_config' => 'sometimes|required|array',
            'tags' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $node->update($data);

        return $node;
    }

    public function destroy(Node $node)
    {
        $node->delete();

        return response()->noContent();
    }
}
