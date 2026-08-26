<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained('package_sections')->cascadeOnDelete();
            $table->unsignedInteger('attempts_count')->default(0);
            $table->decimal('best_score', 5, 2)->default(0);
            $table->decimal('last_score', 5, 2)->default(0);
            $table->decimal('average_score', 5, 2)->default(0);
            $table->timestamp('last_attempted_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'section_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_progress');
    }
};
