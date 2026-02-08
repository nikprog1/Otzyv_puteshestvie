# Настройка загрузки фото (Supabase Storage)
# lj,fdktybt ajn (добавление фото) — код заглушен (UPLOAD_STUBBED), не удалять

## Переменные окружения

Добавьте в `.env`:

- `NEXT_PUBLIC_SUPABASE_URL` — URL проекта Supabase (например `https://xxxxx.supabase.co`).
- `SUPABASE_SERVICE_ROLE_KEY` — сервисный ключ (Service Role) из настроек проекта Supabase (API → Project API keys). Нужен для записи и удаления в Storage.

## Bucket в Supabase

1. В панели Supabase: **Storage** → **New bucket**.
2. Имя: `uploads`.
3. **Public bucket** — включить, чтобы превью были доступны по публичным URL.
4. При необходимости настройте RLS-политики (по умолчанию при создании bucket можно разрешить чтение всем, запись — через service role в коде).

После этого загрузка аватарок и фото маршрутов будет сохранять файлы в `uploads` и отдавать публичные ссылки.
