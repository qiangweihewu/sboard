<?php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Models\UserSubscription;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of the user's subscriptions.
     */
    public function index()
    {
        $subscriptions = UserSubscription::with('plan')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $subscriptions]);
    }

    /**
     * Request a new subscription.
     */
    public function request(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan_id' => 'required|exists:plans,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $plan = Plan::findOrFail($request->plan_id);

        if (!$plan->is_active) {
            return response()->json(['error' => 'This plan is not available for subscription.'], 400);
        }

        // Check if user already has a pending or active subscription for this plan
        $existingSubscription = UserSubscription::where('user_id', Auth::id())
            ->where('plan_id', $plan->id)
            ->whereIn('status', ['PENDING_APPROVAL', 'ACTIVE'])
            ->first();

        if ($existingSubscription) {
            return response()->json(['error' => 'You already have a pending or active subscription for this plan.'], 400);
        }

        $subscription = UserSubscription::create([
            'user_id' => Auth::id(),
            'plan_id' => $plan->id,
            'total_traffic_gb' => $plan->traffic_limit_gb,
            'status' => 'PENDING_APPROVAL',
        ]);

        return response()->json($subscription->load('plan'), 201);
    }

    /**
     * Display the specified subscription.
     */
    public function show(UserSubscription $subscription)
    {
        if ($subscription->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($subscription->load('plan'));
    }

    /**
     * Cancel a pending subscription request.
     */
    public function destroy(UserSubscription $subscription)
    {
        if ($subscription->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($subscription->status !== 'PENDING_APPROVAL') {
            return response()->json(['error' => 'Only pending subscriptions can be cancelled.'], 400);
        }

        $subscription->update(['status' => 'CANCELLED']);

        return response()->json(['message' => 'Subscription request cancelled successfully.']);
    }
}