#!/usr/bin/env sh
set -eu

if [ ! -f .env ]; then
    cp .env.example .env
fi

mkdir -p \
    bootstrap/cache \
    storage/app/post-media \
    storage/app/private \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs

composer install --no-interaction --no-progress --prefer-dist

if ! grep -Eq '^APP_KEY=base64:.+' .env; then
    php artisan key:generate --force --no-interaction --no-ansi
fi

php artisan optimize:clear --no-ansi
php artisan migrate --force --no-interaction --no-ansi
php artisan storage:link --force --no-interaction --no-ansi
