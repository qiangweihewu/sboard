<?php

namespace Tests\Feature\Admin;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\UserGroup;
use Tymon\JWTAuth\Facades\JWTAuth;

class UserGroupManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;
    private User $regularUser;
    private string $adminToken;
    private string $userToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        $adminRole = Role::where('name', 'ADMIN')->firstOrFail();
        $userRole = Role::where('name', 'USER')->firstOrFail();

        $this->adminUser = User::factory()->create(['role_id' => $adminRole->id]);
        $this->adminToken = JWTAuth::fromUser($this->adminUser);

        $this->regularUser = User::factory()->create(['role_id' => $userRole->id]);
        $this->userToken = JWTAuth::fromUser($this->regularUser);

        UserGroup::factory(3)->create(); // Create some user groups
    }

    public function test_admin_can_list_user_groups(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
                         ->getJson('/api/admin/user-groups');
        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data'); // Assuming pagination default shows these
    }

    public function test_regular_user_cannot_list_user_groups(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->userToken)
                         ->getJson('/api/admin/user-groups');
        $response->assertStatus(403);
    }
}
