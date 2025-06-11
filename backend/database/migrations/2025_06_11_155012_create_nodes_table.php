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
        Schema::create('nodes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // Consider ENUM or specific validation later
            $table->string('address');
            $table->integer('port');
            $table->json('protocol_specific_config');
            $table->json('tags')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('status_verified_at')->nullable();
            $table->text('last_error_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nodes');
    }
};
