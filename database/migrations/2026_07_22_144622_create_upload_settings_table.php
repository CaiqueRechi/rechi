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
        Schema::create('upload_settings', function (Blueprint $table) {
            $table->id();
            $table->string('context')->default('briefing')->unique();
            $table->json('allowed_mime_types');
            $table->json('allowed_extensions');
            $table->unsignedInteger('max_file_size_kb');
            $table->unsignedInteger('max_total_size_kb');
            $table->unsignedSmallInteger('max_files_per_briefing');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('upload_settings');
    }
};
