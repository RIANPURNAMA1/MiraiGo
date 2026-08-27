<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kotoba', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('kotoba_categories')->cascadeOnDelete();
            $table->string('japanese');
            $table->string('reading')->nullable();
            $table->string('meaning');
            $table->string('example_sentence')->nullable();
            $table->string('example_translation')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kotoba');
    }
};
