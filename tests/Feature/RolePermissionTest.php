<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_role_users_relationship_returns_users_assigned_to_that_role(): void
    {
        $customerRole = Role::where('slug', 'customer')->firstOrFail();
        $customer = User::factory()->create();
        $admin = User::factory()->create();

        $customer->roles()->attach($customerRole);
        $admin->roles()->attach(Role::where('slug', 'admin')->firstOrFail());

        $this->assertTrue($customerRole->users->contains($customer));
        $this->assertFalse($customerRole->users->contains($admin));
    }

    public function test_role_and_permission_relationships_are_bidirectional(): void
    {
        $adminRole = Role::where('slug', 'admin')->firstOrFail();
        $permission = Permission::where('slug', 'manage-products')->firstOrFail();

        $this->assertTrue($adminRole->permissions->contains($permission));
        $this->assertTrue($permission->roles->contains($adminRole));
    }

    public function test_user_can_check_assigned_roles_and_permissions(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(Role::where('slug', 'admin')->firstOrFail());

        $this->assertTrue($user->hasRole('admin'));
        $this->assertFalse($user->hasRole('customer'));
        $this->assertTrue($user->hasPermissionTo('manage-products'));
        $this->assertFalse($user->hasPermissionTo('unknown-permission'));
    }
}
