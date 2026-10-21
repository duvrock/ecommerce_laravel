<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
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

    public function test_admin_can_create_category_with_an_automatically_generated_slug(): void
    {
        $this->actingAs($this->admin());

        $this->post(route('admin.categories.store'), [
            'name' => 'Echipamente audio',
            'slug' => '',
            'is_active' => true,
        ])->assertRedirect(route('admin.categories.index'));

        $this->assertDatabaseHas('categories', [
            'name' => 'Echipamente audio',
            'slug' => 'echipamente-audio',
        ]);
    }

    public function test_automatically_generated_category_slugs_are_unique(): void
    {
        $this->actingAs($this->admin());
        Category::factory()->create([
            'name' => 'Echipamente audio',
            'slug' => 'echipamente-audio',
        ]);

        $this->post(route('admin.categories.store'), [
            'name' => 'Echipamente audio',
            'slug' => '',
            'is_active' => true,
        ])->assertRedirect(route('admin.categories.index'));

        $this->assertDatabaseHas('categories', [
            'name' => 'Echipamente audio',
            'slug' => 'echipamente-audio-2',
        ]);
    }

    public function test_admin_can_search_and_filter_categories(): void
    {
        $this->actingAs($this->admin());
        Category::factory()->create(['name' => 'Audio', 'slug' => 'audio', 'is_active' => true]);
        Category::factory()->create(['name' => 'Audio vechi', 'slug' => 'audio-vechi', 'is_active' => false]);
        Category::factory()->create(['name' => 'Video', 'slug' => 'video', 'is_active' => true]);

        $this->get(route('admin.categories.index', ['search' => 'audio', 'status' => 'active']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.search', 'audio')
                ->where('filters.status', 'active')
                ->where('categories.total', 1)
                ->where('categories.data.0.name', 'Audio'));
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

    public function test_admin_can_search_and_filter_products(): void
    {
        $this->actingAs($this->admin());
        $audio = Category::factory()->create(['name' => 'Audio']);
        $video = Category::factory()->create(['name' => 'Video']);
        Product::factory()->create([
            'category_id' => $audio->id,
            'name' => 'Căști',
            'slug' => 'casti',
            'is_active' => true,
        ]);
        Product::factory()->create([
            'category_id' => $video->id,
            'name' => 'Căști inactive',
            'slug' => 'casti-inactive',
            'is_active' => false,
        ]);

        $this->get(route('admin.products.index', [
            'search' => 'casti',
            'status' => 'active',
            'category' => $audio->id,
        ]))->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.search', 'casti')
                ->where('filters.status', 'active')
                ->where('filters.category', $audio->id)
                ->where('products.total', 1)
                ->where('products.data.0.name', 'Căști'));
    }

    public function test_admin_can_create_product_with_an_automatically_generated_slug(): void
    {
        $this->actingAs($this->admin());
        $category = Category::factory()->create();

        $this->post(route('admin.products.store'), [
            'category_id' => $category->id,
            'name' => 'Căști wireless',
            'slug' => '',
            'price' => '129.90',
            'stock' => 5,
            'is_active' => true,
        ])->assertRedirect(route('admin.products.index'));

        $this->assertDatabaseHas('products', [
            'name' => 'Căști wireless',
            'slug' => 'casti-wireless',
        ]);
    }

    public function test_automatically_generated_product_slugs_are_unique(): void
    {
        $this->actingAs($this->admin());
        $category = Category::factory()->create();
        Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Căști wireless',
            'slug' => 'casti-wireless',
        ]);

        $this->post(route('admin.products.store'), [
            'category_id' => $category->id,
            'name' => 'Căști wireless',
            'slug' => '',
            'price' => '129.90',
            'stock' => 5,
            'is_active' => true,
        ])->assertRedirect(route('admin.products.index'));

        $this->assertDatabaseHas('products', [
            'name' => 'Căști wireless',
            'slug' => 'casti-wireless-2',
        ]);
    }

    public function test_admin_can_upload_and_replace_product_images(): void
    {
        Storage::fake('public');
        $this->actingAs($this->admin());
        $category = Category::factory()->create();
        $productData = [
            'category_id' => $category->id,
            'name' => 'Căști wireless',
            'slug' => 'casti-wireless',
            'price' => '129.90',
            'stock' => 5,
            'is_active' => true,
        ];

        $this->post(route('admin.products.store'), [
            ...$productData,
            'image' => $this->fakePng('headphones.png'),
        ])->assertRedirect(route('admin.products.index'));

        $product = Product::where('slug', 'casti-wireless')->firstOrFail();
        $oldImage = $product->image_path;
        Storage::disk('public')->assertExists($oldImage);

        $this->put(route('admin.products.update', $product), [
            ...$productData,
            'image' => $this->fakePng('headphones-new.png'),
        ])->assertRedirect(route('admin.products.index'));

        $newImage = $product->fresh()->image_path;
        $this->assertNotSame($oldImage, $newImage);
        Storage::disk('public')->assertMissing($oldImage);
        Storage::disk('public')->assertExists($newImage);
    }

    public function test_admin_can_add_images_to_a_product_carousel_and_view_them(): void
    {
        Storage::fake('public');
        $this->actingAs($this->admin());
        $category = Category::factory()->create();

        $this->post(route('admin.products.store'), [
            'category_id' => $category->id,
            'name' => 'Boxă portabilă',
            'slug' => 'boxa-portabila',
            'price' => '249.90',
            'stock' => 4,
            'image' => $this->fakePng('boxa-principala.png'),
            'images' => [
                $this->fakePng('boxa-lateral.png'),
                $this->fakePng('boxa-spate.png'),
            ],
            'is_active' => true,
        ])->assertRedirect(route('admin.products.index'));

        $product = Product::where('slug', 'boxa-portabila')->firstOrFail();
        $this->assertNotNull($product->image_path);
        $this->assertCount(2, $product->images);
        Storage::disk('public')->assertExists($product->image_path);
        $product->images->each(fn ($image) => Storage::disk('public')->assertExists($image->image_path));

        $this->get(route('admin.products.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('products.data.0.image_path', $product->image_path)
                ->has('products.data.0.images', 2));
    }

    public function test_admin_can_remove_an_image_from_a_product_carousel(): void
    {
        Storage::fake('public');
        $this->actingAs($this->admin());
        $product = Product::factory()->create();
        $path = UploadedFile::fake()->createWithContent(
            'gallery.png',
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pXcAAAAASUVORK5CYII='),
        )->store('products', 'public');
        $image = $product->images()->create(['image_path' => $path]);

        $this->delete(route('admin.products.images.destroy', [$product, $image]))
            ->assertRedirect(route('admin.products.index'));

        $this->assertDatabaseMissing('product_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing($path);
    }

    private function fakePng(string $name): UploadedFile
    {
        return UploadedFile::fake()->createWithContent(
            $name,
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pXcAAAAASUVORK5CYII='),
        );
    }

    public function test_customer_cannot_access_admin_catalog_management(): void
    {
        $customer = User::factory()->create();
        $customer->roles()->attach(Role::where('slug', 'customer')->firstOrFail());

        $this->actingAs($customer)
            ->get(route('admin.categories.index'))
            ->assertForbidden();
    }

    public function test_admin_dashboard_exposes_catalog_navigation_permissions(): void
    {
        $category = Category::factory()->create();
        Product::factory()->create([
            'category_id' => $category->id,
            'stock' => 3,
            'is_active' => true,
        ]);

        $this->actingAs($this->admin())
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.user.permissions.manageCategories', true)
                ->where('auth.user.permissions.manageProducts', true)
                ->where('stats.products', 1)
                ->where('stats.activeProducts', 1)
                ->where('stats.categories', 1)
                ->where('stats.lowStockProducts', 1)
                ->has('recentProducts', 1));
    }

    private function admin(): User
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::where('slug', 'admin')->firstOrFail());

        return $admin;
    }
}
