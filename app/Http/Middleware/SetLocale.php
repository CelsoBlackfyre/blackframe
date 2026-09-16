<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->resolve($request);

        App::setLocale($locale);
        Carbon::setLocale($locale);

        return $next($request);
    }

    /**
     * An explicit choice (session, then cookie) wins over the browser hint.
     * Guests land here too, so the public pages localise on first visit.
     */
    private function resolve(Request $request): string
    {
        $supported = array_keys(config('localization.supported'));

        $chosen = $request->session()->get('locale') ?? $request->cookie(config('localization.cookie'));

        if (is_string($chosen) && in_array($chosen, $supported, true)) {
            return $chosen;
        }

        if (config('localization.detect_from_browser')) {
            $preferred = $request->getPreferredLanguage(['en', 'pt']);

            if ($preferred === 'pt') {
                return 'pt_BR';
            }
        }

        return config('app.locale');
    }
}
