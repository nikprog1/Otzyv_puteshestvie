# Otzyv_puteshestvie
Отзывы на маршруты проверенных маршрутов путешествий

## Подключение Supabase (pooler)
- Приложение использует `DATABASE_URL` (transaction pooler, порт 6543).
- Команды Prisma CLI должны использовать `PRISMA_CLI_DATABASE_URL` и `PRISMA_CLI_DIRECT_URL` (session pooler, порт 5432).

Эта настройка нужна, чтобы `prisma db execute` и миграции работали стабильно.

## Команды (PowerShell)
- Выполнить SQL сидера (создание таблицы и вставка строк):
  - `.\scripts\seed_notes.ps1`

## view-db (выбор БД + CRUD)
- Цель: выбрать `local` или `prod`, загрузить список таблиц и работать с данными.
- UI: выбор БД, список таблиц с кнопкой «Открыть», таблица с пагинацией и CRUD.
- API:
  - `GET /api/db/tables?target=local|prod`
  - `GET /api/db/table?target=...&name=...&page=...&pageSize=...`
  - `POST /api/db/table` (create)
  - `PATCH /api/db/table` (update by PK)
  - `DELETE /api/db/table` (delete by PK)

## Локальная БД для view-db (.env)
- Источник: `.env`.
- Переменные:
  - `LOCAL_DATABASE_URL` — локальная БД для `target=local`.
  - `PROD_DATABASE_URL` — рабочая БД для `target=prod`.
- Если нужен быстрый запуск на локальной базе, допускается:
  - `LOCAL_DATABASE_URL` = `DATABASE_URL` (без изменения секретов в коде).

## Локальный прогон
- Требования: заданы `LOCAL_DATABASE_URL` и `PROD_DATABASE_URL`.
- Запуск: `npm run dev`.

## Проверки
- `local`: открыть список таблиц, проверить пагинацию и CRUD на 1 таблице.
- `prod`: переключить `target=prod`, убедиться, что таблицы загружаются.

## Auth.js (Google OAuth)
- Переменные окружения:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `AUTH_SECRET`
  - `DATABASE_URL`
- Страницы:
  - `/login` — вход через Google.
  - `/dashboard`, `/my-routes` — доступны только после входа (проверка сессии в страницах, без middleware).

## Личный кабинет (dashboard)
- **Миграция:** таблица «Избранное» (Favorite). Применить: `npx prisma migrate deploy` (или вручную выполнить SQL из `prisma/migrations/20260221120000_add_favorite/migration.sql`).
- **ENV:** те же, что для Auth.js (`DATABASE_URL`, `AUTH_SECRET`, Google OAuth). Категория «General» создаётся автоматически при первом создании маршрута.
- **Страницы:**
  - `/dashboard` — «Мои маршруты»: список своих маршрутов, поиск (debounce 300 ms), пагинация по 10, кнопка «+ Новый маршрут».
  - `/dashboard/public` — публичные маршруты (visibility === PUBLIC); у владельца — редактирование, удаление, переключатель публичный/приватный.
  - `/dashboard/favorites` — маршруты, добавленные в избранное.
  - `/dashboard/history`, `/dashboard/settings` — заглушки «Скоро».
- **Проверка:** войти → создать маршрут → отредактировать → переключить публичный/приватный → добавить в избранное (звезда) → удалить (на своей карточке).
- **Файлы:** `prisma/schema.prisma` (модель Favorite, связь User.favorites), миграция `20260221120000_add_favorite`, `app/dashboard/layout.tsx`, `app/dashboard/components/DashboardSidebar.tsx`, `PromptCard.tsx`, `PromptDialog.tsx`, `SearchInput.tsx`, `MyRoutesContent.tsx`, `PublicRoutesContent.tsx`, `FavoritesContent.tsx`, `app/dashboard/actions.ts`, страницы `page.tsx` в `dashboard`, `dashboard/public`, `dashboard/favorites`, `dashboard/history`, `dashboard/settings`.