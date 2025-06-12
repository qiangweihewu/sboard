<?php

namespace App\Console\Commands;

use App\Models\Node;
use App\Services\XrayService;
use Illuminate\Console\Command;

class NodeHealthCheckCommand extends Command
{
    protected $signature = 'nodes:health-check {--node-id= : Specific node ID to check}';
    protected $description = 'Check health status of Xray nodes';

    public function handle(XrayService $xrayService)
    {
        $nodeId = $this->option('node-id');

        if ($nodeId) {
            $node = Node::find($nodeId);
            if (!$node) {
                $this->error("Node with ID {$nodeId} not found");
                return 1;
            }
            $nodes = collect([$node]);
        } else {
            $nodes = Node::where('is_active', true)->get();
        }

        $this->info("Checking health for " . $nodes->count() . " node(s)");

        $healthResults = [];

        foreach ($nodes as $node) {
            $this->info("Checking node: {$node->name} ({$node->address}:{$node->port})");
            
            $health = $xrayService->checkNodeHealth($node);
            $healthResults[] = [
                'node' => $node->name,
                'status' => $health['online'] ? 'Online' : 'Offline',
                'response_time' => $health['response_time'] ? $health['response_time'] . 'ms' : 'N/A',
                'error' => $health['error'] ?? '',
            ];

            // Update node status
            $node->update([
                'status_verified_at' => now(),
                'last_error_message' => $health['error'] ?? null,
            ]);
        }

        // Display results table
        $this->table(
            ['Node', 'Status', 'Response Time', 'Error'],
            $healthResults
        );

        return 0;
    }
}