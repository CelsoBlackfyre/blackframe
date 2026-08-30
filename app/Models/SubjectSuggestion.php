<?php

namespace App\Models;

use Database\Factories\SubjectSuggestionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubjectSuggestion extends Model
{
    /** @use HasFactory<SubjectSuggestionFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'name',
        'normalized_name',
        'source_url',
        'notes',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
