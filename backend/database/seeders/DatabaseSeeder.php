<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin MiraiGo',
            'username' => 'admin',
            'email' => 'admin@miraigo.test',
            'password' => Hash::make('Admin123!'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Rian Pratama',
            'username' => 'rian',
            'email' => 'student@miraigo.test',
            'password' => Hash::make('password'),
            'role' => 'student',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Student Mendunia',
            'username' => 'mendunia',
            'email' => 'mendunia@miraigo.test',
            'password' => Hash::make('password'),
            'role' => 'studentmendunia',
            'status' => 'active',
        ]);

        $this->call([
            JftPackageSeeder::class,
            AnnouncementSeeder::class,
            CategorySeeder::class,
            ModuleCategorySeeder::class,
            KotobaCategorySeeder::class,
            KotobaSampleSeeder::class,
        ]);
    }
}
