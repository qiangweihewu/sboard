<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase; // Use RefreshDatabase to reset DB for each test
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Role; // Needed if default role assignment is tested

class AuthenticationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed roles if your registration/login depends on specific roles existing
        // Or if you want to assign a default role during registration for testing.
        // For now, assuming roles are not strictly required for basic registration itself,
        // but they will be for role-specific access tests.
        // $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
    }

    public function test_user_can_register_successfully(): void
    {
        $password = 'password123';
        $userData = [
            'email' => $this->faker->unique()->safeEmail,
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201)
                 ->assertJson(['message' => 'User successfully registered']);
        $this->assertDatabaseHas('users', ['email' => $userData['email']]);
    }

    public function test_user_cannot_register_with_existing_email(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        $password = 'password123';
        $userData = [
            'email' => 'test@example.com', // Existing email
            'password' => $password,
            'password_confirmation' => $password,
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(400) // Or 422 if that's what your validator returns
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_user_cannot_register_with_password_mismatch(): void
    {
        $userData = [
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'password123',
            'password_confirmation' => 'differentpassword',
        ];

        $response = $this->postJson('/api/auth/register', $userData);
        $response->assertStatus(400) // Or 422
                 ->assertJsonValidationErrors(['password']);
    }

    public function test_user_can_login_with_correct_credentials(): void
    {
        $password = 'password123';
        $user = User::factory()->create([
            'password' => bcrypt($password),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => $password,
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['access_token', 'token_type', 'expires_in']);
    }

    public function test_user_cannot_login_with_incorrect_credentials(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401) // From AuthController
                 ->assertJson(['error' => 'Unauthorized: Invalid credentials']);
    }

    public function test_inactive_user_cannot_login(): void
    {
        $password = 'password123';
        $user = User::factory()->create([
            'password' => bcrypt($password),
            'is_active' => false, // Inactive user
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => $password,
        ]);

        $response->assertStatus(401)
                 ->assertJson(['error' => 'Unauthorized: User account is inactive.']);
    }
}
