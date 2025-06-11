<?php

namespace Tests\Feature\Admin;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Tymon\JWTAuth\Facades\JWTAuth; // For generating tokens

class UserManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $adminUser;
    private User $regularUser;
    private Role $adminRole;
    private Role $userRole;
    private string $adminToken;
    private string $userToken;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);

        $this->adminRole = Role::where('name', 'ADMIN')->firstOrFail();
        $this->userRole = Role::where('name', 'USER')->firstOrFail();

        // Create an admin user
        $this->adminUser = User::factory()->create([
            'role_id' => $this->adminRole->id,
            'is_active' => true,
        ]);
        $this->adminToken = JWTAuth::fromUser($this->adminUser);

        // Create a regular user
        $this->regularUser = User::factory()->create([
            'role_id' => $this->userRole->id,
            'is_active' => true,
        ]);
        $this->userToken = JWTAuth::fromUser($this->regularUser);
    }

    // Test listing users
    public function test_admin_can_list_users(): void
    {
        User::factory(5)->create(['role_id' => $this->userRole->id]); // Create some more users
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
                         ->getJson('/api/admin/users');
        $response->assertStatus(200)
                 ->assertJsonStructure(['data', 'current_page', 'total'])
                 ->assertJsonCount(5 + 2, 'data'); // 5 created + admin + regular user
    }

    public function test_regular_user_cannot_list_users(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->userToken)
                         ->getJson('/api/admin/users');
        $response->assertStatus(403); // Forbidden due to RoleMiddleware
    }

    public function test_unauthenticated_user_cannot_list_users(): void
    {
        $response = $this->getJson('/api/admin/users');
        $response->assertStatus(401); // Unauthorized
    }

    // Test creating a user
    public function test_admin_can_create_user(): void
    {
        $password = 'newPassword123';
        $newUserData = [
            'email' => $this->faker->unique()->safeEmail,
            'password' => $password,
            'password_confirmation' => $password,
            'role_id' => $this->userRole->id,
            'is_active' => true,
        ];
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
                         ->postJson('/api/admin/users', $newUserData);
        $response->assertStatus(201)
                 ->assertJsonPath('email', $newUserData['email'])
                 ->assertJsonPath('role.id', $this->userRole->id);
        $this->assertDatabaseHas('users', ['email' => $newUserData['email']]);
    }

    // Test showing a user
    public function test_admin_can_show_user(): void
    {
        $targetUser = User::factory()->create(['role_id' => $this->userRole->id]);
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
                         ->getJson("/api/admin/users/{$targetUser->id}");
        $response->assertStatus(200)
                 ->assertJsonPath('id', $targetUser->id);
    }

    // Test updating a user
    public function test_admin_can_update_user(): void
    {
        $targetUser = User::factory()->create(['role_id' => $this->userRole->id]);
        $updateData = [
            'email' => $this->faker->unique()->safeEmail,
            'is_active' => false,
            'role_id' => $this->adminRole->id, // Change role to admin
        ];
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
                         ->putJson("/api/admin/users/{$targetUser->id}", $updateData);
        $response->assertStatus(200)
                 ->assertJsonPath('email', $updateData['email'])
                 ->assertJsonPath('is_active', false)
                 ->assertJsonPath('role.id', $this->adminRole->id);
        $this->assertDatabaseHas('users', ['id' => $targetUser->id, 'email' => $updateData['email'], 'is_active' => false, 'role_id' => $this->adminRole->id]);
    }

    // Test deleting a user
    public function test_admin_can_delete_user(): void
    {
        $targetUser = User::factory()->create(['role_id' => $this->userRole->id]);
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
                         ->deleteJson("/api/admin/users/{$targetUser->id}");
        $response->assertStatus(204); // No Content
        $this->assertDatabaseMissing('users', ['id' => $targetUser->id]);
    }

    public function test_admin_cannot_delete_self(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
                         ->deleteJson("/api/admin/users/{$this->adminUser->id}");
        $response->assertStatus(403)
                 ->assertJson(['error' => 'You cannot delete yourself.']);
    }
}
