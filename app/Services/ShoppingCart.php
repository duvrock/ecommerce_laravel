<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Http\Request;

class ShoppingCart
{
    public function contents(Request $request): array
    {
        $cart = $request->session()->get('cart', []);
        $products = Product::query()
            ->with('category:id,name,is_active')
            ->whereIn('id', array_keys($cart))
            ->get()
            ->keyBy('id');

        $items = [];
        $count = 0;
        $totalCents = 0;

        foreach ($cart as $productId => $quantity) {
            $product = $products->get((int) $productId);
            $available = $product
                && $product->is_active
                && $product->category->is_active
                && $product->stock >= $quantity;

            $unitPrice = $product && $product->is_active && $product->category->is_active
                ? (float) $product->price
                : 0;
            $subtotalCents = $available ? (int) round($unitPrice * 100) * $quantity : 0;

            $items[] = [
                'id' => (int) $productId,
                'slug' => $product?->slug,
                'name' => $product?->name ?? 'Produs indisponibil',
                'image_path' => $product?->image_path,
                'price' => number_format($unitPrice, 2, '.', ''),
                'stock' => $product?->stock ?? 0,
                'quantity' => $quantity,
                'subtotal' => number_format($subtotalCents / 100, 2, '.', ''),
                'available' => (bool) $available,
            ];

            $count += $quantity;
            $totalCents += $subtotalCents;
        }

        return [
            'items' => $items,
            'count' => $count,
            'total' => number_format($totalCents / 100, 2, '.', ''),
            'available' => collect($items)->every(fn (array $item) => $item['available']),
        ];
    }

    public function categories(): array
    {
        return \App\Models\Category::query()
            ->where('is_active', true)
            ->withCount(['products' => fn ($query) => $query->where('is_active', true)])
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'is_active'])
            ->toArray();
    }
}
