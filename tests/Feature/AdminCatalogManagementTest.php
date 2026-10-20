<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCatalogManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_admin_can_create_update_and_delete_categories(): void
    {
        $this->actingAs($this->admin());

        $this->post(route('admin.categories.store'), [
            'name' => 'Audio',
            'slug' => 'audio',
            'description' => 'Produse audio',
            'is_active' => true,
        ])->assertRedirect(route('admin.categories.index'));

        $category = Category::where('slug', 'audio')->firstOrFail();

        $this->put(route('admin.categories.update', $category), [
            'name' => 'Echipamente audio',
            'slug' => 'audio',
            'description' => 'Produse audio actualizate',
            'is_active' => false,
        ])->assertRedirect(route('admin.categories.index'));

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Echipamente audio',
            'slug' => 'audio',
            'is_active' => false,
        ]);

        $this->delete(route('admin.categories.destroy', $category))
            ->assertRedirect(route('admin.categories.index'));

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_category_with_products_cannot_be_deleted_from_admin(): void
    {
        $this->actingAs($this->admin());
        $category = Category::factory()->hasProducts(1)->create();

        $this->from(route('admin.categories.index'))
            ->delete(route('admin.categories.destroy', $category))
            ->assertRedirect(route('admin.categories.index'))
            ->assertSessionHasErrors('category');

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_admin_can_create_update_and_delete_products(): void
    {
        $this->actingAs($this->admin());
        $category = Category::factory()->create();

        $this->post(route('admin.products.store'), [
            'category_id' => $category->id,
            'name' => 'Căști wireless',
            'slug' => 'casti-wireless',
            'description' => 'Model Bluetooth',
            'price' => '129.90',
            'stock' => 5,
            'image_path' => 'products/headphones.jpg',
            'is_active' => true,
        ])->assertRedirect(route('admin.products.index'));

        $product = Product::where('slug', 'casti-wireless')->firstOrFail();

        $this->put(route('admin.products.update', $product), [
            'category_id' => $category->id,
            'name' => 'Căști wireless noi',
            'slug' => 'casti-wireless',
            'description' => 'Model actualizat',
            'price' => '149.90',
            'stock' => 8,
            'image_path' => 'products/headphones-new.jpg',
            'is_active' => false,
        ])->assertRedirect(route('admin.products.index'));

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Căști wireless noi',
            'price' => '149.90',
            'stock' => 8,
            'is_active' => false,
        ]);

        $this->delete(route('admin.products.destroy', $product))
            ->assertRedirect(route('admin.products.index'));

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_customer_cannot_access_admin_catalog_management(): void
    {
        $customer = User::factory()->create();
        $customer->roles()->attach(Role::where('slug', 'customer')->firstOrFail());

        $this->actingAs($customer)
            ->get(route('admin.categories.index'))
            ->assertForbidden();
    }

    private function admin(): User
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::where('slug', 'admin')->firstOrFail());

        return $admin;
    }
}
