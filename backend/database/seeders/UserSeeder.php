<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find the ADMIN role, or SUPER_ADMIN if preferred
        $adminRole = Role::where('name', 'ADMIN')->first();
        if (!$adminRole) {
            // Fallback or error if ADMIN role not found
            $adminRole = Role::where('name', 'SUPER_ADMIN')->first();
        }
        if (!$adminRole) {
            $this->command->error('Admin role not found. Please run RoleSeeder first or ensure roles exist.');
            return;
        }

        // Create a default admin user if they don't exist
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'password' => Hash::make('password'), // Change this in a real environment!
                'role_id' => $adminRole->id,
                'is_active' => true,
                // 'name' field was removed, so not needed here
            ]
        );

        // Optionally, create some regular users
        $userRole = Role::where('name', 'USER')->first();
        if ($userRole) {
            User::firstOrCreate(
                ['email' => 'user@example.com'],
                [
                    'password' => Hash::make('password'),
                    'role_id' => $userRole->id,
                    'is_active' => true,
                ]
            );
        }
    }
}
