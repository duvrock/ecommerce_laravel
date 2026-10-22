<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminOrderManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_admin_can_view_and_filter_orders(): void
    {
        $this->actingAs($this->admin());
        $first = $this->createOrder('Ana Client', 'ana@example.com', 'pending');
        $this->createOrder('Mihai Client', 'mihai@example.com', 'completed');

        $this->get(route('admin.orders.index', ['search' => 'ana', 'status' => 'pending']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Orders')
                ->where('filters.search', 'ana')
                ->where('filters.status', 'pending')
                ->where('orders.total', 1)
                ->where('orders.data.0.id', $first->id)
                ->has('orders.data.0.items', 1));
    }

    public function test_admin_cancelling_an_order_restores_stock_once(): void
    {
        $this->actingAs($this->admin());
        $product = Product::factory()->create(['stock' => 4]);
        $product->decrement('stock', 2);
        $order = $this->createOrder('Client', 'client@example.com', 'pending', $product, 2);

        $this->patch(route('admin.orders.update', $order), ['status' => 'cancelled'])
            ->assertRedirect(route('admin.orders.index'));
        $this->assertSame(4, $product->fresh()->stock);
        $this->assertSame('cancelled', $order->fresh()->status);

        $this->patch(route('admin.orders.update', $order), ['status' => 'cancelled'])
            ->assertRedirect(route('admin.orders.index'));
        $this->assertSame(4, $product->fresh()->stock);
    }

    public function test_cancelled_order_cannot_be_reopened(): void
    {
        $this->actingAs($this->admin());
        $order = $this->createOrder('Client', 'client@example.com', 'cancelled');

        $this->from(route('admin.orders.index'))
            ->patch(route('admin.orders.update', $order), ['status' => 'processing'])
            ->assertRedirect(route('admin.orders.index'))
            ->assertSessionHasErrors('status');
    }

    public function test_customer_cannot_access_order_management(): void
    {
        $customer = User::factory()->create();
        $customer->roles()->attach(Role::where('slug', 'customer')->firstOrFail());

        $this->actingAs($customer)
            ->get(route('admin.orders.index'))
            ->assertForbidden();
    }

    private function admin(): User
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::where('slug', 'admin')->firstOrFail());

        return $admin;
    }

    private function createOrder(
        string $name,
        string $email,
        string $status,
        ?Product $product = null,
        int $quantity = 1,
    ): Order {
        $order = Order::query()->create([
            'public_id' => fake()->uuid(),
            'customer_name' => $name,
            'email' => $email,
            'phone' => '0712345678',
            'address' => 'Strada Test 1',
            'city' => 'București',
            'postal_code' => '010101',
            'total' => '100.00',
            'status' => $status,
        ]);
        $product ??= Product::factory()->for(Category::factory())->create();
        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => $product->price,
            'quantity' => $quantity,
        ]);

        return $order;
    }
}
