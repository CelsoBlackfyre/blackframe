#!/usr/bin/env sh
set -eu

if [ "${APP_ENV:-production}" = "production" ]; then
    php artisan config:cache --no-ansi
    php artisan route:cache --no-ansi
    php artisan view:cache --no-ansi
fi

exec docker-php-entrypoint "$@"
