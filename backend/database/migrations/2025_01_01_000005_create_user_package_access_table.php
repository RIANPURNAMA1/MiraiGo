<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_package_access', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['active', 'expired', 'revoked'])->default('active');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('expires_at')->nullable(); // null = lifetime access
            $table->timestamps();

            $table->unique(['user_id', 'package_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_package_access');
    }
};
