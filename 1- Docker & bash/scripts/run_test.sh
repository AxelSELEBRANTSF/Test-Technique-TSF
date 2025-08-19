#!/usr/bin/env bash
set -euo pipefail

docker exec -it movieapp-backend bash -lc "php -v; composer install; php bin/phpunit"
