# connect_to_Vercel

## Назначение
Набор переменных сетевого окружения для деплоя на Vercel с Supabase (PostgreSQL) через pooler.

## Переменные окружения (Vercel → Project → Settings → Environment Variables)
Заполните значения и добавьте в Production/Preview/Development при необходимости.

```
DATABASE_URL=postgresql://postgres.<PROJECT_REF>:<DB_PASSWORD>@<POOLER_HOST>:6543/postgres?sslmode=require&pgbouncer=true&statement_cache_size=0
DIRECT_URL=postgresql://postgres.<PROJECT_REF>:<DB_PASSWORD>@<POOLER_HOST>:6543/postgres?sslmode=require&pgbouncer=true&statement_cache_size=0
PRISMA_CLI_DATABASE_URL=postgresql://postgres.<PROJECT_REF>:<DB_PASSWORD>@<POOLER_HOST>:5432/postgres?pgbouncer=true&statement_cache_size=0&connection_limit=1&sslmode=disable
PRISMA_CLI_DIRECT_URL=postgresql://postgres.<PROJECT_REF>:<DB_PASSWORD>@<POOLER_HOST>:5432/postgres?pgbouncer=true&statement_cache_size=0&connection_limit=1&sslmode=disable
```

## Где взять значения
- `PROJECT_REF` — Supabase Project Ref.
- `POOLER_HOST` — Supabase → Database → Connection pooling → Transaction pooler host (IPv4).
- `DB_PASSWORD` — пароль базы Supabase.

## Примечания по стабильности
- Приложение работает через `DATABASE_URL` (transaction pooler, 6543).
- Prisma CLI и миграции используют только `PRISMA_CLI_*` (session pooler, 5432).
- Для pooler обязательны `pgbouncer=true` и `statement_cache_size=0`.
