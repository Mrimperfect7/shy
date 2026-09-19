#!/usr/bin/env bash
# SHYNISH DB recovery — restores supervisor-managed Postgres with persistent
# data in /app/postgres-data after a pod restart wipes /etc and /var.
set -e
cp /app/postgres-supervisor.conf /etc/supervisor/conf.d/postgres.conf
supervisorctl reread && supervisorctl update || true
sleep 3
pg_isready
cd /app/frontend
npx prisma db push --skip-generate
node scripts/seed-showroom.mjs
node seed-admin.mjs
echo "DB READY"
