<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category')->nullable(); // e.g. JFT, SSW
            $table->text('description')->nullable();
            $table->string('level')->nullable(); // A1, A2, N4 style
            $table->unsignedInteger('duration_minutes')->default(60);
            $table->unsignedBigInteger('price')->default(0);
            $table->boolean('is_premium')->default(false);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->string('thumbnail')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
