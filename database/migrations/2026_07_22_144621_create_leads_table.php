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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type')->default('bug_fix')->index();
            $table->string('name');
            $table->string('email')->index();
            $table->string('phone', 30)->nullable();
            $table->string('technology')->nullable()->index();
            $table->text('problem_description')->nullable();
            $table->text('error_message')->nullable();
            $table->text('reproduction_steps')->nullable();
            $table->string('impact')->nullable()->index();
            $table->string('urgency')->nullable()->index();
            $table->unsignedInteger('available_budget_cents')->nullable();
            $table->string('url', 2048)->nullable();
            $table->string('status')->default('new')->index();
            $table->string('lead_source')->nullable()->index();
            $table->json('utm')->nullable();
            $table->string('entry_page', 2048)->nullable();
            $table->timestamp('consent_accepted_at')->nullable();
            $table->timestamps();

            $table->index(['type', 'status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
