<?php

namespace App\Console\Commands;

use App\Jobs\CheckExpiredSubscriptionsJob;
use Illuminate\Console\Command;

class CheckExpiredCommand extends Command
{
    protected $signature = 'subscriptions:check-expired';
    protected $description = 'Check and process expired subscriptions';

    public function handle()
    {
        $this->info("Checking for expired subscriptions...");
        
        CheckExpiredSubscriptionsJob::dispatch();
        
        $this->info("Expired subscription check job dispatched successfully");
        return 0;
    }
}