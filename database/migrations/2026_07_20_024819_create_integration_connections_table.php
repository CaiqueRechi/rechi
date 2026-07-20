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
        Schema::create('integration_connections', function (Blueprint $table) {
            $table->id();
            $table->string('provider')->unique();
            $table->longText('credentials')->nullable();
            $table->string('status')->default('disconnected')->index();
            $table->string('account_id')->nullable();
            $table->string('account_name')->nullable();
            $table->string('account_avatar_url', 2048)->nullable();
            $table->timestamp('connected_at')->nullable()->index();
            $table->timestamp('last_synced_at')->nullable()->index();
            $table->text('last_error')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('integration_connections');
    }
};
