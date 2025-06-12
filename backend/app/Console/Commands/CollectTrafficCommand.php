<?php

namespace App\Console\Commands;

use App\Jobs\CollectTrafficDataJob;
use App\Models\Node;
use Illuminate\Console\Command;

class CollectTrafficCommand extends Command
{
    protected $signature = 'traffic:collect {--node-id= : Specific node ID to collect from}';
    protected $description = 'Collect traffic data from Xray nodes';

    public function handle()
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

        $this->info("Starting traffic collection for " . $nodes->count() . " node(s)");

        foreach ($nodes as $node) {
            $this->info("Dispatching traffic collection job for node: {$node->name}");
            CollectTrafficDataJob::dispatch($node);
        }

        $this->info("Traffic collection jobs dispatched successfully");
        return 0;
    }
}