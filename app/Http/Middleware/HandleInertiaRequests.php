<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'direct' => [
                'unread_count' => fn () => $request->user()
                    ? (int) DB::table('conversation_user')
                        ->where('user_id', $request->user()->id)
                        ->sum('unread_count')
                    : 0,
            ],
            'reverb' => fn () => [
                'key' => config('broadcasting.default') === 'reverb'
                    ? config('broadcasting.connections.reverb.key')
                    : null,
                'host' => (string) (config('broadcasting.connections.reverb.options.host') ?? 'localhost'),
                'port' => (int) (config('broadcasting.connections.reverb.options.port') ?? 443),
                'scheme' => (string) (config('broadcasting.connections.reverb.options.scheme') ?? 'https'),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],
        ];
    }
}
