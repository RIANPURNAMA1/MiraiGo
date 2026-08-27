<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kotoba_topic_word', function (Blueprint $table) {
            $table->foreignId('topic_id')->constrained('kotoba_topics')->cascadeOnDelete();
            $table->foreignId('kotoba_id')->constrained('kotoba')->cascadeOnDelete();
            $table->primary(['topic_id', 'kotoba_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kotoba_topic_word');
    }
};
