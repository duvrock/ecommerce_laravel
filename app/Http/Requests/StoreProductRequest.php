<?php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (trim((string) $this->input('slug')) !== '') {
            return;
        }

        $baseSlug = Str::slug((string) $this->input('name'));

        if ($baseSlug === '') {
            return;
        }

        $product = $this->route('product');
        $productId = $product instanceof Product ? $product->getKey() : null;
        $slug = Str::substr($baseSlug, 0, 255);
        $suffix = 2;

        while (
            Product::query()
                ->where('slug', $slug)
                ->when($productId, fn ($query) => $query->whereKeyNot($productId))
                ->exists()
        ) {
            $ending = '-'.$suffix++;
            $slug = rtrim(Str::substr($baseSlug, 0, 255 - strlen($ending)), '-').$ending;
        }

        $this->merge(['slug' => $slug]);
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'alpha_dash',
                'max:255',
                Rule::unique('products', 'slug')->ignore($this->route('product')),
            ],
            'description' => ['nullable', 'string', 'max:10000'],
            'price' => ['required', 'numeric', 'decimal:0,2', 'gt:0', 'max:99999999.99'],
            'stock' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'image_path' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'images' => ['sometimes', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
