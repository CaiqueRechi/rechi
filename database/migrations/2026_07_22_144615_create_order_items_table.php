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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('commercial_product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_type');
            $table->string('product_name');
            $table->string('product_slug');
            $table->string('short_description', 500);
            $table->text('description');
            $table->unsignedInteger('unit_price_cents');
            $table->unsignedInteger('discount_cents')->default(0);
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->unsignedInteger('subtotal_cents');
            $table->unsignedInteger('total_cents');
            $table->string('currency', 3)->default('BRL');
            $table->string('estimated_delivery')->nullable();
            $table->unsignedTinyInteger('max_sections')->nullable();
            $table->unsignedTinyInteger('revision_count')->default(0);
            $table->json('included_features');
            $table->json('excluded_features')->nullable();
            $table->timestamps();

            $table->index(['product_type', 'product_slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
