#!/usr/bin/env bash
set -euo pipefail
docker exec -i mysql-db mysql -uroot -proot < db/00_init.sql
docker exec -i mysql-db mysql -uroot -proot < db/01_upgrade_auth_logs.sql
docker exec -i mysql-db mysql -uroot -proot < db/02_seed.sql
