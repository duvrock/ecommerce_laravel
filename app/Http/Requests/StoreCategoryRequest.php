<?php

namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
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

        $category = $this->route('category');
        $categoryId = $category instanceof Category ? $category->getKey() : null;
        $slug = Str::substr($baseSlug, 0, 255);
        $suffix = 2;

        while (
            Category::query()
                ->where('slug', $slug)
                ->when($categoryId, fn ($query) => $query->whereKeyNot($categoryId))
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
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'alpha_dash',
                'max:255',
                Rule::unique('categories', 'slug')->ignore($this->route('category')),
            ],
            'description' => ['nullable', 'string', 'max:10000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
