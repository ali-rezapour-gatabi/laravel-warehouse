<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'Admin',
            'phone_number' => '09123456789',
            'role' => 'admin',
            'is_active' => true,
            'password' => bcrypt('123456'),
        ]);
    }
}
