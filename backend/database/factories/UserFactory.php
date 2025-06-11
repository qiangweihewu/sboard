<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'is_active' => true,
            // 'role_id' => null, // Example: can be set via a state or directly in tests
        ];
    }

    // Optional: Add a state to assign a specific role if needed frequently
    // public function withRole(string $roleName = 'USER'): static
    // {
    //     return $this->state(function (array $attributes) use ($roleName) {
    //         $role = \App\Models\Role::where('name', $roleName)->first();
    //         return [
    //             'role_id' => $role ? $role->id : null,
    //         ];
    //     });
    // }
}
