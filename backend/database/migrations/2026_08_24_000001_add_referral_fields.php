<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('referral_code', 16)->nullable()->unique()->after('phone');
            $table->unsignedInteger('referral_bonus_days')->default(0)->after('referral_code');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('referred_by')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('referred_by');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['referral_code', 'referral_bonus_days']);
        });
    }
};
