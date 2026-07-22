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
        Schema::create('commercial_products', function (Blueprint $table) {
            $table->id();
            $table->string('type')->default('landing_page')->index();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('short_description', 500);
            $table->text('description');
            $table->unsignedInteger('price_cents');
            $table->unsignedInteger('promotional_price_cents')->nullable();
            $table->string('currency', 3)->default('BRL');
            $table->string('estimated_delivery');
            $table->unsignedTinyInteger('max_sections')->nullable();
            $table->json('included_features');
            $table->json('excluded_features')->nullable();
            $table->unsignedTinyInteger('revision_count')->default(1);
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->string('cover_image_path')->nullable();
            $table->json('gallery_image_paths')->nullable();
            $table->string('category')->nullable()->index();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->string('seo_title')->nullable();
            $table->string('seo_description', 320)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commercial_products');
    }
};
