<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();
            $table->dateTime('started_at');
            $table->dateTime('expires_at'); // server-authoritative: started_at + package.duration_minutes
            $table->timestamp('submitted_at')->nullable();
            $table->enum('status', ['in_progress', 'completed', 'expired', 'abandoned'])->default('in_progress');
            $table->decimal('score', 5, 2)->nullable(); // percentage
            $table->unsignedInteger('total_questions')->default(0);
            $table->unsignedInteger('correct_answers')->default(0);
            $table->unsignedInteger('wrong_answers')->default(0);
            $table->unsignedInteger('unanswered')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'package_id']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_attempts');
    }
};
