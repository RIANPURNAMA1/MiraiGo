<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('module_premium_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('amount')->default(0);
            $table->string('proof_image')->nullable();
            $table->text('notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->enum('status', ['pending', 'paid', 'failed'])->default('pending');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('module_premium_payments');
    }
};
