<?php

namespace Tests\Feature;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\StoreProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProductCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_and_product_relationships_are_bidirectional(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create([
            'price' => '19.90',
            'stock' => 7,
        ]);

        $this->assertTrue($category->products->contains($product));
        $this->assertTrue($product->category->is($category));
        $this->assertSame('19.90', $product->fresh()->price);
        $this->assertSame(7, $product->fresh()->stock);
    }

    public function test_category_cannot_be_deleted_while_it_has_products(): void
    {
        $category = Category::factory()->hasProducts(1)->create();

        $this->expectException(QueryException::class);

        $category->delete();
    }

    public function test_category_request_validates_required_fields_and_slug_uniqueness(): void
    {
        Category::factory()->create(['slug' => 'audio']);

        $validator = Validator::make([
            'name' => 'Audio',
            'slug' => 'audio',
        ], (new StoreCategoryRequest)->rules());

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('slug', $validator->errors()->toArray());
    }

    public function test_product_request_rejects_invalid_category_price_and_stock(): void
    {
        $validator = Validator::make([
            'category_id' => 999,
            'name' => 'Product',
            'slug' => 'product',
            'price' => '0',
            'stock' => -1,
        ], (new StoreProductRequest)->rules());

        $this->assertTrue($validator->fails());

        $errors = $validator->errors()->toArray();
        $this->assertArrayHasKey('category_id', $errors);
        $this->assertArrayHasKey('price', $errors);
        $this->assertArrayHasKey('stock', $errors);
    }

    public function test_product_request_accepts_valid_catalog_data(): void
    {
        $category = Category::factory()->create();

        $validator = Validator::make([
            'category_id' => $category->id,
            'name' => 'Wireless Headphones',
            'slug' => 'wireless-headphones',
            'description' => 'Bluetooth headphones',
            'price' => '129.90',
            'stock' => 12,
            'is_active' => true,
        ], (new StoreProductRequest)->rules());

        $this->assertFalse($validator->fails(), $validator->errors()->toJson());
    }

    public function test_storefront_displays_active_products_and_categories(): void
    {
        $category = Category::factory()->create(['name' => 'Unelte', 'is_active' => true]);
        $product = Product::factory()->for($category)->create([
            'name' => 'Bormașină',
            'price' => '250.00',
            'is_active' => true,
        ]);
        Product::factory()->for($category)->create(['is_active' => false]);
        Product::factory()->for(Category::factory()->create(['is_active' => false]))->create();

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Welcome')
                ->where('appName', config('app.name'))
                ->where('products.total', 1)
                ->where('products.data.0.id', $product->id)
                ->where('categories.0.name', 'Unelte'));
    }

    public function test_storefront_filters_products_by_search_category_price_and_stock(): void
    {
        $category = Category::factory()->create(['name' => 'Unelte']);
        Product::factory()->for($category)->create([
            'name' => 'Bormașină',
            'price' => '250.00',
            'stock' => 4,
            'is_active' => true,
        ]);
        Product::factory()->for($category)->create([
            'name' => 'Șurubelniță',
            'price' => '20.00',
            'stock' => 0,
            'is_active' => true,
        ]);

        $this->get(route('home', [
            'search' => 'borma',
            'category' => $category->id,
            'min_price' => 100,
            'max_price' => 300,
            'availability' => 'in_stock',
            'sort' => 'price_asc',
        ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.search', 'borma')
                ->where('filters.category', $category->id)
                ->where('filters.availability', 'in_stock')
                ->where('filters.sort', 'price_asc')
                ->where('products.total', 1)
                ->where('products.data.0.name', 'Bormașină'));
    }

    public function test_storefront_product_detail_displays_the_product_gallery(): void
    {
        $category = Category::factory()->create(['is_active' => true]);
        $product = Product::factory()->for($category)->create([
            'slug' => 'trusa-scule',
            'image_path' => 'products/trusa-principala.jpg',
            'is_active' => true,
        ]);
        $product->images()->create(['image_path' => 'products/trusa-laterala.jpg']);

        $this->get(route('products.show', $product->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Storefront/Product')
                ->where('product.slug', 'trusa-scule')
                ->where('product.image_path', 'products/trusa-principala.jpg')
                ->has('product.images', 1)
                ->where('product.images.0.image_path', 'products/trusa-laterala.jpg'));
    }

    public function test_storefront_hides_inactive_product_details(): void
    {
        $product = Product::factory()->create(['is_active' => false]);

        $this->get(route('products.show', $product->slug))->assertNotFound();
    }
}
