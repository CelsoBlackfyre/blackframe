<?php

namespace App\Models;

use App\Enums\ShelfStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSubject extends Model
{
    protected $fillable = [
        'subject_id',
        'status',
        'favorite',
        'rating',
        'progress',
    ];

    protected function casts(): array
    {
        return [
            'status' => ShelfStatus::class,
            'favorite' => 'boolean',
            'rating' => 'decimal:1',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
