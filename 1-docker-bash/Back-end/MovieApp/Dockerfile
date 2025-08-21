FROM php:8.3-cli
RUN apt-get update && apt-get install -y git unzip libicu-dev libzip-dev default-mysql-client && docker-php-ext-install pdo_mysql intl zip && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY composer.json composer.lock* ./
RUN composer install --no-interaction --no-scripts --no-progress || true
COPY . .
EXPOSE 8000
