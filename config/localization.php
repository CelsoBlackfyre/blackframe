<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Supported locales
    |--------------------------------------------------------------------------
    |
    | Locale codes are used for the lang/ catalogs and for app()->getLocale().
    | English is the source language: its strings are the translation keys, so
    | a missing pt_BR entry falls back to readable English instead of a key.
    |
    */

    'supported' => [
        'en' => 'English',
        'pt_BR' => 'Português (Brasil)',
    ],

    /*
    |--------------------------------------------------------------------------
    | Source locale
    |--------------------------------------------------------------------------
    |
    | The language the keys are written in. Only other locales need a catalog,
    | and this cannot be read from config('app.locale') because App::setLocale()
    | overwrites that value for the duration of the request.
    |
    */

    'source' => 'en',

    /*
    |--------------------------------------------------------------------------
    | Locale cookie
    |--------------------------------------------------------------------------
    |
    | A visitor's choice is kept in the session and in this cookie so it
    | survives sign-out, and so guests can pick a language too.
    |
    */

    'cookie' => 'locale',

    /*
    |--------------------------------------------------------------------------
    | Browser detection
    |--------------------------------------------------------------------------
    |
    | When enabled, first-time visitors are matched against their browser's
    | Accept-Language header. An explicit choice always wins.
    |
    */

    'detect_from_browser' => true,

];
