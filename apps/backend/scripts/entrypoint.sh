#!/bin/sh
set -e

echo "Running migrations..."
./node_modules/.bin/prisma migrate deploy
echo "🌱 Seeding admin users..."
node dist/prisma/seed-admin.js
echo "Starting server..."
exec node dist/src/main.js