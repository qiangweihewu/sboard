<?php

namespace Tests\Feature\Admin;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Plan;
use Tymon\JWTAuth\Facades\JWTAuth;

class PlanManagementTest extends TestCase
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

        Plan::factory(3)->create(); // Create some plans
    }

    public function test_admin_can_list_plans(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
                         ->getJson('/api/admin/plans');
        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data');
    }

    public function test_regular_user_cannot_list_plans(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->userToken)
                         ->getJson('/api/admin/plans');
        $response->assertStatus(403);
    }
}
