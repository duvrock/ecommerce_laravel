<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'public_id',
        'user_id',
        'customer_name',
        'email',
        'phone',
        'address',
        'city',
        'postal_code',
        'notes',
        'total',
        'status',
    ];

    protected function casts(): array
    {
        return ['total' => 'decimal:2'];
    }

    public function getRouteKeyName(): string
    {
        return 'public_id';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
