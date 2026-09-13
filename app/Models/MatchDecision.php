<?php

namespace App\Models;

use App\Enums\MatchDecisionType;
use Illuminate\Database\Eloquent\Model;

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
}
