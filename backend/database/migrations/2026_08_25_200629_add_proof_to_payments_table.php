<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('proof_image')->nullable()->after('meta');
            $table->text('notes')->nullable()->after('proof_image');
            $table->text('admin_notes')->nullable()->after('notes');
            $table->timestamp('reviewed_at')->nullable()->after('admin_notes');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->text('admin_notes')->nullable()->after('paid_at');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['proof_image', 'notes', 'admin_notes', 'reviewed_at']);
        });
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('admin_notes');
        });
    }
};
