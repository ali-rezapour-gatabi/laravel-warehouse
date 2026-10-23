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
            'first_name' => 'علی',
            'last_name' => 'رضاپور',
            'phone_number' => '09379534460',
            'role' => 'admin',
            'is_active' => true,
            'password' => bcrypt('123456'),
        ]);
    }
}
