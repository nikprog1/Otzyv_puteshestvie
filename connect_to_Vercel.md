# connect_to_Vercel

## Назначение
Набор переменных сетевого окружения для деплоя на Vercel с Supabase (PostgreSQL) через pooler.

## Переменные окружения (Vercel → Project → Settings → Environment Variables)
Заполните значения и добавьте в Production/Preview/Development при необходимости.

```
DATABASE_URL=postgresql://postgres.<PROJECT_REF>:<DB_PASSWORD>@<POOLER_HOST>:6543/postgres?sslmode=require&pgbouncer=true&statement_cache_size=0
DIRECT_URL=postgresql://postgres.<PROJECT_REF>:<DB_PASSWORD>@<POOLER_HOST>:6543/postgres?sslmode=require&pgbouncer=true&statement_cache_size=0
PRISMA_CLI_DATABASE_URL=postgresql://postgres.<PROJECT_REF>:<DB_PASSWORD>@<POOLER_HOST>:5432/postgres?pgbouncer=true&statement_cache_size=0&connection_limit=1&sslmode=disable

AUTH_SECRET=<длинная случайная строка, см. AUTH_SETUP.md>
GOOGLE_CLIENT_ID=<из Google Cloud Console>
GOOGLE_CLIENT_SECRET=<из Google Cloud Console>
```

**Важно:** Без `AUTH_SECRET` в production на Vercel появляются 500 на `/api/auth/session` и ошибка «Configuration» при входе. Сгенерировать секрет: `openssl rand -base64 32` или см. AUTH_SETUP.md. В Google Cloud Console в «Authorized redirect URIs» добавьте `https://<ваш-домен>.vercel.app/api/auth/callback/google`.

## Где взять значения
- `PROJECT_REF` — Supabase Project Ref.
- `POOLER_HOST` — Supabase → Database → Connection pooling → Transaction pooler host (IPv4).
- `DB_PASSWORD` — пароль базы Supabase.

## Примечания по стабильности
- Приложение работает через `DATABASE_URL` (transaction pooler, 6543).
- Prisma CLI и миграции используют только `PRISMA_CLI_*` (session pooler, 5432).
- Для pooler обязательны `pgbouncer=true` и `statement_cache_size=0`.
- `DIRECT_URL` использовать для Prisma Studio.
- Для view-db локальную БД брать из `LOCAL_DATABASE_URL` и указывать в неё ту же строку, что и `DIRECT_URL`.

## Успешный вход через Google (Vercel)
Полный список шагов до работающего входа и личного кабинета — см. AUTH_SETUP.md, раздел **6) Шаги до успешного входа (Vercel)** (переменные, redirect URI, поле `User.emailVerified`, миграция, деплой).
