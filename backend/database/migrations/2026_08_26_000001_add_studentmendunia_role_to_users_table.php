<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Pada MySQL kolom 'role' didefinisikan sebagai ENUM sehingga penambahan
        // nilai baru memerlukan ALTER. Pastikan 'studentmendunia' tersedia.
        // Driver lain (mis. SQLite yang dipakai saat testing) menyimpan nilai
        // sebagai string bebas sehingga tidak membutuhkan perubahan struktur.
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('student', 'admin', 'studentmendunia') DEFAULT 'student'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('student', 'admin') DEFAULT 'student'");
        }
    }
};
