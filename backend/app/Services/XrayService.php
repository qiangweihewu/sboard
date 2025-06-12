<?php

namespace App\Services;

use App\Models\Node;
use App\Models\UserSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class XrayService
{
    /**
     * Add a user to a specific node.
     */
    public function addUserToNode(Node $node, User $user, UserSubscription $subscription): bool
    {
        try {
            $userConfig = $this->generateUserConfig($node, $user, $subscription);
            
            // This would interact with Xray API or 3x-ui panel API
            // For now, we'll simulate the API call
            $response = $this->callNodeApi($node, 'POST', '/api/inbounds/addClient', $userConfig);
            
            Log::info("User {$user->email} added to node {$node->name}", [
                'node_id' => $node->id,
                'user_id' => $user->id,
                'subscription_id' => $subscription->id
            ]);
            
            return $response['success'] ?? false;
        } catch (Exception $e) {
            Log::error("Failed to add user to node: " . $e->getMessage(), [
                'node_id' => $node->id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Remove a user from a specific node.
     */
    public function removeUserFromNode(Node $node, User $user): bool
    {
        try {
            $response = $this->callNodeApi($node, 'DELETE', "/api/inbounds/client/{$user->email}");
            
            Log::info("User {$user->email} removed from node {$node->name}", [
                'node_id' => $node->id,
                'user_id' => $user->id
            ]);
            
            return $response['success'] ?? false;
        } catch (Exception $e) {
            Log::error("Failed to remove user from node: " . $e->getMessage(), [
                'node_id' => $node->id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get user traffic statistics from a node.
     */
    public function getUserTrafficStats(Node $node, User $user): array
    {
        try {
            $response = $this->callNodeApi($node, 'GET', "/api/inbounds/client/{$user->email}/stats");
            
            return [
                'uplink' => $response['data']['uplink'] ?? 0,
                'downlink' => $response['data']['downlink'] ?? 0,
                'total' => ($response['data']['uplink'] ?? 0) + ($response['data']['downlink'] ?? 0),
            ];
        } catch (Exception $e) {
            Log::error("Failed to get user traffic stats: " . $e->getMessage(), [
                'node_id' => $node->id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return ['uplink' => 0, 'downlink' => 0, 'total' => 0];
        }
    }

    /**
     * Get connected client IPs for a user.
     */
    public function getUserConnectedIPs(Node $node, User $user): array
    {
        try {
            $response = $this->callNodeApi($node, 'GET', "/api/inbounds/client/{$user->email}/ips");
            
            return $response['data']['ips'] ?? [];
        } catch (Exception $e) {
            Log::error("Failed to get user connected IPs: " . $e->getMessage(), [
                'node_id' => $node->id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Reset user traffic statistics.
     */
    public function resetUserTrafficStats(Node $node, User $user): bool
    {
        try {
            $response = $this->callNodeApi($node, 'POST', "/api/inbounds/client/{$user->email}/reset");
            
            Log::info("User {$user->email} traffic stats reset on node {$node->name}", [
                'node_id' => $node->id,
                'user_id' => $user->id
            ]);
            
            return $response['success'] ?? false;
        } catch (Exception $e) {
            Log::error("Failed to reset user traffic stats: " . $e->getMessage(), [
                'node_id' => $node->id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Check node health and connectivity.
     */
    public function checkNodeHealth(Node $node): array
    {
        try {
            $startTime = microtime(true);
            $response = $this->callNodeApi($node, 'GET', '/api/server/status');
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            
            return [
                'online' => true,
                'response_time' => $responseTime,
                'version' => $response['data']['version'] ?? 'unknown',
                'uptime' => $response['data']['uptime'] ?? 0,
            ];
        } catch (Exception $e) {
            Log::warning("Node health check failed: " . $e->getMessage(), [
                'node_id' => $node->id,
                'error' => $e->getMessage()
            ]);
            
            return [
                'online' => false,
                'response_time' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generate user configuration for a specific node.
     */
    private function generateUserConfig(Node $node, User $user, UserSubscription $subscription): array
    {
        $config = $node->protocol_specific_config;
        
        switch ($node->type) {
            case 'VLESS':
                return [
                    'email' => $user->email,
                    'id' => $config['uuid'],
                    'flow' => $config['flow'] ?? '',
                    'limitIp' => $subscription->plan->device_limit ?? 0,
                    'totalGB' => $subscription->total_traffic_gb * 1024 * 1024 * 1024, // Convert GB to bytes
                    'expiryTime' => $subscription->end_date ? $subscription->end_date->timestamp * 1000 : 0,
                ];
                
            case 'VMESS':
                return [
                    'email' => $user->email,
                    'id' => $config['id'],
                    'alterId' => $config['alterId'] ?? 0,
                    'limitIp' => $subscription->plan->device_limit ?? 0,
                    'totalGB' => $subscription->total_traffic_gb * 1024 * 1024 * 1024,
                    'expiryTime' => $subscription->end_date ? $subscription->end_date->timestamp * 1000 : 0,
                ];
                
            case 'TROJAN':
                return [
                    'email' => $user->email,
                    'password' => $config['password'],
                    'limitIp' => $subscription->plan->device_limit ?? 0,
                    'totalGB' => $subscription->total_traffic_gb * 1024 * 1024 * 1024,
                    'expiryTime' => $subscription->end_date ? $subscription->end_date->timestamp * 1000 : 0,
                ];
                
            case 'SHADOWSOCKS':
                return [
                    'email' => $user->email,
                    'method' => $config['method'],
                    'password' => $config['password'],
                    'limitIp' => $subscription->plan->device_limit ?? 0,
                    'totalGB' => $subscription->total_traffic_gb * 1024 * 1024 * 1024,
                    'expiryTime' => $subscription->end_date ? $subscription->end_date->timestamp * 1000 : 0,
                ];
                
            default:
                throw new Exception("Unsupported node type: {$node->type}");
        }
    }

    /**
     * Make API call to node (Xray API or 3x-ui panel API).
     */
    private function callNodeApi(Node $node, string $method, string $endpoint, array $data = []): array
    {
        // This is a placeholder implementation
        // In a real implementation, you would:
        // 1. Check if the node has API credentials stored
        // 2. Make HTTP requests to the node's API endpoint
        // 3. Handle authentication (API keys, tokens, etc.)
        // 4. Parse and return the response
        
        $apiUrl = $this->getNodeApiUrl($node);
        $headers = $this->getNodeApiHeaders($node);
        
        try {
            $response = Http::withHeaders($headers)
                ->timeout(30)
                ->retry(3, 1000);
                
            switch (strtoupper($method)) {
                case 'GET':
                    $httpResponse = $response->get($apiUrl . $endpoint);
                    break;
                case 'POST':
                    $httpResponse = $response->post($apiUrl . $endpoint, $data);
                    break;
                case 'PUT':
                    $httpResponse = $response->put($apiUrl . $endpoint, $data);
                    break;
                case 'DELETE':
                    $httpResponse = $response->delete($apiUrl . $endpoint);
                    break;
                default:
                    throw new Exception("Unsupported HTTP method: {$method}");
            }
            
            if (!$httpResponse->successful()) {
                throw new Exception("API call failed with status: {$httpResponse->status()}");
            }
            
            return $httpResponse->json();
            
        } catch (Exception $e) {
            // For development/testing, return mock data
            return $this->getMockApiResponse($method, $endpoint, $data);
        }
    }

    /**
     * Get API URL for a node.
     */
    private function getNodeApiUrl(Node $node): string
    {
        // In a real implementation, this would be stored in the node configuration
        // For now, assume standard 3x-ui panel port
        return "http://{$node->address}:2053";
    }

    /**
     * Get API headers for a node.
     */
    private function getNodeApiHeaders(Node $node): array
    {
        // In a real implementation, API credentials would be stored securely
        return [
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
            // 'Authorization' => 'Bearer ' . $node->api_token,
        ];
    }

    /**
     * Get mock API response for development/testing.
     */
    private function getMockApiResponse(string $method, string $endpoint, array $data = []): array
    {
        // Mock responses for development
        if (str_contains($endpoint, '/stats')) {
            return [
                'success' => true,
                'data' => [
                    'uplink' => rand(1000000, 10000000), // Random bytes
                    'downlink' => rand(10000000, 100000000),
                ]
            ];
        }
        
        if (str_contains($endpoint, '/ips')) {
            return [
                'success' => true,
                'data' => [
                    'ips' => [
                        '192.168.1.' . rand(1, 254),
                        '10.0.0.' . rand(1, 254),
                    ]
                ]
            ];
        }
        
        if (str_contains($endpoint, '/status')) {
            return [
                'success' => true,
                'data' => [
                    'version' => 'Xray 1.8.4',
                    'uptime' => rand(3600, 86400),
                ]
            ];
        }
        
        return ['success' => true, 'data' => []];
    }
}