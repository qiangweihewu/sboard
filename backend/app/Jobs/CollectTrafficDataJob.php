<?php

namespace App\Jobs;

use App\Models\Node;
use App\Models\UserSubscription;
use App\Models\TrafficLog;
use App\Services\XrayService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CollectTrafficDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $node;

    public function __construct(Node $node)
    {
        $this->node = $node;
    }

    public function handle(XrayService $xrayService)
    {
        Log::info("Starting traffic collection for node: {$this->node->name}");

        // Get all active subscriptions that should use this node
        $activeSubscriptions = UserSubscription::with(['user', 'plan'])
            ->where('status', 'ACTIVE')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->get();

        foreach ($activeSubscriptions as $subscription) {
            // Check if this subscription should use this node based on plan criteria
            if (!$this->shouldUseNode($subscription, $this->node)) {
                continue;
            }

            try {
                // Get traffic stats from the node
                $stats = $xrayService->getUserTrafficStats($this->node, $subscription->user);
                
                if ($stats['total'] > 0) {
                    // Record traffic log
                    TrafficLog::create([
                        'user_subscription_id' => $subscription->id,
                        'node_id' => $this->node->id,
                        'uplink_bytes' => $stats['uplink'],
                        'downlink_bytes' => $stats['downlink'],
                        'recorded_at' => now(),
                    ]);

                    // Update subscription usage
                    $totalGb = $stats['total'] / (1024 * 1024 * 1024);
                    $subscription->increment('used_traffic_gb', $totalGb);

                    // Check if user exceeded traffic limit
                    if ($subscription->used_traffic_gb >= $subscription->total_traffic_gb) {
                        $this->handleTrafficLimitExceeded($subscription, $xrayService);
                    }
                }

                // Check device limit
                $connectedIPs = $xrayService->getUserConnectedIPs($this->node, $subscription->user);
                $deviceCount = count($connectedIPs);
                
                if ($deviceCount > $subscription->plan->device_limit) {
                    $this->handleDeviceLimitExceeded($subscription, $xrayService);
                }

                // Update current device count
                $subscription->update(['current_device_count' => $deviceCount]);

            } catch (\Exception $e) {
                Log::error("Failed to collect traffic data for user {$subscription->user->email} on node {$this->node->name}: " . $e->getMessage());
            }
        }

        Log::info("Completed traffic collection for node: {$this->node->name}");
    }

    private function shouldUseNode(UserSubscription $subscription, Node $node): bool
    {
        $criteria = $subscription->plan->node_selection_criteria;

        // Check tags
        if (isset($criteria['tags']) && is_array($criteria['tags'])) {
            $nodeTags = $node->tags ?? [];
            $hasMatchingTag = !empty(array_intersect($criteria['tags'], $nodeTags));
            if (!$hasMatchingTag) {
                return false;
            }
        }

        // Check specific node IDs
        if (isset($criteria['node_ids']) && is_array($criteria['node_ids'])) {
            if (!in_array($node->id, $criteria['node_ids'])) {
                return false;
            }
        }

        return true;
    }

    private function handleTrafficLimitExceeded(UserSubscription $subscription, XrayService $xrayService)
    {
        Log::warning("Traffic limit exceeded for user {$subscription->user->email}");

        // Remove user from all nodes
        $nodes = Node::where('is_active', true)->get();
        foreach ($nodes as $node) {
            if ($this->shouldUseNode($subscription, $node)) {
                $xrayService->removeUserFromNode($node, $subscription->user);
            }
        }

        // Update subscription status
        $subscription->update(['status' => 'EXPIRED']);

        // TODO: Send notification to user
    }

    private function handleDeviceLimitExceeded(UserSubscription $subscription, XrayService $xrayService)
    {
        Log::warning("Device limit exceeded for user {$subscription->user->email}");

        // TODO: Implement device limit enforcement
        // This could involve:
        // 1. Disconnecting oldest connections
        // 2. Temporarily blocking new connections
        // 3. Sending warning to user
    }
}