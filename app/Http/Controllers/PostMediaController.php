<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\Post;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PostMediaController extends Controller
{
    public function __invoke(Post $post, Media $media): StreamedResponse
    {
        Gate::authorize('view', $post);

        abort_unless(
            $media->mediaable_type === Post::class
            && $media->mediaable_id === $post->id
            && $media->disk === 'post-media',
            404,
        );
        abort_unless(in_array($media->mime_type, ['image/jpeg', 'image/png', 'image/webp'], true), 404);

        abort_unless(Storage::disk('post-media')->exists($media->path), 404);

        return Storage::disk('post-media')->response($media->path, null, [
            'Cache-Control' => 'private, no-store',
            'Content-Type' => $media->mime_type,
            'Cross-Origin-Resource-Policy' => 'same-origin',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
