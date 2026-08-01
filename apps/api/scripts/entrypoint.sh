#!/bin/sh
set -eu
/app/migrate
/app/seed || true
exec /app/server
