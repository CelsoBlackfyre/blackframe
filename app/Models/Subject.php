<?php

namespace App\Models;

use App\Enums\SubjectType;
use Database\Factories\SubjectFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    /** @use HasFactory<SubjectFactory> */
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'type',
        'name',
        'slug',
        'description',
        'image_url',
        'source',
        'source_id',
        'source_url',
        'imported_by',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'type' => SubjectType::class,
            'metadata' => 'array',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function shelfEntries(): HasMany
    {
        return $this->hasMany(UserSubject::class);
    }
}
