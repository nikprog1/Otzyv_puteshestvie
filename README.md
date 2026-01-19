# Otzyv_puteshestvie
Отзывы на маршруты проверенных маршрутов путешествий

## Подключение Supabase (pooler)
- Приложение использует `DATABASE_URL` (transaction pooler, порт 6543).
- Команды Prisma CLI должны использовать `PRISMA_CLI_DATABASE_URL` и `PRISMA_CLI_DIRECT_URL` (session pooler, порт 5432).

Эта настройка нужна, чтобы `prisma db execute` и миграции работали стабильно.

## Команды (PowerShell)
- Выполнить SQL сидера (создание таблицы и вставка строк):
  - `.\scripts\seed_notes.ps1`