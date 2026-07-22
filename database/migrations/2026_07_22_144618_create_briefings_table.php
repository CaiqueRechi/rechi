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
        Schema::create('briefings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('status')->default('pending')->index();
            $table->string('company_name')->nullable();
            $table->string('segment')->nullable();
            $table->string('goal')->nullable();
            $table->text('target_audience')->nullable();
            $table->text('products_or_services')->nullable();
            $table->text('main_call_to_action')->nullable();
            $table->text('available_copy')->nullable();
            $table->string('preferred_colors')->nullable();
            $table->json('references')->nullable();
            $table->string('whatsapp', 30)->nullable();
            $table->string('contact_email')->nullable();
            $table->string('domain')->nullable();
            $table->json('social_links')->nullable();
            $table->json('desired_integrations')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('submitted_at')->nullable()->index();
            $table->timestamps();

            $table->unique('order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('briefings');
    }
};
