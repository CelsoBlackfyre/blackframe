<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PostMediaController extends Controller
{
    public function __invoke(Request $request, Post $post, Media $media): StreamedResponse
    {
        Gate::authorize('view', $post);

        abort_unless(
            $media->mediaable_type === Post::class
            && $media->mediaable_id === $post->id
            && $media->disk === 'post-media',
            404,
        );
        abort_unless(in_array($media->mime_type, ['image/jpeg', 'image/png', 'image/webp'], true), 404);

        $variant = $request->string('variant')->toString();

        if ($variant !== '') {
            abort_unless(in_array($variant, ['thumb', 'medium'], true), 404);

            $variantData = $media->variants()[$variant] ?? null;
            abort_if($variantData === null, 404);

            return $this->respond($variantData['path'], 'image/webp', true);
        }

        abort_unless(Storage::disk('post-media')->exists($media->path), 404);

        return $this->respond($media->path, $media->mime_type, false);
    }

    private function respond(string $path, string $mimeType, bool $immutable): StreamedResponse
    {
        abort_unless(Storage::disk('post-media')->exists($path), 404);

        // Media for a given id never changes, but it sits behind view
        // authorization, so browsers may cache it while proxies must not.
        return Storage::disk('post-media')->response($path, null, [
            'Cache-Control' => $immutable ? 'private, max-age=31536000, immutable' : 'private, no-store',
            'Content-Type' => $mimeType,
            'Cross-Origin-Resource-Policy' => 'same-origin',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
