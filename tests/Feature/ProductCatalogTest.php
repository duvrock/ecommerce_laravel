<?php

namespace Tests\Feature;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\StoreProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
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

        $this->expectException(\Illuminate\Database\QueryException::class);

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
}
