<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Node;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Exception; // Added for explicit Exception handling

class NodeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Placeholder - to be implemented later
        return response()->json(['message' => 'Node index not implemented yet.']);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'config_url' => 'required|string',
            'name' => 'sometimes|string|max:255', // Optional: user can override name
            'tags' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $configUrl = $request->input('config_url');
        $nodeData = null;
        // $protocolType = null; // Not used in the provided snippet, can be removed or used for logging

        // Attempt to parse as VLESS
        if (Str::startsWith($configUrl, 'vless://')) {
            try {
                $parsedUrl = parse_url($configUrl);
                if (!$parsedUrl || empty($parsedUrl['host']) || empty($parsedUrl['port']) || empty($parsedUrl['user'])) {
                    throw new Exception('Invalid VLESS URI components');
                }

                $queryParams = [];
                if (isset($parsedUrl['query'])) {
                    parse_str($parsedUrl['query'], $queryParams);
                }

                $nodeData = [
                    'type' => 'VLESS',
                    'address' => $parsedUrl['host'],
                    'port' => (int)$parsedUrl['port'],
                    'protocol_specific_config' => [
                        'uuid' => $parsedUrl['user'], // UUID is in the user part
                        'encryption' => $queryParams['encryption'] ?? 'none',
                        'security' => $queryParams['security'] ?? null, // tls, xtls
                        'type' => $queryParams['type'] ?? null, // tcp, kcp, ws, http, quic
                        'flow' => $queryParams['flow'] ?? null,
                        'path' => $queryParams['path'] ?? null,
                        'host' => $queryParams['host'] ?? null, // 'host' is often used for HTTP headers in WS
                        'sni' => $queryParams['sni'] ?? $queryParams['host'] ?? null, // SNI for TLS
                        // Add other VLESS params as needed from query
                    ],
                    // Name: use provided 'name', then fragment, then auto-generate
                    'name' => $request->input('name', rawurldecode($parsedUrl['fragment'] ?? 'VLESS Node ' . Str::random(4))),
                ];
                // $protocolType = 'VLESS';
            } catch (Exception $e) {
                // Not a valid VLESS or parsing failed, try VMess
            }
        }

        // Attempt to parse as VMess (if not already parsed as VLESS)
        if (!$nodeData && Str::startsWith($configUrl, 'vmess://')) {
            try {
                $base64Json = Str::after($configUrl, 'vmess://');
                $decodedJson = base64_decode($base64Json);
                if ($decodedJson === false) {
                    throw new Exception('Invalid Base64 encoding for VMess config');
                }
                $vmessConfig = json_decode($decodedJson, true);
                if (json_last_error() !== JSON_ERROR_NONE || empty($vmessConfig['add']) || empty($vmessConfig['port']) || empty($vmessConfig['id'])) {
                    throw new Exception('Invalid VMess JSON structure or missing required fields');
                }

                $nodeData = [
                    'type' => 'VMESS',
                    'address' => $vmessConfig['add'],
                    'port' => (int)$vmessConfig['port'],
                    'protocol_specific_config' => [
                        'id' => $vmessConfig['id'], // UUID
                        'alterId' => $vmessConfig['aid'] ?? 0,
                        'security' => $vmessConfig['scy'] ?? $vmessConfig['security'] ?? 'auto', // 'security' is old, 'scy' is new
                        'net' => $vmessConfig['net'] ?? 'tcp', // tcp, kcp, ws, http, quic
                        'vmess_type' => $vmessConfig['type'] ?? 'none', // http, kcp, etc. (header type for obfuscation)
                        'host' => $vmessConfig['host'] ?? null,
                        'path' => $vmessConfig['path'] ?? null,
                        'tls' => $vmessConfig['tls'] ?? 'none', // 'tls' or 'none'
                        'sni' => $vmessConfig['sni'] ?? $vmessConfig['host'] ?? null,
                        'v' => $vmessConfig['v'] ?? '2', // Vmess version
                    ],
                    // Name: use provided 'name', then 'ps' or 'remarks' from config, then auto-generate
                    'name' => $request->input('name', $vmessConfig['ps'] ?? $vmessConfig['remarks'] ?? 'VMess Node ' . Str::random(4)),
                ];
                // $protocolType = 'VMESS';
            } catch (Exception $e) {
                // Parsing VMess failed
                 return response()->json(['error' => 'Failed to parse VMess configuration: ' . $e->getMessage()], 400);
            }
        }

        if (!$nodeData) {
            return response()->json(['error' => 'Unsupported or invalid node configuration URL. Only VLESS and VMess URIs are currently supported.'], 400);
        }

        // Merge optional user inputs that were not handled during initial parsing
        $nodeData['name'] = $request->input('name', $nodeData['name']); // Ensures request 'name' takes precedence if nodeData['name'] was set by fragment/ps
        $nodeData['tags'] = $request->input('tags', $nodeData['tags'] ?? []); // Default to empty array if not provided by request or parser
        $nodeData['is_active'] = $request->input('is_active', $nodeData['is_active'] ?? true); // Default to true

        $node = Node::create($nodeData);

        return response()->json($node, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Placeholder - to be implemented later
        // Example: $node = Node::findOrFail($id); return response()->json($node);
        return response()->json(['message' => "Node show method for id {$id} not implemented yet."]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Placeholder - to be implemented later
        return response()->json(['message' => "Node update method for id {$id} not implemented yet."]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Placeholder - to be implemented later
        // Example: $node = Node::findOrFail($id); $node->delete(); return response()->json(null, 204);
        return response()->json(['message' => "Node destroy method for id {$id} not implemented yet."]);
    }
}
