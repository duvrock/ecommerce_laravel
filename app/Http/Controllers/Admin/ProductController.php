<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['all', 'active', 'inactive'])],
            'category' => ['nullable', 'integer', 'exists:categories,id'],
        ]);

        $search = trim($filters['search'] ?? '');
        $status = $filters['status'] ?? 'all';
        $categoryId = $filters['category'] ?? null;

        return Inertia::render('Admin/Products', [
            'products' => Product::query()
                ->with(['category', 'images'])
                ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhereHas('category', fn ($query) => $query->where('name', 'like', "%{$search}%"));
                }))
                ->when($status !== 'all', fn ($query) => $query->where('is_active', $status === 'active'))
                ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
                ->orderBy('name')
                ->paginate(10)
                ->withQueryString(),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'category' => $categoryId ? (int) $categoryId : null,
            ],
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $attributes = $request->safe()->except(['images']);
        $this->storeUploadedImage($request, $attributes);
        $product = Product::create($attributes);
        $this->storeGalleryImages($request, $product);

        return redirect()->route('admin.products.index')->with('status', 'Produsul a fost creat.');
    }

    public function update(StoreProductRequest $request, Product $product): RedirectResponse
    {
        $attributes = $request->safe()->except(['images']);
        $oldImage = $product->image_path;
        $this->storeUploadedImage($request, $attributes);
        $product->update($attributes);

        if (isset($attributes['image_path']) && $oldImage !== $attributes['image_path']) {
            $this->deleteUploadedImage($oldImage);
        }

        $this->storeGalleryImages($request, $product);

        return redirect()->route('admin.products.index')->with('status', 'Produsul a fost actualizat.');
    }

    public function destroyImage(Product $product, ProductImage $image): RedirectResponse
    {
        $path = $image->image_path;
        $image->delete();
        $this->deleteUploadedImage($path);

        return redirect()->route('admin.products.index')->with('status', 'Imaginea a fost ștearsă din galerie.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $image = $product->image_path;
        $galleryImages = $product->images()->pluck('image_path');
        $product->delete();
        $this->deleteUploadedImage($image);
        $galleryImages->each(fn (string $path) => $this->deleteUploadedImage($path));

        return redirect()->route('admin.products.index')->with('status', 'Produsul a fost șters.');
    }

    private function storeGalleryImages(StoreProductRequest $request, Product $product): void
    {
        foreach ($request->file('images', []) as $image) {
            $path = $image->store('products', 'public');

            if ($path === false) {
                throw new RuntimeException('Imaginea din galeria produsului nu a putut fi salvată.');
            }

            $product->images()->create(['image_path' => $path]);
        }
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function storeUploadedImage(StoreProductRequest $request, array &$attributes): void
    {
        if (! $request->hasFile('image')) {
            unset($attributes['image']);

            return;
        }

        $path = $request->file('image')->store('products', 'public');

        if ($path === false) {
            throw new RuntimeException('Imaginea produsului nu a putut fi salvată.');
        }

        $attributes['image_path'] = $path;
        unset($attributes['image']);
    }

    private function deleteUploadedImage(?string $path): void
    {
        if (
            $path === null
            || ! str_starts_with($path, 'products/')
            || Product::where('image_path', $path)->exists()
            || ProductImage::where('image_path', $path)->exists()
            || ! Storage::disk('public')->exists($path)
        ) {
            return;
        }

        if (! Storage::disk('public')->delete($path)) {
            throw new RuntimeException('Imaginea produsului nu a putut fi ștearsă din stocare.');
        }
    }
}
