<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CartCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_add_update_and_remove_cart_items(): void
    {
        $product = Product::factory()->create([
            'price' => '12.34',
            'stock' => 5,
            'is_active' => true,
        ]);

        $this->post(route('cart.store', $product), ['quantity' => 2])
            ->assertRedirect();
        $this->assertSame(2, session('cart')[$product->id]);

        $this->get(route('cart.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Storefront/Cart')
                ->where('cartCount', 2)
                ->where('cart.count', 2)
                ->where('cart.total', '24.68'));

        $this->patch(route('cart.update', $product->id), ['quantity' => 3])
            ->assertRedirect();
        $this->assertSame(3, session('cart')[$product->id]);

        $this->delete(route('cart.destroy', $product->id))
            ->assertRedirect();
        $this->assertNull(session('cart'));
    }

    public function test_cart_rejects_quantities_above_available_stock(): void
    {
        $product = Product::factory()->create(['stock' => 2, 'is_active' => true]);

        $this->post(route('cart.store', $product), ['quantity' => 3])
            ->assertSessionHasErrors('cart');
        $this->assertSame([], session('cart', []));
    }

    public function test_guest_can_place_an_order_and_stock_is_decremented(): void
    {
        $product = Product::factory()->create([
            'name' => 'Trusă de scule',
            'price' => '19.95',
            'stock' => 6,
            'is_active' => true,
        ]);
        $this->withSession(['cart' => [$product->id => 2]]);

        $this->get(route('checkout.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Storefront/Checkout')
                ->where('cart.total', '39.90'));

        $this->post(route('checkout.store'), [
            'customer_name' => 'Client Test',
            'email' => 'client@example.com',
            'phone' => '0712345678',
            'address' => 'Strada Exemplu 10',
            'city' => 'București',
            'postal_code' => '010101',
            'notes' => 'Sunați înainte de livrare.',
        ])->assertRedirect();

        $order = Order::query()->with('items')->sole();
        $this->assertSame('39.90', $order->total);
        $this->assertSame('pending', $order->status);
        $this->assertSame(2, $order->items->sole()->quantity);
        $this->assertSame('19.95', $order->items->sole()->unit_price);
        $this->assertSame(4, $product->fresh()->stock);
        $this->assertNull(session('cart'));

        $this->get(route('checkout.complete', $order->public_id))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Storefront/OrderComplete')
                ->where('order.reference', $order->public_id)
                ->where('order.total', '39.90'));
    }

    public function test_checkout_rejects_an_order_if_stock_changed_after_adding_to_cart(): void
    {
        $product = Product::factory()->create(['stock' => 4, 'is_active' => true]);
        $this->withSession(['cart' => [$product->id => 3]]);
        $product->update(['stock' => 2]);

        $this->post(route('checkout.store'), [
            'customer_name' => 'Client Test',
            'email' => 'client@example.com',
            'phone' => '0712345678',
            'address' => 'Strada Exemplu 10',
            'city' => 'București',
            'postal_code' => '010101',
        ])->assertSessionHasErrors('cart');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(2, $product->fresh()->stock);
        $this->assertSame(3, session('cart')[$product->id]);
    }

    public function test_cart_cannot_add_inactive_products(): void
    {
        $product = Product::factory()->for(Category::factory()->state(['is_active' => false]))->create([
            'is_active' => true,
        ]);

        $this->post(route('cart.store', $product), ['quantity' => 1])->assertNotFound();
        $this->assertSame([], session('cart', []));
    }
}
