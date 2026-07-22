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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('public_number')->unique();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('customer_name');
            $table->string('customer_email')->index();
            $table->string('customer_phone', 30)->nullable();
            $table->string('status')->default('awaiting_payment')->index();
            $table->string('payment_status')->default('pending')->index();
            $table->string('payment_method')->nullable()->index();
            $table->string('production_status')->default('not_started')->index();
            $table->unsignedInteger('subtotal_cents');
            $table->unsignedInteger('discount_cents')->default(0);
            $table->unsignedInteger('total_cents');
            $table->string('currency', 3)->default('BRL');
            $table->string('agreed_delivery')->nullable();
            $table->json('utm')->nullable();
            $table->string('lead_source')->nullable()->index();
            $table->string('entry_page', 2048)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('secure_access_token_hash', 128)->nullable()->unique();
            $table->timestamp('secure_access_expires_at')->nullable();
            $table->timestamp('terms_accepted_at')->nullable();
            $table->timestamp('paid_at')->nullable()->index();
            $table->timestamp('canceled_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->string('final_url', 2048)->nullable();
            $table->text('internal_notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['payment_status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
