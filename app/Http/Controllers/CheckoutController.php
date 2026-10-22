<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Services\ShoppingCart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(private readonly ShoppingCart $cart) {}

    public function create(Request $request): Response|RedirectResponse
    {
        $contents = $this->cart->contents($request);

        if ($contents['count'] === 0) {
            return redirect()->route('cart.index')->withErrors(['cart' => 'Coșul este gol.']);
        }

        if (! $contents['available']) {
            return redirect()->route('cart.index')->withErrors(['cart' => 'Verifică produsele și cantitățile din coș înainte de finalizarea comenzii.']);
        }

        return Inertia::render('Storefront/Checkout', [
            'appName' => config('app.name'),
            'auth' => ['user' => $request->user()?->only('name', 'email')],
            'categories' => $this->cart->categories(),
            'cart' => $contents,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:40'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:120'],
            'postal_code' => ['required', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);
        $cart = $request->session()->get('cart', []);

        if ($cart === []) {
            return redirect()->route('cart.index')->withErrors(['cart' => 'Coșul este gol.']);
        }

        $order = DB::transaction(function () use ($request, $validated, $cart): Order {
            $products = Product::query()
                ->with('category')
                ->whereIn('id', array_keys($cart))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');
            $totalCents = 0;

            foreach ($cart as $productId => $quantity) {
                $product = $products->get((int) $productId);

                if (! $product || ! $product->is_active || ! $product->category->is_active) {
                    throw ValidationException::withMessages([
                        'cart' => 'Unul dintre produsele din coș nu mai este disponibil.',
                    ]);
                }

                if ($product->stock < $quantity) {
                    throw ValidationException::withMessages([
                        'cart' => "Stoc insuficient pentru produsul {$product->name}.",
                    ]);
                }

                $totalCents += (int) round((float) $product->price * 100) * $quantity;
            }

            $order = Order::query()->create([
                'public_id' => (string) Str::uuid(),
                'user_id' => $request->user()?->id,
                'customer_name' => $validated['customer_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'city' => $validated['city'],
                'postal_code' => $validated['postal_code'],
                'notes' => $validated['notes'] ?? null,
                'total' => number_format($totalCents / 100, 2, '.', ''),
                'status' => 'pending',
            ]);

            foreach ($cart as $productId => $quantity) {
                $product = $products->get((int) $productId);
                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $quantity,
                ]);
                $product->decrement('stock', $quantity);
            }

            return $order;
        }, 3);

        $request->session()->forget('cart');

        return redirect()->route('checkout.complete', $order->public_id);
    }

    public function complete(Request $request, Order $order): Response
    {
        return Inertia::render('Storefront/OrderComplete', [
            'appName' => config('app.name'),
            'auth' => ['user' => $request->user()?->only('name')],
            'categories' => $this->cart->categories(),
            'order' => [
                'reference' => $order->public_id,
                'total' => $order->total,
            ],
        ]);
    }
}
