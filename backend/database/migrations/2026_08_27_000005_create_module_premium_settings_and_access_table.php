<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('module_premium_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('premium_price')->default(0);
            $table->text('premium_description')->nullable();
            $table->timestamps();
        });

        Schema::create('module_premium_access', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('amount_paid')->default(0);
            $table->timestamp('purchased_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('module_premium_access');
        Schema::dropIfExists('module_premium_settings');
    }
};
