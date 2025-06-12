<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use App\Services\XrayService;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of all subscriptions.
     */
    public function index(Request $request)
    {
        $query = UserSubscription::with(['user', 'plan']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $subscriptions = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($subscriptions);
    }

    /**
     * Display the specified subscription.
     */
    public function show(UserSubscription $subscription)
    {
        return response()->json($subscription->load(['user', 'plan']));
    }

    /**
     * Approve a pending subscription.
     */
    public function approve(UserSubscription $subscription)
    {
        if ($subscription->status !== 'PENDING_APPROVAL') {
            return response()->json(['error' => 'Only pending subscriptions can be approved.'], 400);
        }

        $plan = $subscription->plan;
        $startDate = now();
        $endDate = $startDate->copy()->addDays($plan->duration_days);

        $subscription->update([
            'status' => 'ACTIVE',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_traffic_gb' => $plan->traffic_limit_gb,
        ]);

        // Add user to target user group if specified in plan
        if ($plan->target_user_group_id) {
            $subscription->user->userGroups()->syncWithoutDetaching([$plan->target_user_group_id]);
        }

        // Add user to all relevant nodes
        $this->addUserToNodes($subscription);

        return response()->json([
            'message' => 'Subscription approved successfully.',
            'subscription' => $subscription->load(['user', 'plan'])
        ]);
    }

    /**
     * Reject a pending subscription.
     */
    public function reject(UserSubscription $subscription)
    {
        if ($subscription->status !== 'PENDING_APPROVAL') {
            return response()->json(['error' => 'Only pending subscriptions can be rejected.'], 400);
        }

        $subscription->update(['status' => 'CANCELLED']);

        return response()->json([
            'message' => 'Subscription rejected successfully.',
            'subscription' => $subscription->load(['user', 'plan'])
        ]);
    }

    /**
     * Create a subscription for a user (admin action).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'plan_id' => 'required|exists:plans,id',
            'auto_approve' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $plan = \App\Models\Plan::findOrFail($request->plan_id);
        $autoApprove = $request->input('auto_approve', true);

        $subscription = UserSubscription::create([
            'user_id' => $request->user_id,
            'plan_id' => $plan->id,
            'total_traffic_gb' => $plan->traffic_limit_gb,
            'status' => $autoApprove ? 'ACTIVE' : 'PENDING_APPROVAL',
            'start_date' => $autoApprove ? now() : null,
            'end_date' => $autoApprove ? now()->addDays($plan->duration_days) : null,
        ]);

        if ($autoApprove && $plan->target_user_group_id) {
            $subscription->user->userGroups()->syncWithoutDetaching([$plan->target_user_group_id]);
        }

        return response()->json($subscription->load(['user', 'plan']), 201);
    }

    /**
     * Update the specified subscription.
     */
    public function update(Request $request, UserSubscription $subscription)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:PENDING_APPROVAL,ACTIVE,EXPIRED,CANCELLED',
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date|after:start_date',
            'used_traffic_gb' => 'sometimes|numeric|min:0',
            'current_device_count' => 'sometimes|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $subscription->update($validator->validated());

        return response()->json($subscription->load(['user', 'plan']));
    }

    /**
     * Remove the specified subscription.
     */
    public function destroy(UserSubscription $subscription)
    {
        $subscription->delete();
        return response()->json(null, 204);
    }
    
    /**
     * Add user to all nodes that match the subscription plan criteria.
     */
    private function addUserToNodes(UserSubscription $subscription)
    {
        $xrayService = app(XrayService::class);
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
        
        $nodes = $query->get();
        
        foreach ($nodes as $node) {
            $xrayService->addUserToNode($node, $subscription->user, $subscription);
        }
    }
}