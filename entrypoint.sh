#!/bin/sh
set -e

export DATABASE_URL="file:/data/prod.db"

npx prisma migrate deploy

exec node dist/app.js
