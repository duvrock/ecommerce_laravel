<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $customer = Role::updateOrCreate(
            ['slug' => 'customer'],
            ['name' => 'Client'],
        );

        $admin = Role::updateOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Administrator'],
        );

        $permissions = collect([
            'access-admin' => 'Acces la panoul de administrare',
            'manage-products' => 'Gestionare produse',
            'manage-categories' => 'Gestionare categorii',
            'manage-orders' => 'Gestionare comenzi',
            'manage-customers' => 'Gestionare clienți',
            'manage-content' => 'Gestionare conținut',
            'manage-settings' => 'Gestionare setări',
            'manage-admin-users' => 'Gestionare administratori',
        ])->map(fn (string $name, string $slug) => Permission::updateOrCreate(
            ['slug' => $slug],
            ['name' => $name],
        ));

        $admin->permissions()->sync($permissions->pluck('id')->all());
        $customer->permissions()->detach();
    }
}
