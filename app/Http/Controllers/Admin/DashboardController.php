<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'products' => Product::count(),
                'activeProducts' => Product::where('is_active', true)->count(),
                'categories' => Category::count(),
                'lowStockProducts' => Product::where('is_active', true)->where('stock', '<=', 5)->count(),
            ],
            'recentProducts' => Product::with('category:id,name')
                ->latest()
                ->limit(5)
                ->get(['id', 'category_id', 'name', 'price', 'stock', 'is_active', 'created_at']),
        ]);
    }
}
