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

    protected $appends = ['url', 'thumb_url', 'medium_url'];

    protected function casts(): array
    {
        return [
            'variants' => 'array',
        ];
    }

    /**
     * @return array<string, array{path: string, width: int|null, height: int|null}>
     */
    public function variants(): array
    {
        return (array) $this->variants;
    }

    public function getThumbUrlAttribute(): string
    {
        return $this->variantUrl('thumb');
    }

    public function getMediumUrlAttribute(): string
    {
        return $this->variantUrl('medium');
    }

    public function variantUrl(string $variant): string
    {
        if ($this->disk === 'post-media' && array_key_exists($variant, $this->variants())) {
            return route('posts.media.show', [
                'post' => $this->mediaable_id,
                'media' => $this->getKey(),
            ]).'?variant='.$variant;
        }

        return $this->url;
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

        if ($this->disk === 'post-media') {
            return route('posts.media.show', [
                'post' => $this->mediaable_id,
                'media' => $this->getKey(),
            ]);
        }

        return Storage::disk($this->disk)->url($this->path);
    }
}
