<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    protected $fillable = [
        'disk',
        'path',
        'mime_type',
        'order',
        'width',
        'height',
        'alt_text',
        'variants',
    ];

    protected $appends = ['url'];

    protected function casts(): array
    {
        return [
            'variants' => 'array',
        ];
    }

    public function mediaable(): MorphTo
    {
        return $this->morphTo();
    }

    public function getUrlAttribute(): string
    {
        if ($this->disk === 'external') {
            return $this->path;
        }

        return Storage::disk($this->disk)->url($this->path);
    }
}
