# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY public ./public
COPY resources ./resources
COPY tsconfig.json vite.config.js ./
RUN npm run build

FROM composer:2 AS php-dependencies

WORKDIR /app

COPY composer.json composer.lock artisan ./
COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY database ./database
COPY routes ./routes

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --optimize-autoloader \
    --prefer-dist

FROM php:8.4-apache-trixie AS php-extensions

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libfreetype6-dev \
        libicu-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
        libpq-dev \
        libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        gd \
        intl \
        pcntl \
        pdo_pgsql \
        pgsql \
        zip \
    && rm -rf /var/lib/apt/lists/*

FROM php:8.4-apache-trixie AS runtime

ENV APP_ENV=production \
    APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        libfreetype6 \
        libicu76 \
        libjpeg62-turbo \
        libpng16-16t64 \
        libpq5 \
        libzip5 \
    && a2enmod expires headers remoteip rewrite \
    && rm -rf /var/lib/apt/lists/*

COPY --from=php-extensions /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=php-extensions /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/

WORKDIR /var/www/html

COPY --chown=www-data:www-data . .
COPY --from=php-dependencies --chown=www-data:www-data /app/vendor ./vendor
COPY --from=frontend --chown=www-data:www-data /app/public/build ./public/build
COPY docker/production/apache-vhost.conf /etc/apache2/sites-available/blackframe.conf
COPY docker/production/php.ini /usr/local/etc/php/conf.d/blackframe.ini
COPY docker/production/entrypoint.sh /usr/local/bin/blackframe-entrypoint

RUN a2dissite 000-default \
    && a2ensite blackframe \
    && chmod 0755 /usr/local/bin/blackframe-entrypoint \
    && mkdir -p \
        bootstrap/cache \
        storage/app/post-media \
        storage/app/private \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
    && chown -R www-data:www-data bootstrap/cache storage \
    && php artisan package:discover --ansi \
    && php artisan storage:link

EXPOSE 80

ENTRYPOINT ["blackframe-entrypoint"]
CMD ["apache2-foreground"]
