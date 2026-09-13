<?php

namespace App\Services;

use App\Models\Media;
use App\Models\Post;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class MediaService
{
    private const POST_DISK = 'post-media';

    /**
     * @var array<string, int>
     */
    private const VARIANTS = [
        'thumb' => 480,
        'medium' => 1200,
    ];

    public function storePostImage(Post $post, UploadedFile $file, string $altText): Media
    {
        $path = $file->store('posts/'.$post->user_id, self::POST_DISK);

        if (! $path) {
            throw new RuntimeException('The image could not be stored.');
        }

        [$width, $height] = $this->dimensions($file);
        $variants = $this->storeVariants($file, $path);

        try {
            return $post->media()->create([
                'disk' => self::POST_DISK,
                'path' => $path,
                'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                'order' => 0,
                'width' => $width,
                'height' => $height,
                'alt_text' => $altText,
                'variants' => $variants,
            ]);
        } catch (Throwable $exception) {
            Storage::disk(self::POST_DISK)->delete($path);

            foreach ($variants as $variant) {
                Storage::disk(self::POST_DISK)->delete($variant['path']);
            }

            throw $exception;
        }
    }

    /**
     * Best-effort resized renditions; the post still works from the original
     * when generation fails, so only the failure is reported here.
     *
     * @return array<string, array{path: string, width: int|null, height: int|null}>
     */
    private function storeVariants(UploadedFile $file, string $originalPath): array
    {
        $source = @imagecreatefromstring((string) file_get_contents($file->getRealPath()));

        if ($source === false) {
            Log::warning('Image variant generation failed.', [
                'path' => $originalPath,
                'reason' => 'the upload could not be decoded as an image',
            ]);

            return [];
        }

        $variants = [];
        $directory = dirname($originalPath);
        $filename = pathinfo($originalPath, PATHINFO_FILENAME);

        try {
            foreach (self::VARIANTS as $name => $maxWidth) {
                try {
                    $sourceWidth = imagesx($source);
                    $sourceHeight = imagesy($source);
                    $width = min($maxWidth, $sourceWidth);
                    $height = max(1, (int) round($sourceHeight * ($width / $sourceWidth)));

                    $canvas = imagecreatetruecolor($width, $height);
                    imagealphablending($canvas, false);
                    imagesavealpha($canvas, true);
                    imagecopyresampled($canvas, $source, 0, 0, 0, 0, $width, $height, $sourceWidth, $sourceHeight);

                    ob_start();
                    imagewebp($canvas, null, 82);
                    $binary = (string) ob_get_clean();
                    imagedestroy($canvas);

                    if ($binary === '') {
                        throw new RuntimeException('imagewebp produced no output.');
                    }

                    $variantPath = $directory.'/'.$filename.'-'.$name.'.webp';
                    Storage::disk(self::POST_DISK)->put($variantPath, $binary);

                    $variants[$name] = [
                        'path' => $variantPath,
                        'width' => $width,
                        'height' => $height,
                    ];
                } catch (Throwable $exception) {
                    Log::warning('Image variant generation failed.', [
                        'variant' => $name,
                        'path' => $originalPath,
                        'exception' => $exception->getMessage(),
                    ]);
                }
            }
        } finally {
            imagedestroy($source);
        }

        return $variants;
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
