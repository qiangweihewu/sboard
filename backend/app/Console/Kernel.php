<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Collect traffic data every 5 minutes
        $schedule->command('traffic:collect')
            ->everyFiveMinutes()
            ->withoutOverlapping()
            ->runInBackground();

        // Check for expired subscriptions every hour
        $schedule->command('subscriptions:check-expired')
            ->hourly()
            ->withoutOverlapping();

        // Health check nodes every 10 minutes
        $schedule->command('nodes:health-check')
            ->everyTenMinutes()
            ->withoutOverlapping()
            ->runInBackground();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}