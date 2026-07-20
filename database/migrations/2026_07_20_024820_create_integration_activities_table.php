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
        Schema::create('integration_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('integration_connection_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->index();
            $table->string('external_id');
            $table->string('activity_type')->index();
            $table->json('payload');
            $table->timestamp('occurred_at')->index();
            $table->timestamps();
            $table->unique(['integration_connection_id', 'external_id', 'activity_type'], 'integration_activity_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('integration_activities');
    }
};
