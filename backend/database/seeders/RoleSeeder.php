<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role; // Ensure Role model is imported
use Illuminate\Support\Facades\DB; // For timestamp

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now(); // For created_at and updated_at

        $roles = [
            ['name' => 'SUPER_ADMIN', 'description' => 'Super Administrator with all permissions', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'ADMIN', 'description' => 'Administrator with most permissions', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'USER', 'description' => 'Regular user with subscription access', 'created_at' => $now, 'updated_at' => $now],
        ];

        // Insert roles only if they don't exist
        foreach ($roles as $roleData) {
            Role::firstOrCreate(['name' => $roleData['name']], $roleData);
        }
    }
}
