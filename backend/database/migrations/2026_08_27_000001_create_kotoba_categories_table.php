<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kotoba_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['JFT', 'SSW']);
            $table->unsignedInteger('total_words')->default(0);
            $table->unsignedInteger('total_packages')->default(0);
            $table->string('icon')->nullable();
            $table->string('color')->default('text-gray-700');
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kotoba_categories');
    }
};
