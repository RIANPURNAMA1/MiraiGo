<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // Script & Vocabulary, Grammar, Reading, Listening
            $table->text('description')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->timestamps();

            $table->index(['package_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_sections');
    }
};
