<?php

namespace App\Jobs;

use App\Models\UserSubscription;
use App\Models\Node;
use App\Services\XrayService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckExpiredSubscriptionsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(XrayService $xrayService)
    {
        Log::info("Checking for expired subscriptions");

        // Find subscriptions that have expired
        $expiredSubscriptions = UserSubscription::with(['user', 'plan'])
            ->where('status', 'ACTIVE')
            ->where('end_date', '<', now())
            ->get();

        foreach ($expiredSubscriptions as $subscription) {
            try {
                Log::info("Processing expired subscription for user: {$subscription->user->email}");

                // Remove user from all nodes
                $nodes = Node::where('is_active', true)->get();
                foreach ($nodes as $node) {
                    if ($this->shouldUseNode($subscription, $node)) {
                        $xrayService->removeUserFromNode($node, $subscription->user);
                    }
                }

                // Update subscription status
                $subscription->update(['status' => 'EXPIRED']);

                Log::info("Expired subscription processed for user: {$subscription->user->email}");

                // TODO: Send expiration notification to user

            } catch (\Exception $e) {
                Log::error("Failed to process expired subscription for user {$subscription->user->email}: " . $e->getMessage());
            }
        }

        Log::info("Completed checking expired subscriptions. Processed: " . $expiredSubscriptions->count());
    }

    private function shouldUseNode(UserSubscription $subscription, Node $node): bool
    {
        $criteria = $subscription->plan->node_selection_criteria;

        if (isset($criteria['tags']) && is_array($criteria['tags'])) {
            $nodeTags = $node->tags ?? [];
            $hasMatchingTag = !empty(array_intersect($criteria['tags'], $nodeTags));
            if (!$hasMatchingTag) {
                return false;
            }
        }

        if (isset($criteria['node_ids']) && is_array($criteria['node_ids'])) {
            if (!in_array($node->id, $criteria['node_ids'])) {
                return false;
            }
        }

        return true;
    }
}