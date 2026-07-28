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
        Schema::create('cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('board_id')->constrained()->cascadeOnDelete();
            $table->foreignId('board_column_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('priority', 20)->default('medium');
            $table->timestamp('starts_at')->nullable()->index();
            $table->timestamp('due_at')->nullable()->index();
            $table->timestamp('completed_at')->nullable()->index();
            $table->unsignedInteger('position');
            $table->timestamp('archived_at')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['board_column_id', 'position']);
            $table->index(['board_id', 'archived_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cards');
    }
};
