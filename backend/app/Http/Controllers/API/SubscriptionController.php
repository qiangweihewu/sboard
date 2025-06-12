<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\UserSubscription;
use App\Models\Node;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    /**
     * Get subscription configuration by token.
     */
    public function getSubscription($token)
    {
        $subscription = UserSubscription::with(['user', 'plan'])
            ->where('subscription_token', $token)
            ->first();

        if (!$subscription) {
            return response('Subscription not found', 404);
        }

        if (!$subscription->isActive()) {
            return response('Subscription is not active', 403);
        }

        // Get nodes based on plan's node selection criteria
        $nodes = $this->getNodesForSubscription($subscription);

        if ($nodes->isEmpty()) {
            return response('No nodes available for this subscription', 404);
        }

        // Generate subscription content (Base64 encoded node list)
        $nodeConfigs = $this->generateNodeConfigs($nodes);
        $subscriptionContent = base64_encode(implode("\n", $nodeConfigs));

        return response($subscriptionContent)
            ->header('Content-Type', 'text/plain; charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="subscription.txt"')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }

    /**
     * Get nodes for a subscription based on plan criteria.
     */
    private function getNodesForSubscription(UserSubscription $subscription)
    {
        $criteria = $subscription->plan->node_selection_criteria;
        
        $query = Node::where('is_active', true);

        if (isset($criteria['tags']) && is_array($criteria['tags'])) {
            $query->where(function ($q) use ($criteria) {
                foreach ($criteria['tags'] as $tag) {
                    $q->orWhereJsonContains('tags', $tag);
                }
            });
        }

        if (isset($criteria['node_ids']) && is_array($criteria['node_ids'])) {
            $query->whereIn('id', $criteria['node_ids']);
        }

        return $query->get();
    }

    /**
     * Generate node configuration strings.
     */
    private function generateNodeConfigs($nodes)
    {
        $configs = [];

        foreach ($nodes as $node) {
            $config = $this->generateNodeConfig($node);
            if ($config) {
                $configs[] = $config;
            }
        }

        return $configs;
    }

    /**
     * Generate configuration string for a single node.
     */
    private function generateNodeConfig(Node $node)
    {
        switch ($node->type) {
            case 'VLESS':
                return $this->generateVlessConfig($node);
            case 'VMESS':
                return $this->generateVmessConfig($node);
            case 'SHADOWSOCKS':
                return $this->generateShadowsocksConfig($node);
            case 'TROJAN':
                return $this->generateTrojanConfig($node);
            default:
                return null;
        }
    }

    /**
     * Generate VLESS configuration string.
     */
    private function generateVlessConfig(Node $node)
    {
        $config = $node->protocol_specific_config;
        
        $params = [
            'encryption' => $config['encryption'] ?? 'none',
            'security' => $config['security'] ?? 'none',
            'type' => $config['type'] ?? 'tcp',
        ];

        if (isset($config['flow'])) {
            $params['flow'] = $config['flow'];
        }
        if (isset($config['path'])) {
            $params['path'] = $config['path'];
        }
        if (isset($config['host'])) {
            $params['host'] = $config['host'];
        }
        if (isset($config['sni'])) {
            $params['sni'] = $config['sni'];
        }

        $queryString = http_build_query($params);
        $fragment = urlencode($node->name);

        return "vless://{$config['uuid']}@{$node->address}:{$node->port}?{$queryString}#{$fragment}";
    }

    /**
     * Generate VMess configuration string.
     */
    private function generateVmessConfig(Node $node)
    {
        $config = $node->protocol_specific_config;
        
        $vmessConfig = [
            'v' => $config['v'] ?? '2',
            'ps' => $node->name,
            'add' => $node->address,
            'port' => $node->port,
            'id' => $config['id'],
            'aid' => $config['alterId'] ?? 0,
            'scy' => $config['security'] ?? 'auto',
            'net' => $config['net'] ?? 'tcp',
            'type' => $config['vmess_type'] ?? 'none',
            'host' => $config['host'] ?? '',
            'path' => $config['path'] ?? '',
            'tls' => $config['tls'] ?? 'none',
            'sni' => $config['sni'] ?? '',
        ];

        $jsonConfig = json_encode($vmessConfig);
        $base64Config = base64_encode($jsonConfig);

        return "vmess://{$base64Config}";
    }
    
    /**
     * Generate Shadowsocks configuration string.
     */
    private function generateShadowsocksConfig(Node $node)
    {
        $config = $node->protocol_specific_config;
        
        $auth = base64_encode($config['method'] . ':' . $config['password']);
        $fragment = urlencode($node->name);
        
        return "ss://{$auth}@{$node->address}:{$node->port}#{$fragment}";
    }
    
    /**
     * Generate Trojan configuration string.
     */
    private function generateTrojanConfig(Node $node)
    {
        $config = $node->protocol_specific_config;
        
        $params = [
            'security' => $config['security'] ?? 'tls',
            'type' => $config['type'] ?? 'tcp',
        ];
        
        if (isset($config['sni'])) {
            $params['sni'] = $config['sni'];
        }
        if (isset($config['path'])) {
            $params['path'] = $config['path'];
        }
        if (isset($config['host'])) {
            $params['host'] = $config['host'];
        }
        if (isset($config['alpn'])) {
            $params['alpn'] = $config['alpn'];
        }
        
        $queryString = http_build_query($params);
        $fragment = urlencode($node->name);
        
        return "trojan://{$config['password']}@{$node->address}:{$node->port}?{$queryString}#{$fragment}";
    }
}