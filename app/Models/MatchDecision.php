<?php

namespace App\Models;

use App\Enums\MatchDecisionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchDecision extends Model
{
    protected $fillable = [
        'target_user_id',
        'decision',
    ];

    protected function casts(): array
    {
        return [
            'decision' => MatchDecisionType::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function targetUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }
}
