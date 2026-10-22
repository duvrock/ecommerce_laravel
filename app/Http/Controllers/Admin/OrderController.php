<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    private const STATUSES = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['all', ...self::STATUSES])],
        ]);
        $search = trim($filters['search'] ?? '');
        $status = $filters['status'] ?? 'all';

        return Inertia::render('Admin/Orders', [
            'orders' => Order::query()
                ->with('items:id,order_id,product_id,product_name,unit_price,quantity')
                ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                    $query->where('public_id', 'like', "%{$search}%")
                        ->orWhere('customer_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                }))
                ->when($status !== 'all', fn ($query) => $query->where('status', $status))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'filters' => ['search' => $search, 'status' => $status],
            'statuses' => self::STATUSES,
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(self::STATUSES)],
        ]);

        DB::transaction(function () use ($order, $validated): void {
            $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->id);
            $nextStatus = $validated['status'];

            if ($lockedOrder->status === 'cancelled' && $nextStatus !== 'cancelled') {
                throw ValidationException::withMessages([
                    'status' => 'O comandă anulată nu poate fi redeschisă, deoarece stocul a fost deja restituit.',
                ]);
            }

            if ($lockedOrder->status !== 'cancelled' && $nextStatus === 'cancelled') {
                foreach ($lockedOrder->items()->whereNotNull('product_id')->get() as $item) {
                    Product::query()
                        ->whereKey($item->product_id)
                        ->lockForUpdate()
                        ->increment('stock', $item->quantity);
                }
            }

            $lockedOrder->update(['status' => $nextStatus]);
        }, 3);

        return redirect()->route('admin.orders.index')->with('status', 'Statusul comenzii a fost actualizat.');
    }
}
