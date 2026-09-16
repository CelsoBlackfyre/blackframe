<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LocaleController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'locale' => ['required', 'string', Rule::in(array_keys(config('localization.supported')))],
        ]);

        $request->session()->put('locale', $data['locale']);

        return back()->withCookie(cookie()->forever(config('localization.cookie'), $data['locale']));
    }
}
