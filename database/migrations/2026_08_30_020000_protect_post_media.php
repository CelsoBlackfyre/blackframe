<?php

use App\Models\Post;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    public function up(): void
    {
        $this->move('public', 'post-media');
    }

    public function down(): void
    {
        $this->move('post-media', 'public');
    }

    private function move(string $from, string $to): void
    {
        DB::table('media')
            ->where('mediaable_type', Post::class)
            ->where('disk', $from)
            ->orderBy('id')
            ->each(function (object $media) use ($from, $to): void {
                if (Storage::disk($from)->exists($media->path)) {
                    $stream = Storage::disk($from)->readStream($media->path);

                    if (! is_resource($stream)) {
                        throw new RuntimeException('Unable to read post media while protecting stored uploads.');
                    }

                    try {
                        if (! Storage::disk($to)->writeStream($media->path, $stream)) {
                            throw new RuntimeException('Unable to write post media while protecting stored uploads.');
                        }
                    } finally {
                        fclose($stream);
                    }
                }

                DB::table('media')->where('id', $media->id)->update(['disk' => $to]);

                if (Storage::disk($from)->exists($media->path)) {
                    Storage::disk($from)->delete($media->path);
                }
            });
    }
};
