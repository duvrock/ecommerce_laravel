<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\ShoppingCart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(private readonly ShoppingCart $cart) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Storefront/Cart', [
            'appName' => config('app.name'),
            'auth' => ['user' => $request->user()?->only('name')],
            'categories' => $this->cart->categories(),
            'cart' => $this->cart->contents($request),
        ]);
    }

    public function store(Request $request, Product $product): RedirectResponse
    {
        abort_unless($product->is_active && $product->category()->where('is_active', true)->exists(), 404);

        $validated = $request->validate([
            'quantity' => ['sometimes', 'integer', 'min:1', 'max:99'],
        ]);
        $quantity = (int) ($validated['quantity'] ?? 1);

        if ($product->stock < 1) {
            return back()->withErrors(['cart' => 'Produsul nu este disponibil momentan în stoc.']);
        }

        $items = $request->session()->get('cart', []);
        $nextQuantity = ($items[$product->id] ?? 0) + $quantity;

        if ($nextQuantity > min($product->stock, 99)) {
            return back()->withErrors(['cart' => 'Cantitatea solicitată depășește stocul disponibil.']);
        }

        $items[$product->id] = $nextQuantity;
        $request->session()->put('cart', $items);

        return back()->with('status', 'Produsul a fost adăugat în coș.');
    }

    public function update(Request $request, int $productId): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);
        $product = Product::query()->findOrFail($productId);

        abort_unless($product->is_active && $product->category()->where('is_active', true)->exists(), 404);

        if ($validated['quantity'] > $product->stock) {
            return back()->withErrors(['cart' => 'Cantitatea solicitată depășește stocul disponibil.']);
        }

        $items = $request->session()->get('cart', []);

        if (! array_key_exists($product->id, $items)) {
            return back()->withErrors(['cart' => 'Produsul nu mai este în coș.']);
        }

        $items[$product->id] = (int) $validated['quantity'];
        $request->session()->put('cart', $items);

        return back()->with('status', 'Cantitatea a fost actualizată.');
    }

    public function destroy(Request $request, int $productId): RedirectResponse
    {
        $items = $request->session()->get('cart', []);
        unset($items[$productId]);
        if ($items === []) {
            $request->session()->forget('cart');
        } else {
            $request->session()->put('cart', $items);
        }

        return back()->with('status', 'Produsul a fost eliminat din coș.');
    }
}
