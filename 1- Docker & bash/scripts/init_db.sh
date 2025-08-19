#!/usr/bin/env bash
set -euo pipefail
docker exec -i mysql-db mysql -uroot -proot MovieApp < db/init.sql
if [ "${1-}" = "--with-test" ]; then
  docker exec -i mysql-db mysql -uroot -proot < db/init_test.sql
fi
