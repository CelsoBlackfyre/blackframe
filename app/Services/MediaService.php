<?php

namespace App\Services;

use App\Models\Media;
use App\Models\Post;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class MediaService
{
    private const POST_DISK = 'public';

    public function storePostImage(Post $post, UploadedFile $file, string $altText): Media
    {
        $path = $file->store('posts/'.$post->user_id, self::POST_DISK);

        if (! $path) {
            throw new RuntimeException('The image could not be stored.');
        }

        [$width, $height] = $this->dimensions($file);

        try {
            return $post->media()->create([
                'disk' => self::POST_DISK,
                'path' => $path,
                'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                'order' => 0,
                'width' => $width,
                'height' => $height,
                'alt_text' => $altText,
            ]);
        } catch (Throwable $exception) {
            Storage::disk(self::POST_DISK)->delete($path);

            throw $exception;
        }
    }

    /**
     * @return array{0: int|null, 1: int|null}
     */
    private function dimensions(UploadedFile $file): array
    {
        $dimensions = @getimagesize($file->getRealPath());

        if (! $dimensions) {
            return [null, null];
        }

        return [$dimensions[0], $dimensions[1]];
    }
}
