<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Node;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Exception;

class NodeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $nodes = Node::paginate($request->input('per_page', 15));
        return response()->json($nodes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'config_url' => 'required|string',
            'name' => 'sometimes|string|max:255',
            'tags' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $configUrl = $request->input('config_url');
        $nodeData = null;

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
                        'uuid' => $parsedUrl['user'],
                        'encryption' => $queryParams['encryption'] ?? 'none',
                        'security' => $queryParams['security'] ?? null,
                        'type' => $queryParams['type'] ?? null,
                        'flow' => $queryParams['flow'] ?? null,
                        'path' => $queryParams['path'] ?? null,
                        'host' => $queryParams['host'] ?? null,
                        'sni' => $queryParams['sni'] ?? $queryParams['host'] ?? null,
                    ],
                    'name' => $request->input('name', rawurldecode($parsedUrl['fragment'] ?? 'VLESS Node ' . Str::random(4))),
                ];
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
                        'id' => $vmessConfig['id'],
                        'alterId' => $vmessConfig['aid'] ?? 0,
                        'security' => $vmessConfig['scy'] ?? $vmessConfig['security'] ?? 'auto',
                        'net' => $vmessConfig['net'] ?? 'tcp',
                        'vmess_type' => $vmessConfig['type'] ?? 'none',
                        'host' => $vmessConfig['host'] ?? null,
                        'path' => $vmessConfig['path'] ?? null,
                        'tls' => $vmessConfig['tls'] ?? 'none',
                        'sni' => $vmessConfig['sni'] ?? $vmessConfig['host'] ?? null,
                        'v' => $vmessConfig['v'] ?? '2',
                    ],
                    'name' => $request->input('name', $vmessConfig['ps'] ?? $vmessConfig['remarks'] ?? 'VMess Node ' . Str::random(4)),
                ];
            } catch (Exception $e) {
                return response()->json(['error' => 'Failed to parse VMess configuration: ' . $e->getMessage()], 400);
            }
        }

        // Attempt to parse as Shadowsocks (if not already parsed)
        if (!$nodeData && Str::startsWith($configUrl, 'ss://')) {
            try {
                $ssUrl = Str::after($configUrl, 'ss://');
                
                // Handle different SS URL formats
                if (strpos($ssUrl, '@') !== false) {
                    // Format: ss://base64(method:password)@server:port#name
                    list($encodedAuth, $rest) = explode('@', $ssUrl, 2);
                    $decodedAuth = base64_decode($encodedAuth);
                    if ($decodedAuth === false) {
                        throw new Exception('Invalid Base64 encoding for Shadowsocks auth');
                    }
                    list($method, $password) = explode(':', $decodedAuth, 2);
                    
                    $serverPart = explode('#', $rest)[0];
                    list($server, $port) = explode(':', $serverPart);
                    $name = isset(explode('#', $rest)[1]) ? urldecode(explode('#', $rest)[1]) : 'SS Node ' . Str::random(4);
                } else {
                    // Format: ss://base64(method:password@server:port)#name
                    $parts = explode('#', $ssUrl);
                    $decodedConfig = base64_decode($parts[0]);
                    if ($decodedConfig === false) {
                        throw new Exception('Invalid Base64 encoding for Shadowsocks config');
                    }
                    
                    if (strpos($decodedConfig, '@') === false) {
                        throw new Exception('Invalid Shadowsocks URL format');
                    }
                    
                    list($methodPassword, $serverPort) = explode('@', $decodedConfig);
                    list($method, $password) = explode(':', $methodPassword, 2);
                    list($server, $port) = explode(':', $serverPort);
                    $name = isset($parts[1]) ? urldecode($parts[1]) : 'SS Node ' . Str::random(4);
                }
                
                $nodeData = [
                    'type' => 'SHADOWSOCKS',
                    'address' => $server,
                    'port' => (int)$port,
                    'protocol_specific_config' => [
                        'method' => $method,
                        'password' => $password,
                    ],
                    'name' => $request->input('name', $name),
                ];
            } catch (Exception $e) {
                return response()->json(['error' => 'Failed to parse Shadowsocks configuration: ' . $e->getMessage()], 400);
            }
        }
        
        // Attempt to parse as Trojan (if not already parsed)
        if (!$nodeData && Str::startsWith($configUrl, 'trojan://')) {
            try {
                $parsedUrl = parse_url($configUrl);
                if (!$parsedUrl || empty($parsedUrl['host']) || empty($parsedUrl['port']) || empty($parsedUrl['user'])) {
                    throw new Exception('Invalid Trojan URI components');
                }
                
                $queryParams = [];
                if (isset($parsedUrl['query'])) {
                    parse_str($parsedUrl['query'], $queryParams);
                }
                
                $nodeData = [
                    'type' => 'TROJAN',
                    'address' => $parsedUrl['host'],
                    'port' => (int)$parsedUrl['port'],
                    'protocol_specific_config' => [
                        'password' => $parsedUrl['user'],
                        'sni' => $queryParams['sni'] ?? $parsedUrl['host'],
                        'type' => $queryParams['type'] ?? 'tcp',
                        'security' => $queryParams['security'] ?? 'tls',
                        'path' => $queryParams['path'] ?? null,
                        'host' => $queryParams['host'] ?? null,
                        'alpn' => $queryParams['alpn'] ?? null,
                    ],
                    'name' => $request->input('name', rawurldecode($parsedUrl['fragment'] ?? 'Trojan Node ' . Str::random(4))),
                ];
            } catch (Exception $e) {
                return response()->json(['error' => 'Failed to parse Trojan configuration: ' . $e->getMessage()], 400);
            }
        }

        if (!$nodeData) {
            return response()->json(['error' => 'Unsupported or invalid node configuration URL. Supported protocols: VLESS, VMess, Shadowsocks, Trojan.'], 400);
        }

        $nodeData['name'] = $request->input('name', $nodeData['name']);
        $nodeData['tags'] = $request->input('tags', $nodeData['tags'] ?? []);
        $nodeData['is_active'] = $request->input('is_active', $nodeData['is_active'] ?? true);

        $node = Node::create($nodeData);

        return response()->json($node, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Node $node)
    {
        return response()->json($node);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Node $node)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'tags' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $node->update($validator->validated());

        return response()->json($node);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Node $node)
    {
        $node->delete();
        return response()->json(null, 204);
    }
}