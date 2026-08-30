# syntax=docker/dockerfile:1.7

FROM php:8.4-cli-trixie AS php-development

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_CACHE_DIR=/tmp/composer/cache

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        libfreetype6-dev \
        libicu-dev \
        libjpeg62-turbo-dev \
        libonig-dev \
        libpng-dev \
        libpq-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        exif \
        gd \
        intl \
        mbstring \
        opcache \
        pcntl \
        pdo_pgsql \
        pgsql \
        zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY docker/local/php.ini /usr/local/etc/php/conf.d/blackframe-local.ini
COPY docker/local/setup.sh /usr/local/bin/blackframe-local-setup

RUN sed -i 's/\r$//' /usr/local/bin/blackframe-local-setup \
    && chmod 0755 /usr/local/bin/blackframe-local-setup

WORKDIR /var/www/html

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000", "--no-reload"]

FROM node:22-bookworm-slim AS node-development

COPY docker/local/vite-entrypoint.sh /usr/local/bin/blackframe-vite

RUN sed -i 's/\r$//' /usr/local/bin/blackframe-vite \
    && chmod 0755 /usr/local/bin/blackframe-vite

WORKDIR /var/www/html

EXPOSE 5173

ENTRYPOINT ["blackframe-vite"]
