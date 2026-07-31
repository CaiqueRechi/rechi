<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 140)->unique();
            $table->string('type', 40)->index();
            $table->text('description')->nullable();
            $table->json('config');
            $table->boolean('is_active')->default(true)->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('managed_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_profile_id')->constrained()->cascadeOnDelete();
            $table->string('label', 120)->nullable();
            $table->text('device_uuid');
            $table->char('device_uuid_hash', 64)->unique();
            $table->date('first_connection_date')->nullable();
            $table->timestamp('last_connected_at')->nullable();
            $table->char('last_token_jti_hash', 64)->nullable();
            $table->timestamp('revoked_at')->nullable()->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['device_profile_id', 'revoked_at']);
        });

        Schema::create('device_profile_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('device_profile_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('managed_device_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 80);
            $table->json('before')->nullable();
            $table->json('after')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['device_profile_id', 'created_at']);
            $table->index(['managed_device_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_profile_audits');
        Schema::dropIfExists('managed_devices');
        Schema::dropIfExists('device_profiles');
    }
};
