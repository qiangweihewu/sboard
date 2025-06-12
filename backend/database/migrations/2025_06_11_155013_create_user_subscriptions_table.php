<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('plan_id')->constrained('plans')->onDelete('restrict');
            $table->datetime('start_date')->nullable();
            $table->datetime('end_date')->nullable();
            $table->decimal('total_traffic_gb', 10, 2)->default(0);
            $table->decimal('used_traffic_gb', 10, 2)->default(0);
            $table->integer('current_device_count')->default(0);
            $table->string('subscription_token', 64)->unique()->nullable();
            $table->enum('status', ['PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PAYMENT_PENDING'])->default('PENDING_APPROVAL');
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('subscription_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_subscriptions');
    }
};