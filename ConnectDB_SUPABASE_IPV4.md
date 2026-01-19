# ConnectDB_SUPABASE_IPV4_OTZYV (Supabase IPv4 via pooler)

## Цель
Подключение к любому проекту Supabase по IPv4 без add-on, с pooler.
Конфигурация: приложение через transaction pooler (6543), Prisma CLI/миграции через session pooler (5432).

## Исходные данные (заменить плейсхолдеры)
PROJECT_REF="<PROJECT_REF>"
POOLER_HOST="<POOLER_HOST>" # Supabase -> Database -> Connection pooling -> Transaction pooler
DB_PASSWORD="<DB_PASSWORD>"

## Производные значения
POOLER_USER="postgres.$PROJECT_REF"
POOLER_PORT_TX="6543"
POOLER_PORT_SESS="5432"

## Проверка IPv4 (PowerShell)
Resolve-DnsName $POOLER_HOST -Type A
Test-NetConnection $POOLER_HOST -Port $POOLER_PORT_TX
Test-NetConnection $POOLER_HOST -Port $POOLER_PORT_SESS

## Строки подключения (шаблоны)
# Приложение (transaction pooler, IPv4)
APP_POOLER_URL="postgresql://$POOLER_USER:$DB_PASSWORD@$POOLER_HOST:$POOLER_PORT_TX/postgres?sslmode=require&pgbouncer=true&statement_cache_size=0"

# Prisma CLI/миграции (session pooler, IPv4)
# sslmode=disable используется для устойчивости CLI через pooler.
CLI_POOLER_URL="postgresql://$POOLER_USER:$DB_PASSWORD@$POOLER_HOST:$POOLER_PORT_SESS/postgres?pgbouncer=true&statement_cache_size=0&connection_limit=1&sslmode=disable"

## .env шаблон (IPv4 + pooler)
DATABASE_URL="$APP_POOLER_URL"
DIRECT_URL="$APP_POOLER_URL"
PRISMA_CLI_DATABASE_URL="$CLI_POOLER_URL"
PRISMA_CLI_DIRECT_URL="$CLI_POOLER_URL"

## Prisma config (CLI берёт только PRISMA_CLI_*)
## prisma.config.ts
## datasource: {
##   url: process.env["PRISMA_CLI_DATABASE_URL"],
##   directUrl: process.env["PRISMA_CLI_DIRECT_URL"],
## }
## Важно: не используйте DATABASE_URL/DIRECT_URL в Prisma CLI — через pooler
## возможны ошибки prepared statement или разрывы соединения.

## Проверка подключения (CLI)
.\scripts\load-env.ps1
@'
SELECT 1;
'@ | npx prisma db execute --stdin

## Оформление миграции Prisma (фиксация схемы)
# Генерация миграции из схемы (без доступа к БД)
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$folder = "prisma/migrations/${timestamp}_init"
New-Item -ItemType Directory -Force -Path $folder | Out-Null
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script | Set-Content -Path "$folder/migration.sql"

# Если таблица уже создана вручную, отметьте миграцию как применённую
# (может требовать активного соединения; на pooler advisory lock иногда даёт таймаут)
$migrationName = Split-Path $folder -Leaf
npx prisma migrate resolve --applied $migrationName

## Создание таблицы и заполнение (успешный путь)
# Используем Prisma CLI через session pooler (IPv4) и выполняем SQL напрямую.
@'
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE IF NOT EXISTS "Note" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "createdAt" timestamptz(3) NOT NULL DEFAULT now()
);

INSERT INTO "Note" ("title") VALUES
  ('Первая заметка'),
  ('Вторая заметка'),
  ('Третья заметка');
'@ | npx prisma db execute --stdin

## Шаблонные команды для миграций (PowerShell)
# Статус миграций
npx prisma migrate status

# Создание миграции (для разработки)
npx prisma migrate dev --name init

# Применение миграций (прод/CI)
npx prisma migrate deploy

# Применение схемы без миграций (опционально)
npx prisma db push

## Примечания
- pooler-host использовать вместо db.<project-ref>.supabase.co (часто IPv6-only).
- pgbouncer требует отключения prepared statements:
  - pgbouncer=true
  - statement_cache_size=0
