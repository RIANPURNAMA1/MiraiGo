<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained('package_sections')->cascadeOnDelete();
            $table->text('question_text');
            $table->string('image')->nullable();
            $table->string('audio')->nullable();
            $table->text('explanation')->nullable();
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->unsignedInteger('score')->default(1);
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->index(['section_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
