<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\TrafficLog;
use App\Models\UserSubscription;
use App\Models\Node;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrafficController extends Controller
{
    /**
     * Get traffic statistics overview.
     */
    public function overview(Request $request)
    {
        $period = $request->input('period', '7d'); // 1d, 7d, 30d
        $startDate = $this->getStartDate($period);

        $stats = [
            'total_traffic' => $this->getTotalTraffic($startDate),
            'active_users' => $this->getActiveUsers($startDate),
            'top_users' => $this->getTopUsers($startDate, 10),
            'node_usage' => $this->getNodeUsage($startDate),
            'daily_traffic' => $this->getDailyTraffic($startDate),
        ];

        return response()->json($stats);
    }

    /**
     * Get traffic logs with filtering.
     */
    public function logs(Request $request)
    {
        $query = TrafficLog::with(['userSubscription.user', 'node'])
            ->orderBy('recorded_at', 'desc');

        // Filter by user
        if ($request->has('user_id')) {
            $query->whereHas('userSubscription', function ($q) use ($request) {
                $q->where('user_id', $request->user_id);
            });
        }

        // Filter by node
        if ($request->has('node_id')) {
            $query->where('node_id', $request->node_id);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('recorded_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('recorded_at', '<=', $request->end_date);
        }

        $logs = $query->paginate($request->input('per_page', 50));

        return response()->json($logs);
    }

    /**
     * Get user traffic summary.
     */
    public function userSummary(Request $request, $userId)
    {
        $period = $request->input('period', '30d');
        $startDate = $this->getStartDate($period);

        $subscription = UserSubscription::with(['user', 'plan'])
            ->where('user_id', $userId)
            ->where('status', 'ACTIVE')
            ->first();

        if (!$subscription) {
            return response()->json(['error' => 'No active subscription found for user'], 404);
        }

        $trafficLogs = TrafficLog::where('user_subscription_id', $subscription->id)
            ->where('recorded_at', '>=', $startDate)
            ->get();

        $summary = [
            'user' => $subscription->user,
            'subscription' => $subscription,
            'total_uplink' => $trafficLogs->sum('uplink_bytes'),
            'total_downlink' => $trafficLogs->sum('downlink_bytes'),
            'total_traffic' => $trafficLogs->sum('uplink_bytes') + $trafficLogs->sum('downlink_bytes'),
            'usage_by_node' => $this->getUsageByNode($trafficLogs),
            'daily_usage' => $this->getDailyUsage($trafficLogs),
        ];

        return response()->json($summary);
    }

    private function getStartDate($period)
    {
        switch ($period) {
            case '1d':
                return now()->subDay();
            case '7d':
                return now()->subWeek();
            case '30d':
                return now()->subMonth();
            default:
                return now()->subWeek();
        }
    }

    private function getTotalTraffic($startDate)
    {
        return TrafficLog::where('recorded_at', '>=', $startDate)
            ->selectRaw('SUM(uplink_bytes + downlink_bytes) as total')
            ->value('total') ?? 0;
    }

    private function getActiveUsers($startDate)
    {
        return TrafficLog::where('recorded_at', '>=', $startDate)
            ->distinct('user_subscription_id')
            ->count('user_subscription_id');
    }

    private function getTopUsers($startDate, $limit)
    {
        return TrafficLog::with(['userSubscription.user'])
            ->where('recorded_at', '>=', $startDate)
            ->select('user_subscription_id')
            ->selectRaw('SUM(uplink_bytes + downlink_bytes) as total_traffic')
            ->groupBy('user_subscription_id')
            ->orderBy('total_traffic', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($log) {
                return [
                    'user' => $log->userSubscription->user,
                    'total_traffic' => $log->total_traffic,
                    'total_gb' => round($log->total_traffic / (1024 * 1024 * 1024), 2),
                ];
            });
    }

    private function getNodeUsage($startDate)
    {
        return TrafficLog::with('node')
            ->where('recorded_at', '>=', $startDate)
            ->select('node_id')
            ->selectRaw('SUM(uplink_bytes + downlink_bytes) as total_traffic')
            ->selectRaw('COUNT(DISTINCT user_subscription_id) as unique_users')
            ->groupBy('node_id')
            ->get()
            ->map(function ($log) {
                return [
                    'node' => $log->node,
                    'total_traffic' => $log->total_traffic,
                    'total_gb' => round($log->total_traffic / (1024 * 1024 * 1024), 2),
                    'unique_users' => $log->unique_users,
                ];
            });
    }

    private function getDailyTraffic($startDate)
    {
        return TrafficLog::where('recorded_at', '>=', $startDate)
            ->selectRaw('DATE(recorded_at) as date')
            ->selectRaw('SUM(uplink_bytes + downlink_bytes) as total_traffic')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($log) {
                return [
                    'date' => $log->date,
                    'total_traffic' => $log->total_traffic,
                    'total_gb' => round($log->total_traffic / (1024 * 1024 * 1024), 2),
                ];
            });
    }

    private function getUsageByNode($trafficLogs)
    {
        return $trafficLogs->groupBy('node_id')->map(function ($logs, $nodeId) {
            $node = Node::find($nodeId);
            return [
                'node' => $node,
                'total_traffic' => $logs->sum('uplink_bytes') + $logs->sum('downlink_bytes'),
                'uplink' => $logs->sum('uplink_bytes'),
                'downlink' => $logs->sum('downlink_bytes'),
            ];
        })->values();
    }

    private function getDailyUsage($trafficLogs)
    {
        return $trafficLogs->groupBy(function ($log) {
            return $log->recorded_at->format('Y-m-d');
        })->map(function ($logs, $date) {
            return [
                'date' => $date,
                'total_traffic' => $logs->sum('uplink_bytes') + $logs->sum('downlink_bytes'),
                'uplink' => $logs->sum('uplink_bytes'),
                'downlink' => $logs->sum('downlink_bytes'),
            ];
        })->values();
    }
}