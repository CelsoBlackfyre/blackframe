<?php

namespace App\Models;

use App\Enums\ShelfStatus;
use Illuminate\Database\Eloquent\Builder;
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

    /**
     * Restrict entries to subjects the given user has shelved as well.
     */
    public function scopeSharedWith(Builder $query, User $user): Builder
    {
        return $query->whereIn(
            'subject_id',
            UserSubject::query()->select('subject_id')->where('user_id', $user->id),
        );
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
