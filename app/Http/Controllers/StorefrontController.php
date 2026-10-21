<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'integer', 'exists:categories,id'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0', 'gte:min_price'],
            'availability' => ['nullable', Rule::in(['all', 'in_stock'])],
            'sort' => ['nullable', Rule::in(['relevant', 'newest', 'price_asc', 'price_desc', 'name'])],
        ]);

        $search = trim($filters['search'] ?? '');
        $sort = $filters['sort'] ?? 'relevant';

        $products = Product::query()
            ->with('category:id,name,slug')
            ->where('is_active', true)
            ->whereHas('category', fn ($query) => $query->where('is_active', true))
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('category', fn ($query) => $query->where('name', 'like', "%{$search}%"));
            }))
            ->when($filters['category'] ?? null, fn ($query, $category) => $query->where('category_id', $category))
            ->when(isset($filters['min_price']), fn ($query) => $query->where('price', '>=', $filters['min_price']))
            ->when(isset($filters['max_price']), fn ($query) => $query->where('price', '<=', $filters['max_price']))
            ->when(($filters['availability'] ?? 'all') === 'in_stock', fn ($query) => $query->where('stock', '>', 0));

        match ($sort) {
            'newest' => $products->latest(),
            'price_asc' => $products->orderBy('price')->orderBy('name'),
            'price_desc' => $products->orderByDesc('price')->orderBy('name'),
            'name' => $products->orderBy('name'),
            default => $products->orderByDesc('created_at')->orderBy('name'),
        };

        return Inertia::render('Welcome', [
            'appName' => config('app.name'),
            'categories' => Category::query()
                ->where('is_active', true)
                ->withCount(['products' => fn ($query) => $query->where('is_active', true)])
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
            'products' => $products->paginate(12)->withQueryString(),
            'filters' => [
                'search' => $search,
                'category' => isset($filters['category']) ? (int) $filters['category'] : null,
                'min_price' => $filters['min_price'] ?? '',
                'max_price' => $filters['max_price'] ?? '',
                'availability' => $filters['availability'] ?? 'all',
                'sort' => $sort,
            ],
        ]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->is_active && $product->category()->where('is_active', true)->exists(), 404);

        $product->load(['category:id,name,slug', 'images:id,product_id,image_path']);

        return Inertia::render('Storefront/Product', [
            'appName' => config('app.name'),
            'auth' => ['user' => auth()->user()?->only('name')],
            'categories' => Category::query()
                ->where('is_active', true)
                ->withCount(['products' => fn ($query) => $query->where('is_active', true)])
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
            'product' => $product,
        ]);
    }
}
